export type { RecognitionProvider } from "@/services/recognition/providers/RecognitionProvider";
export { MockVisionProvider } from "@/services/recognition/providers/MockVisionProvider";
export { OpenAIVisionProvider } from "@/services/recognition/providers/OpenAIVisionProvider";
export {
  RecognitionService,
  type AnalyzeOptions,
} from "@/services/recognition/RecognitionService";

/**
 * Optional future enhancement — not used in the MVP discovery flow.
 *
 * MVP: Camera → Name Your Discovery → save memory / adventures.
 * Later: call RecognitionService via DiscoveryJourneyService.suggestNameForPending
 * to prefill the name field without changing that flow.
 */