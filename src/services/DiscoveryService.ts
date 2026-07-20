import type { DiscoveryRepository } from "@/data/discovery/DiscoveryRepository";
import {
  recognizeObjectFromPhoto,
  titleForMediaType,
} from "@/domain/discovery/recognition";
import type {
  Discovery,
  DiscoveryLocation,
  LibraryCard,
} from "@/domain/discovery/types";

export type LocationProvider = () => Promise<DiscoveryLocation>;

async function defaultLocationProvider(): Promise<DiscoveryLocation> {
  try {
    const Location = await import("expo-location");
    const permission = await Location.requestForegroundPermissionsAsync();
    if (!permission.granted) {
      return null;
    }
    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    };
  } catch {
    return null;
  }
}

export class DiscoveryService {
  constructor(
    private readonly repository: DiscoveryRepository,
    private readonly getLocation: LocationProvider = defaultLocationProvider,
  ) {}

  listDiscoveries() {
    return this.repository.getAll();
  }

  getDiscovery(id: string) {
    return this.repository.getById(id);
  }

  getLibraryCards() {
    return this.repository.getLibraryCards();
  }

  async capturePhoto(photoUri: string): Promise<Discovery> {
    const [title, location] = await Promise.all([
      recognizeObjectFromPhoto(photoUri),
      this.getLocation(),
    ]);

    return this.repository.create({
      title,
      mediaType: "photo",
      photo: photoUri,
      location,
      status: "ReadyToCelebrate",
    });
  }

  async captureVideo(videoUri: string): Promise<Discovery> {
    const location = await this.getLocation();
    return this.repository.create({
      title: titleForMediaType("video"),
      mediaType: "video",
      video: videoUri,
      location,
      status: "ReadyToCelebrate",
    });
  }

  async captureVoiceMemo(voiceUri: string): Promise<Discovery> {
    const location = await this.getLocation();
    return this.repository.create({
      title: titleForMediaType("voice"),
      mediaType: "voice",
      voiceMemo: voiceUri,
      location,
      status: "ReadyToCelebrate",
    });
  }

  async chooseFromLibrary(card: LibraryCard): Promise<Discovery> {
    const location = await this.getLocation();
    return this.repository.create({
      title: card.title,
      mediaType: "library",
      photo: `library://${card.id}`,
      location,
      status: "ReadyToCelebrate",
    });
  }

  async markCelebrated(id: string): Promise<Discovery> {
    return this.repository.update(id, { status: "Celebrated" });
  }

  async markFavorite(id: string): Promise<Discovery> {
    return this.repository.update(id, { status: "Favorite" });
  }
}
