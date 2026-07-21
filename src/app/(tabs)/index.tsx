import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  CameraView,
  useCameraPermissions,
  useMicrophonePermissions,
  type CameraType,
} from "expo-camera";
import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";
import { LinearGradient } from "expo-linear-gradient";
import { useIsFocused, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CaptureModeBar } from "@/components/discover/CaptureModeBar";
import type { CaptureMode } from "@/components/discover/captureModes";
import { DiscoverSearchBar } from "@/components/discover/DiscoverSearchBar";
import { DiscoverSearchResults } from "@/components/discover/DiscoverSearchResults";
import { ProcessingOverlay } from "@/components/discover/ProcessingOverlay";
import { ShutterButton } from "@/components/discover/ShutterButton";
import { SavedToast } from "@/components/discovery/SavedToast";
import { MagicalBackground } from "@/components/ui/MagicalBackground";
import { PlayfulPressable } from "@/components/ui/PlayfulPressable";
import { SoftCard } from "@/components/ui/SoftCard";
import { colors, fonts, radii, shadows } from "@/constants/theme";
import { useApp } from "@/context/AppContext";
import type { LibraryEntry } from "@/domain/library/types";
import { useLearningMode } from "@/hooks/useLearningMode";

/**
 * Discover — real life comes first.
 * Capture → name → save immediately → Celebrate Now | Continue Exploring
 */
export default function DiscoverScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const isFocused = useIsFocused();
  const cameraRef = useRef<CameraView>(null);
  const {
    isProcessing,
    beginPhotoDiscovery,
    captureVideo,
    captureVoice,
    library,
    savedToast,
    clearSavedToast,
  } = useApp();
  const { definition: learningMode } = useLearningMode();

  const [mode, setMode] = useState<CaptureMode>("photo");
  const [facing, setFacing] = useState<CameraType>("back");
  const [isRecordingVideo, setIsRecordingVideo] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [micPermission, requestMicPermission] = useMicrophonePermissions();

  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder);
  const isRecordingVoice = recorderState.isRecording;

  const searchActive = searchFocused || searchQuery.trim().length > 0;

  const searchResults = useMemo(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed) return [] as LibraryEntry[];
    return library.search(trimmed).slice(0, 8);
  }, [library, searchQuery]);

  useEffect(() => {
    void (async () => {
      await AudioModule.requestRecordingPermissionsAsync();
      await setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: true,
      });
    })();
  }, []);

  const ensurePermissions = useCallback(async () => {
    if (!cameraPermission?.granted) {
      const result = await requestCameraPermission();
      if (!result.granted) return false;
    }
    if (mode === "video" || mode === "voice") {
      if (!micPermission?.granted) {
        const result = await requestMicPermission();
        if (!result.granted) return false;
      }
    }
    return true;
  }, [
    cameraPermission?.granted,
    micPermission?.granted,
    mode,
    requestCameraPermission,
    requestMicPermission,
  ]);

  const clearSearch = useCallback(() => {
    setSearchQuery("");
    setSearchFocused(false);
    Keyboard.dismiss();
  }, []);

  const openLibraryCard = useCallback(
    (entry: LibraryEntry) => {
      // Journey B — learning only; never creates a Memory.
      Keyboard.dismiss();
      setSearchFocused(false);
      setSearchQuery("");
      router.push(`/library/${entry.id}`);
    },
    [router],
  );

  const goNameDiscovery = useCallback(() => {
    router.push("/name-discovery");
  }, [router]);

  const goDecision = useCallback(
    (memoryId: string) => {
      router.push(`/celebrate/${memoryId}`);
    },
    [router],
  );

  const takePhoto = useCallback(async () => {
    const ready = await ensurePermissions();
    if (!ready) return;

    const uri =
      Platform.OS === "web" || !cameraRef.current
        ? `mock-photo://${Date.now()}`
        : (await cameraRef.current.takePictureAsync({ quality: 0.85 }))?.uri;

    if (!uri) return;
    beginPhotoDiscovery(uri);
    goNameDiscovery();
  }, [beginPhotoDiscovery, ensurePermissions, goNameDiscovery]);

  const toggleVideo = useCallback(async () => {
    const ready = await ensurePermissions();
    if (!ready) return;

    if (isRecordingVideo) {
      cameraRef.current?.stopRecording();
      return;
    }

    if (Platform.OS === "web" || !cameraRef.current) {
      const result = await captureVideo(`mock-video://${Date.now()}`);
      goDecision(result.memory.id);
      return;
    }

    setIsRecordingVideo(true);
    try {
      const video = await cameraRef.current.recordAsync({ maxDuration: 30 });
      if (video?.uri) {
        const result = await captureVideo(video.uri);
        goDecision(result.memory.id);
      }
    } finally {
      setIsRecordingVideo(false);
    }
  }, [captureVideo, ensurePermissions, goDecision, isRecordingVideo]);

  const toggleVoice = useCallback(async () => {
    const ready = await ensurePermissions();
    if (!ready) return;

    if (isRecordingVoice) {
      await audioRecorder.stop();
      const uri = audioRecorder.uri ?? `mock-voice://${Date.now()}`;
      const result = await captureVoice(uri);
      goDecision(result.memory.id);
      return;
    }

    await audioRecorder.prepareToRecordAsync();
    audioRecorder.record();
  }, [
    audioRecorder,
    captureVoice,
    ensurePermissions,
    goDecision,
    isRecordingVoice,
  ]);

  const onShutter = useCallback(async () => {
    if (isProcessing) return;
    if (searchActive) clearSearch();
    if (mode === "photo") {
      await takePhoto();
      return;
    }
    if (mode === "video") {
      await toggleVideo();
      return;
    }
    await toggleVoice();
  }, [
    clearSearch,
    isProcessing,
    mode,
    searchActive,
    takePhoto,
    toggleVideo,
    toggleVoice,
  ]);

  if (!cameraPermission) {
    return <MagicalBackground variant="sky" />;
  }

  if (!cameraPermission.granted) {
    return (
      <MagicalBackground variant="sky">
        <View
          style={[
            styles.permission,
            {
              paddingTop: insets.top + 24,
              paddingBottom: insets.bottom + 24,
            },
          ]}
        >
          <SoftCard tint="blue" style={styles.permissionCard} float>
            <View style={styles.permissionInner}>
              <Text style={styles.permissionEmoji}>📷</Text>
              <Text style={styles.permissionTitle}>
                Camera unlocks Discover!
              </Text>
              <Text style={styles.permissionBody}>
                Adventure Book needs the camera so families can capture the
                real world together. You can still search the Library to
                learn anytime.
              </Text>
              <PlayfulPressable
                style={styles.permissionButton}
                onPress={requestCameraPermission}
                accessibilityRole="button"
                accessibilityLabel="Enable Camera"
              >
                <Text style={styles.permissionButtonText}>
                  ✨ Enable Camera
                </Text>
              </PlayfulPressable>
              <PlayfulPressable
                style={styles.permissionSecondary}
                onPress={() => router.push("/(tabs)/library")}
                accessibilityRole="button"
                accessibilityLabel="Browse Library"
              >
                <Text style={styles.permissionSecondaryText}>
                  📚 Browse Library
                </Text>
              </PlayfulPressable>
            </View>
          </SoftCard>
        </View>
      </MagicalBackground>
    );
  }

  return (
    <View style={styles.root}>
      {isFocused ? (
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          facing={facing}
          mode={mode === "video" ? "video" : "picture"}
          mute={false}
        />
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.cameraFallback]} />
      )}

      <LinearGradient
        colors={["rgba(8,20,16,0.62)", "transparent", "rgba(8,20,16,0.72)"]}
        locations={[0, 0.38, 1]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      <View style={[styles.topBar, { paddingTop: insets.top + 10 }]}>
        <View style={styles.brandRow}>
          <Text style={styles.brand}>✨ Adventure Book</Text>
          <View style={styles.learningModePill}>
            <Text style={styles.learningModeText}>{learningMode.shortLabel}</Text>
          </View>
        </View>
        <DiscoverSearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          onClear={clearSearch}
          onFocus={() => setSearchFocused(true)}
        />
        <DiscoverSearchResults
          query={searchQuery}
          results={searchResults}
          onSelect={openLibraryCard}
        />
        {!searchActive ? (
          <View style={styles.modeHintPill}>
            <Text style={styles.modeHint}>
              {mode === "photo" && "🌟 Point at something wonderful"}
              {mode === "video" &&
                (isRecordingVideo ? "🎥 Recording…" : "🎥 Capture a short moment")}
              {mode === "voice" &&
                (isRecordingVoice ? "🎙️ Listening…" : "🎙️ Tell the story out loud")}
            </Text>
          </View>
        ) : (
          <View style={styles.modeHintPill}>
            <Text style={styles.modeHint}>
              Search Library · Capture saves memories & unlocks adventures
            </Text>
          </View>
        )}
      </View>

      {searchActive ? (
        <Pressable
          style={styles.dismissScrim}
          onPress={clearSearch}
          accessibilityLabel="Dismiss search"
        />
      ) : null}

      <View
        style={[styles.controls, { paddingBottom: insets.bottom + 18 }]}
        pointerEvents={searchActive ? "box-none" : "auto"}
      >
        <CaptureModeBar
          mode={mode}
          onChange={(next) => {
            if (isRecordingVideo || isRecordingVoice) return;
            setMode(next);
          }}
          disabled={isProcessing || isRecordingVideo || isRecordingVoice}
        />

        <View style={styles.shutterRow}>
          <PlayfulPressable
            onPress={() =>
              setFacing((current) => (current === "back" ? "front" : "back"))
            }
            style={styles.sideButton}
            accessibilityLabel="Flip camera"
            accessibilityRole="button"
          >
            <Text style={styles.sideButtonEmoji}>🔄</Text>
          </PlayfulPressable>

          <ShutterButton
            mode={mode}
            isRecording={isRecordingVideo || isRecordingVoice}
            disabled={isProcessing}
            onPress={() => {
              void onShutter();
            }}
          />

          <View style={styles.sideButtonSpacer} />
        </View>
      </View>

      <ProcessingOverlay
        visible={isProcessing}
        message="Saving your discovery…"
      />

      {savedToast ? (
        <SavedToast
          message={savedToast.message}
          onDone={clearSavedToast}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#0B1612",
  },
  cameraFallback: {
    backgroundColor: "#143028",
  },
  topBar: {
    paddingHorizontal: 18,
    gap: 10,
    zIndex: 5,
  },
  brand: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: colors.cameraInk,
    textShadowColor: "rgba(26,43,74,0.35)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  learningModePill: {
    backgroundColor: "rgba(255,255,255,0.28)",
    borderRadius: radii.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  learningModeText: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    color: colors.cameraInk,
  },
  modeHintPill: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.22)",
    borderRadius: radii.pill,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginTop: 2,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  modeHint: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: colors.cameraInk,
  },
  dismissScrim: {
    ...StyleSheet.absoluteFill,
    top: 220,
    zIndex: 2,
  },
  controls: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    gap: 18,
    zIndex: 4,
  },
  shutterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 28,
  },
  sideButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.22)",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.35)",
  },
  sideButtonSpacer: {
    width: 56,
    height: 56,
  },
  sideButtonEmoji: {
    fontSize: 22,
  },
  permission: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  permissionCard: {
    width: "100%",
    maxWidth: 380,
  },
  permissionInner: {
    alignItems: "center",
    gap: 14,
    padding: 28,
  },
  permissionEmoji: {
    fontSize: 56,
  },
  permissionTitle: {
    fontFamily: fonts.display,
    fontSize: 26,
    color: colors.ink,
    textAlign: "center",
  },
  permissionBody: {
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 24,
    color: colors.inkMuted,
    textAlign: "center",
    marginBottom: 4,
  },
  permissionButton: {
    backgroundColor: colors.skyBlue,
    paddingHorizontal: 26,
    paddingVertical: 16,
    borderRadius: radii.pill,
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.glow,
  },
  permissionButtonText: {
    fontFamily: fonts.displaySemi,
    fontSize: 16,
    color: colors.surfaceRaised,
  },
  permissionSecondary: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  permissionSecondaryText: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: colors.skyBlue,
  },
});
