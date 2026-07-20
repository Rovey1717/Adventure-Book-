import type {
  CreateDiscoveryInput,
  Discovery,
} from "@/domain/discovery/types";
import { createId } from "@/domain/shared/ids";

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
      id: createId("disc"),
      objectName: input.objectName,
      mediaType: input.mediaType,
      mediaUri: input.mediaUri,
      createdAt: new Date().toISOString(),
      location: input.location ?? null,
      locationLabel: input.locationLabel ?? null,
    };
    this.discoveries = [discovery, ...this.discoveries];
    return discovery;
  }
}

export const discoveryRepository = new DiscoveryRepository();
