export {
  CONFIDENCE_THRESHOLDS,
  confidenceTier,
  headlineForTier,
  supportingCopyForTier,
  tierForResult,
  topChoices,
} from "@/domain/recognition/confidence";
export { emojiForObject } from "@/domain/recognition/emoji";
export type {
  ConfidenceTier,
  PendingRecognition,
  RecognitionAlternative,
  RecognitionCategory,
  RecognitionProviderId,
  RecognitionResult,
} from "@/domain/recognition/types";
