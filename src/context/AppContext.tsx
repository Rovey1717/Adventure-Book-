import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { adventureRepository } from "@/data/adventure/AdventureRepository";
import { discoveryRepository } from "@/data/discovery/DiscoveryRepository";
import { graphRepository } from "@/data/graph/GraphRepository";
import { libraryRepository } from "@/data/library/LibraryRepository";
import { memoryRepository } from "@/data/memory/MemoryRepository";
import type { PendingDiscovery } from "@/domain/discovery/pending";
import type { JourneySnapshot } from "@/domain/journey/types";
import type { Memory } from "@/domain/memory/types";
import { getDemoLearningProfile } from "@/domain/parent/profile";
import { MemoryService } from "@/services/MemoryService";
import type { AdventureBoard } from "@/services/AdventureService";
import { AdventureService } from "@/services/AdventureService";
import type {
  CaptureResult,
  NamedDiscoveryLabel,
} from "@/services/DiscoveryJourneyService";
import { DiscoveryJourneyService } from "@/services/DiscoveryJourneyService";
import { DiscoveryService } from "@/services/DiscoveryService";
import { JourneyService } from "@/services/JourneyService";
import { LibraryService } from "@/services/LibraryService";
import { LearningAdventureService } from "@/services/learning/LearningAdventureService";
import { LearningGraphService } from "@/services/graph/LearningGraphService";

const discoveryService = new DiscoveryService(discoveryRepository);
const memoryService = new MemoryService(memoryRepository);
const adventureService = new AdventureService(adventureRepository);
const journeyService = new JourneyService(
  discoveryRepository,
  memoryRepository,
  adventureRepository,
);
const learningGraphService = new LearningGraphService(graphRepository);
const libraryService = new LibraryService(
  libraryRepository,
  learningGraphService,
);
const learningAdventureService = new LearningAdventureService(
  libraryService,
  learningGraphService,
);

/**
 * RecognitionService is reserved for a future enhancement.
 * MVP: families name discoveries manually.
 *
 * Discovery flow: save immediately → Celebrate Now | Continue Exploring
 * Learning Card is reusable from Adventure Book.
 */
const journeyOrchestrator = new DiscoveryJourneyService(
  discoveryService,
  memoryService,
  adventureService,
  journeyService,
  null,
);

type SavedToastState = { message: string } | null;

type AppContextValue = {
  memories: Memory[];
  adventureBoard: AdventureBoard;
  journey: JourneySnapshot | null;
  isProcessing: boolean;
  lastCapture: CaptureResult | null;
  pendingDiscovery: PendingDiscovery | null;
  savedToast: SavedToastState;
  library: LibraryService;
  learningGraph: LearningGraphService;
  refresh: () => Promise<void>;
  beginPhotoDiscovery: (uri: string) => PendingDiscovery;
  confirmNamedDiscovery: (label: NamedDiscoveryLabel) => Promise<CaptureResult>;
  clearPendingDiscovery: () => void;
  captureVideo: (uri: string) => Promise<CaptureResult>;
  captureVoice: (uri: string) => Promise<CaptureResult>;
  continueExploring: (objectName: string) => void;
  clearSavedToast: () => void;
  ensureLearningCard: (memoryId: string) => Promise<Memory | null>;
  markLearningViewed: (memoryId: string) => Promise<void>;
  completeLearningCard: (
    memoryId: string,
  ) => Promise<{
    id: string;
    title: string;
    emoji: string;
    subtitle: string;
  } | null>;
  markUnlockSeen: (memoryId: string) => Promise<void>;
  celebrateMemory: (memoryId: string) => Promise<void>;
  toggleFavorite: (memoryId: string) => Promise<void>;
  startAdventure: (adventureId: string) => Promise<void>;
  getMemory: (id: string) => Promise<Memory | null>;
  getAdventuresForMemory: (memoryId: string) => Promise<
    Awaited<ReturnType<AdventureService["getByMemoryId"]>>
  >;
  openLearningFromBook: (memoryId: string) => {
    pathname: "/learning/[id]";
    params: { id: string; celebrate?: string };
  };
};

const AppContext = createContext<AppContextValue | null>(null);

const emptyBoard: AdventureBoard = {
  newAdventures: [],
  continueAdventure: [],
  completed: [],
  suggested: [],
  recentlyUnlocked: [],
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [adventureBoard, setAdventureBoard] =
    useState<AdventureBoard>(emptyBoard);
  const [journey, setJourney] = useState<JourneySnapshot | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastCapture, setLastCapture] = useState<CaptureResult | null>(null);
  const [pendingDiscovery, setPendingDiscovery] =
    useState<PendingDiscovery | null>(null);
  const [savedToast, setSavedToast] = useState<SavedToastState>(null);

  const refresh = useCallback(async () => {
    const [nextMemories, board, snapshot] = await Promise.all([
      memoryService.list(),
      adventureService.getBoard(),
      journeyService.getSnapshot(),
    ]);
    learningGraphService.syncFromMemoryNames(
      nextMemories.map((item) => item.objectName),
    );
    for (const adventure of board.completed) {
      const node = learningGraphService.getNodeByName(adventure.objectName);
      if (node) learningGraphService.child.markAdventureCompleted(node.id);
    }
    setMemories(nextMemories);
    setAdventureBoard(board);
    setJourney(snapshot);
  }, []);

  const attachLearningCard = useCallback(async (memory: Memory) => {
    const names = (await memoryService.list()).map((item) => item.objectName);
    const profile = getDemoLearningProfile();
    const card = learningAdventureService.generateForMemory(memory, names, {
      age: profile.age,
      spanishEnabled: profile.spanishEnabled,
    });
    return memoryService.setLearningCard(memory.id, card);
  }, []);

  const runCapture = useCallback(
    async (work: () => Promise<CaptureResult>) => {
      setIsProcessing(true);
      try {
        const result = await work();
        // Generate Learning Adventure in the background immediately after save.
        const withCard = await attachLearningCard(result.memory);
        const nextResult = { ...result, memory: withCard };
        setLastCapture(nextResult);
        await refresh();
        return nextResult;
      } finally {
        setIsProcessing(false);
      }
    },
    [attachLearningCard, refresh],
  );

  const beginPhotoDiscovery = useCallback((uri: string) => {
    const pending = journeyOrchestrator.beginPhotoDiscovery(uri);
    setPendingDiscovery(pending);
    return pending;
  }, []);

  const confirmNamedDiscovery = useCallback(
    (label: NamedDiscoveryLabel) =>
      runCapture(async () => {
        const pending = pendingDiscovery;
        if (!pending) {
          throw new Error("No pending discovery to name");
        }
        const result = await journeyOrchestrator.saveNamedDiscovery(
          pending.mediaUri,
          label,
        );
        setPendingDiscovery(null);
        return result;
      }),
    [pendingDiscovery, runCapture],
  );

  const clearPendingDiscovery = useCallback(() => {
    setPendingDiscovery(null);
  }, []);

  const captureVideo = useCallback(
    (uri: string) => runCapture(() => journeyOrchestrator.captureVideo(uri)),
    [runCapture],
  );

  const captureVoice = useCallback(
    (uri: string) => runCapture(() => journeyOrchestrator.captureVoice(uri)),
    [runCapture],
  );

  const continueExploring = useCallback((objectName: string) => {
    setSavedToast({
      message: `${objectName} saved to Adventure Book`,
    });
  }, []);

  const clearSavedToast = useCallback(() => {
    setSavedToast(null);
  }, []);

  const ensureLearningCard = useCallback(
    async (memoryId: string) => {
      const memory = await memoryService.getById(memoryId);
      if (!memory) return null;
      if (memory.learningCard) return memory;
      const updated = await attachLearningCard(memory);
      await refresh();
      return updated;
    },
    [attachLearningCard, refresh],
  );

  const markLearningViewed = useCallback(
    async (memoryId: string) => {
      await memoryService.markCelebrated(memoryId);
      const memory = await memoryService.getById(memoryId);
      if (memory && memory.learningViewStatus === "never_viewed") {
        await memoryService.setLearningViewStatus(memoryId, "viewed");
      }
      await refresh();
    },
    [refresh],
  );

  const completeLearningCard = useCallback(
    async (memoryId: string) => {
      const memory = await memoryService.getById(memoryId);
      if (!memory) return null;
      await memoryService.setLearningViewStatus(memoryId, "completed");
      await memoryService.setAdventuresCompleted(
        memoryId,
        Math.max(1, memory.adventuresCompleted),
      );
      await refresh();
      if (memory.unlockPresented) return null;
      return memory.learningCard?.unlockCandidate ?? null;
    },
    [refresh],
  );

  const markUnlockSeen = useCallback(
    async (memoryId: string) => {
      await memoryService.markUnlockPresented(memoryId);
      await refresh();
    },
    [refresh],
  );

  const celebrateMemory = useCallback(
    async (memoryId: string) => {
      await memoryService.markCelebrated(memoryId);
      await refresh();
    },
    [refresh],
  );

  const toggleFavorite = useCallback(
    async (memoryId: string) => {
      const memory = await memoryService.getById(memoryId);
      if (!memory) return;
      await memoryService.toggleFavorite(memoryId, !memory.isFavorite);
      await refresh();
    },
    [refresh],
  );

  const startAdventure = useCallback(
    async (adventureId: string) => {
      await adventureService.start(adventureId);
      await refresh();
    },
    [refresh],
  );

  const getMemory = useCallback((id: string) => memoryService.getById(id), []);

  const getAdventuresForMemory = useCallback(
    (memoryId: string) => adventureService.getByMemoryId(memoryId),
    [],
  );

  const openLearningFromBook = useCallback((memoryId: string) => {
    const memory = memories.find((item) => item.id === memoryId);
    const playCelebration =
      !memory || memory.learningViewStatus === "never_viewed";
    return {
      pathname: "/learning/[id]" as const,
      params: playCelebration
        ? { id: memoryId, celebrate: "1" }
        : { id: memoryId },
    };
  }, [memories]);

  const value = useMemo<AppContextValue>(
    () => ({
      memories,
      adventureBoard,
      journey,
      isProcessing,
      lastCapture,
      pendingDiscovery,
      savedToast,
      library: libraryService,
      learningGraph: learningGraphService,
      refresh,
      beginPhotoDiscovery,
      confirmNamedDiscovery,
      clearPendingDiscovery,
      captureVideo,
      captureVoice,
      continueExploring,
      clearSavedToast,
      ensureLearningCard,
      markLearningViewed,
      completeLearningCard,
      markUnlockSeen,
      celebrateMemory,
      toggleFavorite,
      startAdventure,
      getMemory,
      getAdventuresForMemory,
      openLearningFromBook,
    }),
    [
      memories,
      adventureBoard,
      journey,
      isProcessing,
      lastCapture,
      pendingDiscovery,
      savedToast,
      refresh,
      beginPhotoDiscovery,
      confirmNamedDiscovery,
      clearPendingDiscovery,
      captureVideo,
      captureVoice,
      continueExploring,
      clearSavedToast,
      ensureLearningCard,
      markLearningViewed,
      completeLearningCard,
      markUnlockSeen,
      celebrateMemory,
      toggleFavorite,
      startAdventure,
      getMemory,
      getAdventuresForMemory,
      openLearningFromBook,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
}
