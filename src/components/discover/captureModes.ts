export type CaptureMode = "photo" | "video" | "voice";

export const CAPTURE_MODES: {
  id: CaptureMode;
  label: string;
}[] = [
  { id: "photo", label: "Photo" },
  { id: "video", label: "Video" },
  { id: "voice", label: "Voice Memo" },
];
