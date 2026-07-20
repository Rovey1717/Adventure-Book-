/**
 * Media helpers for non-photo captures.
 * Photo recognition lives in RecognitionService — do not add vision logic here.
 */
export function objectNameForMedia(mediaType: "video" | "voice"): string {
  return mediaType === "video" ? "Video Memory" : "Voice Story";
}
