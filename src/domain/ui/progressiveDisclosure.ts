/**
 * Progressive disclosure — the interface matures with the child.
 *
 * Age 2–3  One obvious action, parent guided, minimal chrome
 * Age 4–5  Simple paths, gentle challenges, collections begin
 * Age 6–8  Longer journeys, adventures, explorer levels
 * Age 9+   Projects, stories, research, richer book layers
 *
 * Never overwhelm. Only reveal what this age can joyfully use.
 */

import type { DiscoveryCardSectionId } from "@/domain/discovery-card/sections";

export type ExplorerUiBand = "toddler" | "early" | "growing" | "independent";

export type ProgressiveDisclosure = {
  band: ExplorerUiBand;
  /** Short, picture-first copy preference */
  preferIconsOverText: boolean;
  /** Giant primary CTA; hide secondary actions */
  singlePrimaryAction: boolean;
  /** Max secondary sections on Discovery Card */
  discoverySections: DiscoveryCardSectionId[];
  /** Show full learning path list vs only "next step" */
  showFullLearningPath: boolean;
  /** Adventure Book layers */
  showPassport: boolean;
  showCollections: boolean;
  showConstellations: boolean;
  showLifelongTimeline: boolean;
  showSurprises: boolean;
  showLegacyNote: boolean;
  /** Soft label for the primary continue CTA */
  continueLabel: string;
  continueEmoji: string;
};

export function explorerUiBandForAge(age: number): ExplorerUiBand {
  const a = Number.isFinite(age) ? Math.floor(age) : 5;
  if (a <= 3) return "toddler";
  if (a <= 5) return "early";
  if (a <= 8) return "growing";
  return "independent";
}

export function progressiveDisclosureForAge(age: number): ProgressiveDisclosure {
  const band = explorerUiBandForAge(age);

  switch (band) {
    case "toddler":
      return {
        band,
        preferIconsOverText: true,
        singlePrimaryAction: true,
        discoverySections: ["continue_learning", "my_journey"],
        showFullLearningPath: false,
        showPassport: false,
        showCollections: false,
        showConstellations: false,
        showLifelongTimeline: false,
        showSurprises: true,
        showLegacyNote: false,
        continueLabel: "Play next",
        continueEmoji: "✨",
      };
    case "early":
      return {
        band,
        preferIconsOverText: true,
        singlePrimaryAction: true,
        discoverySections: [
          "continue_learning",
          "my_journey",
          "collections",
          "whats_next",
        ],
        showFullLearningPath: false,
        showPassport: true,
        showCollections: true,
        showConstellations: false,
        showLifelongTimeline: false,
        showSurprises: true,
        showLegacyNote: false,
        continueLabel: "Continue",
        continueEmoji: "📖",
      };
    case "growing":
      return {
        band,
        preferIconsOverText: false,
        singlePrimaryAction: false,
        discoverySections: [
          "continue_learning",
          "my_journey",
          "adventures",
          "collections",
          "whats_next",
        ],
        showFullLearningPath: true,
        showPassport: true,
        showCollections: true,
        showConstellations: true,
        showLifelongTimeline: true,
        showSurprises: true,
        showLegacyNote: false,
        continueLabel: "Continue exploring",
        continueEmoji: "📖",
      };
    case "independent":
      return {
        band,
        preferIconsOverText: false,
        singlePrimaryAction: false,
        discoverySections: [
          "continue_learning",
          "my_journey",
          "adventures",
          "collections",
          "whats_next",
        ],
        showFullLearningPath: true,
        showPassport: true,
        showCollections: true,
        showConstellations: true,
        showLifelongTimeline: true,
        showSurprises: true,
        showLegacyNote: true,
        continueLabel: "Continue the journey",
        continueEmoji: "📖",
      };
  }
}
