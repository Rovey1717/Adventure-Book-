export type DiscoveryMediaType = "photo" | "video" | "voice";

export type GeoLocation = {
  latitude: number;
  longitude: number;
} | null;

/** A single real-world capture event. */
export type Discovery = {
  id: string;
  objectName: string;
  mediaType: DiscoveryMediaType;
  mediaUri: string;
  createdAt: string;
  location: GeoLocation;
  locationLabel: string | null;
};

export type CreateDiscoveryInput = {
  objectName: string;
  mediaType: DiscoveryMediaType;
  mediaUri: string;
  location?: GeoLocation;
  locationLabel?: string | null;
};
