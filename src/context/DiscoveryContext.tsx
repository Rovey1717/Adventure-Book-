import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { discoveryRepository } from "@/data/discovery/DiscoveryRepository";
import type { Discovery, LibraryCard } from "@/domain/discovery/types";
import { DiscoveryService } from "@/services/DiscoveryService";

type DiscoveryContextValue = {
  service: DiscoveryService;
  discoveries: Discovery[];
  pendingDiscovery: Discovery | null;
  isProcessing: boolean;
  refresh: () => Promise<void>;
  capturePhoto: (uri: string) => Promise<Discovery>;
  captureVideo: (uri: string) => Promise<Discovery>;
  captureVoiceMemo: (uri: string) => Promise<Discovery>;
  chooseFromLibrary: (card: LibraryCard) => Promise<Discovery>;
  dismissConfirmation: () => void;
  celebrateDiscovery: (id: string) => Promise<Discovery>;
};

const DiscoveryContext = createContext<DiscoveryContextValue | null>(null);

const service = new DiscoveryService(discoveryRepository);

export function DiscoveryProvider({ children }: { children: ReactNode }) {
  const [discoveries, setDiscoveries] = useState<Discovery[]>([]);
  const [pendingDiscovery, setPendingDiscovery] = useState<Discovery | null>(
    null,
  );
  const [isProcessing, setIsProcessing] = useState(false);

  const refresh = useCallback(async () => {
    const items = await service.listDiscoveries();
    setDiscoveries(items);
  }, []);

  const runCapture = useCallback(
    async (work: () => Promise<Discovery>) => {
      setIsProcessing(true);
      try {
        const discovery = await work();
        await refresh();
        setPendingDiscovery(discovery);
        return discovery;
      } finally {
        setIsProcessing(false);
      }
    },
    [refresh],
  );

  const capturePhoto = useCallback(
    (uri: string) => runCapture(() => service.capturePhoto(uri)),
    [runCapture],
  );

  const captureVideo = useCallback(
    (uri: string) => runCapture(() => service.captureVideo(uri)),
    [runCapture],
  );

  const captureVoiceMemo = useCallback(
    (uri: string) => runCapture(() => service.captureVoiceMemo(uri)),
    [runCapture],
  );

  const chooseFromLibrary = useCallback(
    (card: LibraryCard) => runCapture(() => service.chooseFromLibrary(card)),
    [runCapture],
  );

  const dismissConfirmation = useCallback(() => {
    setPendingDiscovery(null);
  }, []);

  const celebrateDiscovery = useCallback(
    async (id: string) => {
      const updated = await service.markCelebrated(id);
      setPendingDiscovery(null);
      await refresh();
      return updated;
    },
    [refresh],
  );

  const value = useMemo<DiscoveryContextValue>(
    () => ({
      service,
      discoveries,
      pendingDiscovery,
      isProcessing,
      refresh,
      capturePhoto,
      captureVideo,
      captureVoiceMemo,
      chooseFromLibrary,
      dismissConfirmation,
      celebrateDiscovery,
    }),
    [
      discoveries,
      pendingDiscovery,
      isProcessing,
      refresh,
      capturePhoto,
      captureVideo,
      captureVoiceMemo,
      chooseFromLibrary,
      dismissConfirmation,
      celebrateDiscovery,
    ],
  );

  return (
    <DiscoveryContext.Provider value={value}>
      {children}
    </DiscoveryContext.Provider>
  );
}

export function useDiscovery() {
  const context = useContext(DiscoveryContext);
  if (!context) {
    throw new Error("useDiscovery must be used within DiscoveryProvider");
  }
  return context;
}
