export type CaptureMode = "photo" | "video" | "voice" | "library";

export const CAPTURE_MODES: {
  id: CaptureMode;
  label: string;
}[] = [
  { id: "photo", label: "Photo" },
  { id: "video", label: "Video" },
  { id: "voice", label: "Voice Memo" },
  { id: "library", label: "Choose Discovery" },
];
