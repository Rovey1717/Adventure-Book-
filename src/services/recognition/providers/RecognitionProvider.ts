import type { RecognitionResult } from "@/domain/recognition/types";

/**
 * Pluggable vision backend.
 * Implement this interface for OpenAI Vision, Google Vision, Apple Vision,
 * a custom API, or an on-device model — RecognitionService stays unchanged.
 */
export interface RecognitionProvider {
  readonly id: RecognitionResult["provider"];

  /**
   * Analyze a captured image and return a normalized result.
   * Providers may throw; RecognitionService handles retries.
   */
  analyze(mediaUri: string): Promise<RecognitionResult>;
}
