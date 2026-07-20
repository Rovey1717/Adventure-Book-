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
import type { AdventureBoard } from "@/services/AdventureService";
import { AdventureService } from "@/services/AdventureService";
import type { CaptureResult } from "@/services/DiscoveryJourneyService";
import { DiscoveryJourneyService } from "@/services/DiscoveryJourneyService";
import { DiscoveryService } from "@/services/DiscoveryService";
import type { JourneySnapshot } from "@/domain/journey/types";
import type { Memory } from "@/domain/memory/types";
import { JourneyService } from "@/services/JourneyService";
import { LibraryService } from "@/services/LibraryService";
import { MemoryService } from "@/services/MemoryService";

const discoveryService = new DiscoveryService(discoveryRepository);
const memoryService = new MemoryService(memoryRepository);
const adventureService = new AdventureService(adventureRepository);
const journeyService = new JourneyService(
  discoveryRepository,
  memoryRepository,
  adventureRepository,
);
const libraryService = new LibraryService(libraryRepository);
const journeyOrchestrator = new DiscoveryJourneyService(
  discoveryService,
  memoryService,
  adventureService,
  journeyService,
);

type AppContextValue = {
  memories: Memory[];
  adventureBoard: AdventureBoard;
  journey: JourneySnapshot | null;
  isProcessing: boolean;
  lastCapture: CaptureResult | null;
  library: LibraryService;
  refresh: () => Promise<void>;
  capturePhoto: (uri: string) => Promise<CaptureResult>;
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

  const capturePhoto = useCallback(
    (uri: string) => runCapture(() => journeyOrchestrator.capturePhoto(uri)),
    [runCapture],
  );

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
      library: libraryService,
      refresh,
      capturePhoto,
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
      refresh,
      capturePhoto,
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
