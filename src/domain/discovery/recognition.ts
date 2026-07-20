import { delay } from "@/domain/shared/ids";

const RECOGNIZED_OBJECTS = [
  "Dog",
  "Cat",
  "Fire Truck",
  "Tree",
  "Butterfly",
  "Rainbow",
  "Excavator",
  "Apple",
  "Banana",
  "Train",
  "Ocean",
  "Turtle",
] as const;

export type RecognizedObject = (typeof RECOGNIZED_OBJECTS)[number];

/**
 * Mocked on-device vision.
 * Replace with a real model/API without changing DiscoveryService callers.
 */
export async function recognizeObjectFromPhoto(
  _photoUri: string,
): Promise<RecognizedObject> {
  await delay(700);
  const index = Math.floor(Math.random() * RECOGNIZED_OBJECTS.length);
  return RECOGNIZED_OBJECTS[index];
}

export function objectNameForMedia(mediaType: "video" | "voice"): string {
  return mediaType === "video" ? "Video Memory" : "Voice Story";
}

export { RECOGNIZED_OBJECTS };
