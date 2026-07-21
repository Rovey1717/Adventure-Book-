import {
  ADVENTURE_COLLECTIONS,
  collectionForDiscovery,
  collectionProgress,
} from "@/domain/adventure/collections";
import type { CollectionProgressView } from "@/components/discovery-card/DiscoveryCardCollectionsSection";

/**
 * Collections that include this discovery, plus related sets Family AI can grow.
 */
export function collectionsForDiscoveryCard(
  discoveryTitle: string,
  discoveredNames: string[],
): CollectionProgressView[] {
  const key = discoveryTitle.trim().toLowerCase();
  const found = new Set(discoveredNames.map((name) => name.toLowerCase()));
  const primary = collectionForDiscovery(discoveryTitle);

  const views = ADVENTURE_COLLECTIONS.map((collection) => {
    const includesDiscovery = collection.discoveryNames.some(
      (name) => name.toLowerCase() === key,
    );
    const progress = collectionProgress(collection, discoveredNames);
    const remaining = collection.discoveryNames.filter(
      (name) => !found.has(name.toLowerCase()),
    );
    return {
      collection,
      completed: progress.completed,
      total: progress.total,
      remaining,
      isPrimary: primary?.id === collection.id,
      includesDiscovery,
    };
  });

  return views
    .filter((item) => item.includesDiscovery || item.completed > 0)
    .sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary))
    .map(({ collection, completed, total, remaining, isPrimary }) => ({
      collection,
      completed,
      total,
      remaining,
      isPrimary,
    }));
}
