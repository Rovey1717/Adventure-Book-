import type {
  CreateDiscoveryInput,
  Discovery,
  LibraryCard,
} from "@/domain/discovery/types";

function createId() {
  return `disc_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

const SEED_LIBRARY: LibraryCard[] = [
  {
    id: "lib_firetruck",
    title: "Fire Truck",
    photoColor: "#D64545",
    subtitle: "From yesterday's walk",
  },
  {
    id: "lib_butterfly",
    title: "Butterfly",
    photoColor: "#6B9BD1",
    subtitle: "Garden morning",
  },
  {
    id: "lib_tree",
    title: "Tree",
    photoColor: "#3D8B6E",
    subtitle: "Park adventure",
  },
  {
    id: "lib_dog",
    title: "Dog",
    photoColor: "#C97B63",
    subtitle: "Neighbor friend",
  },
  {
    id: "lib_rainbow",
    title: "Rainbow",
    photoColor: "#9B7ED9",
    subtitle: "After the rain",
  },
  {
    id: "lib_train",
    title: "Train",
    photoColor: "#4A6FA5",
    subtitle: "Station visit",
  },
];

export class DiscoveryRepository {
  private discoveries: Discovery[] = [];

  async getAll(): Promise<Discovery[]> {
    return [...this.discoveries].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }

  async getById(id: string): Promise<Discovery | null> {
    return this.discoveries.find((item) => item.id === id) ?? null;
  }

  async create(input: CreateDiscoveryInput): Promise<Discovery> {
    const discovery: Discovery = {
      id: createId(),
      title: input.title,
      mediaType: input.mediaType,
      photo: input.photo ?? null,
      video: input.video ?? null,
      voiceMemo: input.voiceMemo ?? null,
      createdAt: new Date().toISOString(),
      location: input.location ?? null,
      status: input.status ?? "Captured",
    };

    this.discoveries = [discovery, ...this.discoveries];
    return discovery;
  }

  async update(
    id: string,
    patch: Partial<Omit<Discovery, "id" | "createdAt">>,
  ): Promise<Discovery> {
    const index = this.discoveries.findIndex((item) => item.id === id);
    if (index < 0) {
      throw new Error(`Discovery not found: ${id}`);
    }

    const updated: Discovery = {
      ...this.discoveries[index],
      ...patch,
    };
    this.discoveries = [
      ...this.discoveries.slice(0, index),
      updated,
      ...this.discoveries.slice(index + 1),
    ];
    return updated;
  }

  getLibraryCards(): LibraryCard[] {
    return SEED_LIBRARY;
  }
}

export const discoveryRepository = new DiscoveryRepository();
