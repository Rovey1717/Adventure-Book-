export type DiscoveryMediaType = "photo" | "video" | "voice" | "library";

export type DiscoveryStatus =
  | "Captured"
  | "ReadyToCelebrate"
  | "Celebrated"
  | "AdventureStarted"
  | "AdventureCompleted"
  | "Favorite";

export type DiscoveryLocation = {
  latitude: number;
  longitude: number;
} | null;

export type Discovery = {
  id: string;
  title: string;
  mediaType: DiscoveryMediaType;
  photo: string | null;
  video: string | null;
  voiceMemo: string | null;
  createdAt: string;
  location: DiscoveryLocation;
  status: DiscoveryStatus;
};

export type LibraryCard = {
  id: string;
  title: string;
  photoColor: string;
  subtitle: string;
};

export type CreateDiscoveryInput = {
  title: string;
  mediaType: DiscoveryMediaType;
  photo?: string | null;
  video?: string | null;
  voiceMemo?: string | null;
  location?: DiscoveryLocation;
  status?: DiscoveryStatus;
};
