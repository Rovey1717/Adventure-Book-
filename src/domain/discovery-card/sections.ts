/**
 * Discovery Card — living destination for one discovery.
 *
 * Primary action is always Continue Learning.
 * Other sections use progressive disclosure by age.
 */

export const DISCOVERY_CARD_SECTIONS = [
  {
    id: "continue_learning",
    emoji: "📖",
    label: "Continue Learning",
    shortLabel: "Continue",
  },
  {
    id: "my_journey",
    emoji: "❤️",
    label: "My Journey",
    shortLabel: "Journey",
  },
  {
    id: "adventures",
    emoji: "🗺",
    label: "Adventures",
    shortLabel: "Adventures",
  },
  {
    id: "collections",
    emoji: "🏆",
    label: "Collections",
    shortLabel: "Collections",
  },
  {
    id: "whats_next",
    emoji: "🌱",
    label: "What's Next",
    shortLabel: "Next",
  },
] as const;

export type DiscoveryCardSectionId =
  (typeof DISCOVERY_CARD_SECTIONS)[number]["id"];

export type DiscoveryCardSectionDef =
  (typeof DISCOVERY_CARD_SECTIONS)[number];

/** Default tab — always the next joyful action. */
export const DISCOVERY_CARD_DEFAULT_SECTION: DiscoveryCardSectionId =
  "continue_learning";

export function sectionsForIds(
  ids: DiscoveryCardSectionId[],
): DiscoveryCardSectionDef[] {
  const order = new Map(
    DISCOVERY_CARD_SECTIONS.map((section, index) => [section.id, index]),
  );
  return [...ids]
    .map((id) => DISCOVERY_CARD_SECTIONS.find((section) => section.id === id))
    .filter((section): section is DiscoveryCardSectionDef => Boolean(section))
    .sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
}
