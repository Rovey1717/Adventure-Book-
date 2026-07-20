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
] as const;

export type RecognizedObject = (typeof RECOGNIZED_OBJECTS)[number];

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Mocked on-device vision.
 * Swappable later for a real recognition model / API.
 */
export async function recognizeObjectFromPhoto(
  _photoUri: string,
): Promise<RecognizedObject> {
  await delay(700);
  const index = Math.floor(Math.random() * RECOGNIZED_OBJECTS.length);
  return RECOGNIZED_OBJECTS[index];
}

export function titleForMediaType(
  mediaType: "video" | "voice",
): string {
  if (mediaType === "video") {
    return "Video Memory";
  }
  return "Voice Story";
}

export { RECOGNIZED_OBJECTS };
