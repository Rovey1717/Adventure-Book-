import {
  confidenceTier,
  type ConfidenceTier,
  type PendingRecognition,
  type RecognitionResult,
} from "@/domain/recognition";
import type { RecognitionProvider } from "@/services/recognition/providers/RecognitionProvider";
import { MockVisionProvider } from "@/services/recognition/providers/MockVisionProvider";

export type AnalyzeOptions = {
  /** Extra attempts after the first failure. Default 1 (2 total tries). */
  maxRetries?: number;
};

/**
 * Single entry point for object recognition.
 *
 * Capture UI and discovery orchestration talk only to this service.
 * Swap providers (OpenAI, Google, Apple, local) via the constructor —
 * nowhere else in the app should know which model is running.
 */
export class RecognitionService {
  constructor(
    private readonly provider: RecognitionProvider = new MockVisionProvider(),
  ) {}

  get providerId() {
    return this.provider.id;
  }

  /**
   * Run AI vision analysis and return a pending session for parent confirmation.
   * Does not create discoveries or memories — confirmation happens separately.
   */
  async analyzePhoto(
    mediaUri: string,
    options: AnalyzeOptions = {},
  ): Promise<PendingRecognition> {
    const result = await this.runWithRetries(mediaUri, options.maxRetries ?? 1);
    const normalized = this.normalize(result, mediaUri);
    return {
      mediaUri,
      result: normalized,
      tier: confidenceTier(normalized.confidence),
    };
  }

  /** Re-run analysis on the same (or new) photo after a retake. */
  async retry(
    mediaUri: string,
    options: AnalyzeOptions = {},
  ): Promise<PendingRecognition> {
    return this.analyzePhoto(mediaUri, options);
  }

  private async runWithRetries(
    mediaUri: string,
    maxRetries: number,
  ): Promise<RecognitionResult> {
    let lastError: unknown;
    const attempts = Math.max(1, maxRetries + 1);

    for (let attempt = 0; attempt < attempts; attempt += 1) {
      try {
        return await this.provider.analyze(mediaUri);
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError instanceof Error
      ? lastError
      : new Error("Recognition failed after retries");
  }

  /**
   * Clamp confidence, sort alternatives, and ensure required fields.
   * Keeps every downstream consumer provider-agnostic.
   */
  private normalize(
    raw: RecognitionResult,
    mediaUri: string,
  ): RecognitionResult {
    const confidence = clamp01(raw.confidence);
    const alternatives = [...raw.alternatives]
      .map((item) => ({
        ...item,
        name: item.name.trim(),
        confidence: clamp01(item.confidence),
      }))
      .filter((item) => item.name.length > 0)
      .sort((a, b) => b.confidence - a.confidence);

    return {
      ...raw,
      name: raw.name.trim() || "Discovery",
      confidence,
      description: raw.description?.trim() || null,
      alternatives,
      mediaUri: raw.mediaUri || mediaUri,
      recognizedAt: raw.recognizedAt || new Date().toISOString(),
      provider: raw.provider || this.provider.id,
    };
  }
}

function clamp01(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

export type { ConfidenceTier, PendingRecognition, RecognitionResult };
