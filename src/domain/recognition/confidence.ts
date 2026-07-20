import type { ConfidenceTier, RecognitionResult } from "@/domain/recognition/types";

/** Confidence thresholds — accuracy over speed; never show raw % in UI. */
export const CONFIDENCE_THRESHOLDS = {
  autoAccept: 0.95,
  confirm: 0.9,
  choose: 0.7,
} as const;

export function confidenceTier(confidence: number): ConfidenceTier {
  if (confidence >= CONFIDENCE_THRESHOLDS.autoAccept) return "auto_accept";
  if (confidence >= CONFIDENCE_THRESHOLDS.confirm) return "confirm";
  if (confidence >= CONFIDENCE_THRESHOLDS.choose) return "choose";
  return "uncertain";
}

export function tierForResult(result: RecognitionResult): ConfidenceTier {
  return confidenceTier(result.confidence);
}

/** Friendly copy — never expose technical confidence numbers. */
export function headlineForTier(
  tier: ConfidenceTier,
  objectName: string,
): string {
  switch (tier) {
    case "auto_accept":
      return `You found a ${objectName}!`;
    case "confirm":
      return `We think you found a ${objectName}`;
    case "choose":
      return "I think this might be…";
    case "uncertain":
      return "We're not sure what this is.";
  }
}

export function supportingCopyForTier(tier: ConfidenceTier): string {
  switch (tier) {
    case "auto_accept":
      return "Looking great — tap Confirm if that feels right, or change it anytime.";
    case "confirm":
      return "Does this look right to you? You can always pick something else.";
    case "choose":
      return "Pick the best match, or search the library if none feel right.";
    case "uncertain":
      return "No worries — retake a photo, search the library, or skip for now.";
  }
}

/** Top alternatives for the choose tier (primary + runners-up). */
export function topChoices(
  result: RecognitionResult,
  limit = 3,
): { name: string; category: RecognitionResult["category"]; description: string | null }[] {
  const primary = {
    name: result.name,
    category: result.category,
    description: result.description,
  };
  const rest = result.alternatives
    .filter((item) => item.name.toLowerCase() !== result.name.toLowerCase())
    .map((item) => ({
      name: item.name,
      category: item.category,
      description: item.description ?? null,
    }));

  const seen = new Set<string>();
  const merged = [primary, ...rest].filter((item) => {
    const key = item.name.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return merged.slice(0, limit);
}
