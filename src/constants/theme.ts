/**
 * AdventureBook visual language — joyful, playful, magical for ages 2–7.
 * Bright accents on soft white skies; large type, rounded corners, soft depth.
 */
export const colors = {
  /** High-contrast readable ink on light surfaces */
  ink: "#1A2B4A",
  inkMuted: "#4A5F7A",
  inkSoft: "#7A8FA8",

  /** Sky gradients — soft, never dark */
  skyTop: "#7EC8F8",
  skyMid: "#B8E4FF",
  skyBottom: "#FFF8EE",

  /** Brand accents from the kids palette */
  skyBlue: "#4DB7F5",
  sunshine: "#FFD54A",
  sunshineDeep: "#F5C518",
  grass: "#5ECF7A",
  grassDeep: "#3DB860",
  coral: "#FF8A65",
  coralDeep: "#FF6B4A",
  lavender: "#C5A8F0",
  lavenderDeep: "#9B7AD8",
  lavenderInk: "#6B4FA0",
  aqua: "#5EEAD4",
  aquaDeep: "#2DD4BF",

  /** Legacy aliases kept so existing screens keep working */
  moss: "#3DB860",
  mossDeep: "#2A9A4A",
  mossSoft: "#D7F5E2",
  orange: "#FF8A65",
  orangeDeep: "#FF6B4A",
  orangeSoft: "#FFE0D4",
  flame: "#FFB347",
  celebration: "#FFD54A",
  success: "#3DB860",

  /** Surfaces */
  surface: "#FFFBF5",
  surfaceRaised: "#FFFFFF",
  stroke: "rgba(26, 43, 74, 0.08)",

  /** Camera overlay */
  cameraScrim: "rgba(26, 43, 74, 0.38)",
  cameraInk: "#FFFFFF",

  /** Discovery Card pastels */
  navy: "#1A2B4A",
  navySoft: "#3D5273",
  cream: "#FFF8EE",
  peach: "#FFE0D4",
  peachDeep: "#FFC4B0",
  pastelBlue: "#D6EEFF",
  pastelGreen: "#D7F5E2",
  pastelPink: "#FFD6E8",
  pastelYellow: "#FFF3C4",
  pastelOrange: "#FFE0D4",
  pastelPurple: "#EDE4FF",
};

export const fonts = {
  display: "Fredoka_700Bold",
  displaySemi: "Fredoka_600SemiBold",
  body: "Nunito_400Regular",
  bodySemi: "Nunito_600SemiBold",
  bodyBold: "Nunito_700Bold",
};

export const space = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
  screen: 20,
};

/** Rounded everywhere — kids-friendly touch language */
export const radii = {
  sm: 14,
  md: 18,
  lg: 24,
  xl: 28,
  xxl: 32,
  pill: 999,
};

/** Soft layered depth — never harsh */
export const shadows = {
  soft: {
    shadowColor: "#4A5F7A",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 14,
    elevation: 3,
  },
  float: {
    shadowColor: "#4A5F7A",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 20,
    elevation: 5,
  },
  glow: {
    shadowColor: "#4DB7F5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 4,
  },
};

/** Encouraging copy — prefer `@/domain/celebration/messages` for personalized praise. */
export const praise = [
  "Awesome!",
  "Great Job!",
  "You Did It!",
  "Amazing Discovery!",
  "Fantastic!",
] as const;

/** @deprecated Use pickCelebration / pickCelebrationCheer from domain/celebration/messages */
export function randomPraise(): string {
  return praise[Math.floor(Math.random() * praise.length)]!;
}

/** Standard motion timings (ms) */
export const motion = {
  fast: 200,
  base: 280,
  slow: 400,
  celebration: 2800,
} as const;
