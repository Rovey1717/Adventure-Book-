import type { DiscoveryRepository } from "@/data/discovery/DiscoveryRepository";
import {
  objectNameForMedia,
  recognizeObjectFromPhoto,
} from "@/domain/discovery/recognition";
import type {
  Discovery,
  DiscoveryMediaType,
  GeoLocation,
} from "@/domain/discovery/types";

export type LocationProvider = () => Promise<{
  location: GeoLocation;
  locationLabel: string | null;
}>;

async function defaultLocationProvider() {
  try {
    const Location = await import("expo-location");
    const permission = await Location.requestForegroundPermissionsAsync();
    if (!permission.granted) {
      return { location: null, locationLabel: null };
    }
    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    return {
      location: {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      },
      locationLabel: "Nearby",
    };
  } catch {
    return { location: null, locationLabel: null };
  }
}

export class DiscoveryService {
  constructor(
    private readonly repository: DiscoveryRepository,
    private readonly getLocation: LocationProvider = defaultLocationProvider,
  ) {}

  list() {
    return this.repository.getAll();
  }

  getById(id: string) {
    return this.repository.getById(id);
  }

  async capturePhoto(mediaUri: string): Promise<Discovery> {
    const [objectName, place] = await Promise.all([
      recognizeObjectFromPhoto(mediaUri),
      this.getLocation(),
    ]);

    return this.repository.create({
      objectName,
      mediaType: "photo",
      mediaUri,
      location: place.location,
      locationLabel: place.locationLabel,
    });
  }

  async captureMedia(
    mediaType: Exclude<DiscoveryMediaType, "photo">,
    mediaUri: string,
  ): Promise<Discovery> {
    const place = await this.getLocation();
    return this.repository.create({
      objectName: objectNameForMedia(mediaType),
      mediaType,
      mediaUri,
      location: place.location,
      locationLabel: place.locationLabel,
    });
  }
}
