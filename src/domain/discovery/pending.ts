import type { DiscoveryMediaType, GeoLocation } from "@/domain/discovery/types";

/**
 * Captured media awaiting a family-provided name before becoming a Discovery.
 * MVP: always named manually. Future: RecognitionService may suggest a name
 * into this session without changing the capture → name → save flow.
 */
export type PendingDiscovery = {
  mediaUri: string;
  mediaType: DiscoveryMediaType;
  capturedAt: string;
  location?: GeoLocation;
  locationLabel?: string | null;
  /**
   * Optional AI suggestion — unused in MVP.
   * When RecognitionService is wired later, populate this without
   * changing DiscoveryJourneyService.saveNamedDiscovery.
   */
  suggestedName?: string | null;
};
