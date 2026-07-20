/**
 * Normalized recognition models — provider-agnostic.
 * Swap OpenAI Vision, Google Vision, Apple Vision, or a local model
 * without changing UI or discovery orchestration.
 */

export type RecognitionCategory =
  | "plants"
  | "animals"
  | "vehicles"
  | "buildings"
  | "food"
  | "ocean"
  | "insects"
  | "household"
  | "construction"
  | "landmarks"
  | "nature"
  | "other";

export type RecognitionProviderId =
  | "mock"
  | "openai"
  | "google"
  | "apple"
  | "custom"
  | "local";

/** A single candidate label from vision analysis. */
export type RecognitionAlternative = {
  name: string;
  confidence: number;
  category: RecognitionCategory;
  description?: string;
};

/**
 * Normalized vision response used everywhere in the app.
 * Never leak provider-specific payloads past RecognitionService.
 */
export type RecognitionResult = {
  id: string;
  name: string;
  confidence: number;
  category: RecognitionCategory;
  description: string | null;
  provider: RecognitionProviderId;
  alternatives: RecognitionAlternative[];
  recognizedAt: string;
  mediaUri: string;
};

export type ConfidenceTier =
  | "auto_accept"
  | "confirm"
  | "choose"
  | "uncertain";

/** Pending capture awaiting parent confirmation before becoming a Discovery. */
export type PendingRecognition = {
  mediaUri: string;
  result: RecognitionResult;
  tier: ConfidenceTier;
};
