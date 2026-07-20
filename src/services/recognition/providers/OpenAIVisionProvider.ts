import type { RecognitionResult } from "@/domain/recognition/types";
import type { RecognitionProvider } from "@/services/recognition/providers/RecognitionProvider";

/**
 * Example provider stub — wire a real Vision API here later.
 *
 * Swap in AppContext:
 *   new RecognitionService(new OpenAIVisionProvider(process.env.EXPO_PUBLIC_OPENAI_API_KEY!))
 *
 * The rest of the app stays unchanged. analyze() must return RecognitionResult.
 */
export class OpenAIVisionProvider implements RecognitionProvider {
  readonly id = "openai" as const;

  constructor(private readonly apiKey: string) {}

  async analyze(_mediaUri: string): Promise<RecognitionResult> {
    void this.apiKey;
    throw new Error(
      "OpenAIVisionProvider is a stub. Implement analyze() with your Vision API, returning a RecognitionResult.",
    );
  }
}
