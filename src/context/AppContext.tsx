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
import { libraryRepository } from "@/data/library/LibraryRepository";
import { memoryRepository } from "@/data/memory/MemoryRepository";
import type { PendingDiscovery } from "@/domain/discovery/pending";
import type { JourneySnapshot } from "@/domain/journey/types";
import type { Memory } from "@/domain/memory/types";
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

const discoveryService = new DiscoveryService(discoveryRepository);
const memoryService = new MemoryService(memoryRepository);
const adventureService = new AdventureService(adventureRepository);
const journeyService = new JourneyService(
  discoveryRepository,
  memoryRepository,
  adventureRepository,
);
const libraryService = new LibraryService(libraryRepository);

/**
 * RecognitionService lives ready for a future optional enhancement.
 * MVP discovery never calls it — families name discoveries manually.
 *
 * To enable AI suggestions later without changing capture → name → save:
 *   1. Pass `new RecognitionService()` into DiscoveryJourneyService.
 *   2. Call suggestNameForPending() before showing the Name screen.
 *   3. Prefill the text input from pending.suggestedName.
 */
const journeyOrchestrator = new DiscoveryJourneyService(
  discoveryService,
  memoryService,
  adventureService,
  journeyService,
  null,
);

type AppContextValue = {
  memories: Memory[];
  adventureBoard: AdventureBoard;
  journey: JourneySnapshot | null;
  isProcessing: boolean;
  lastCapture: CaptureResult | null;
  pendingDiscovery: PendingDiscovery | null;
  library: LibraryService;
  refresh: () => Promise<void>;
  beginPhotoDiscovery: (uri: string) => PendingDiscovery;
  confirmNamedDiscovery: (label: NamedDiscoveryLabel) => Promise<CaptureResult>;
  clearPendingDiscovery: () => void;
  captureVideo: (uri: string) => Promise<CaptureResult>;
  captureVoice: (uri: string) => Promise<CaptureResult>;
  celebrateMemory: (memoryId: string) => Promise<void>;
  toggleFavorite: (memoryId: string) => Promise<void>;
  startAdventure: (adventureId: string) => Promise<void>;
  getMemory: (id: string) => Promise<Memory | null>;
  getAdventuresForMemory: (memoryId: string) => Promise<
    Awaited<ReturnType<AdventureService["getByMemoryId"]>>
  >;
};

const AppContext = createContext<AppContextValue | null>(null);

const emptyBoard: AdventureBoard = {
  unlocked: [],
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

  const refresh = useCallback(async () => {
    const [nextMemories, board, snapshot] = await Promise.all([
      memoryService.list(),
      adventureService.getBoard(),
      journeyService.getSnapshot(),
    ]);
    setMemories(nextMemories);
    setAdventureBoard(board);
    setJourney(snapshot);
  }, []);

  const runCapture = useCallback(
    async (work: () => Promise<CaptureResult>) => {
      setIsProcessing(true);
      try {
        const result = await work();
        setLastCapture(result);
        await refresh();
        return result;
      } finally {
        setIsProcessing(false);
      }
    },
    [refresh],
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

  const value = useMemo<AppContextValue>(
    () => ({
      memories,
      adventureBoard,
      journey,
      isProcessing,
      lastCapture,
      pendingDiscovery,
      library: libraryService,
      refresh,
      beginPhotoDiscovery,
      confirmNamedDiscovery,
      clearPendingDiscovery,
      captureVideo,
      captureVoice,
      celebrateMemory,
      toggleFavorite,
      startAdventure,
      getMemory,
      getAdventuresForMemory,
    }),
    [
      memories,
      adventureBoard,
      journey,
      isProcessing,
      lastCapture,
      pendingDiscovery,
      refresh,
      beginPhotoDiscovery,
      confirmNamedDiscovery,
      clearPendingDiscovery,
      captureVideo,
      captureVoice,
      celebrateMemory,
      toggleFavorite,
      startAdventure,
      getMemory,
      getAdventuresForMemory,
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
