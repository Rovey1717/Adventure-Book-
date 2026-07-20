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
import { colors, fonts } from "@/constants/theme";
import { useApp } from "@/context/AppContext";
import type { LibraryEntry } from "@/domain/library/types";

/**
 * Discover hosts two journeys:
 * A) Camera capture → Memory → Adventure Book
 * B) Library search → Discovery card → Learning (no memory)
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
  } = useApp();

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

  const goCelebrate = useCallback(
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
      goCelebrate(result.memory.id);
      return;
    }

    setIsRecordingVideo(true);
    try {
      const video = await cameraRef.current.recordAsync({ maxDuration: 30 });
      if (video?.uri) {
        const result = await captureVideo(video.uri);
        goCelebrate(result.memory.id);
      }
    } finally {
      setIsRecordingVideo(false);
    }
  }, [captureVideo, ensurePermissions, goCelebrate, isRecordingVideo]);

  const toggleVoice = useCallback(async () => {
    const ready = await ensurePermissions();
    if (!ready) return;

    if (isRecordingVoice) {
      await audioRecorder.stop();
      const uri = audioRecorder.uri ?? `mock-voice://${Date.now()}`;
      const result = await captureVoice(uri);
      goCelebrate(result.memory.id);
      return;
    }

    await audioRecorder.prepareToRecordAsync();
    audioRecorder.record();
  }, [
    audioRecorder,
    captureVoice,
    ensurePermissions,
    goCelebrate,
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
    return <View style={styles.root} />;
  }

  if (!cameraPermission.granted) {
    return (
      <View style={[styles.root, styles.permission]}>
        <Text style={styles.permissionTitle}>Camera unlocks Discover</Text>
        <Text style={styles.permissionBody}>
          AdventureBook needs the camera so families can capture the real world
          together. You can still search the Library to learn anytime.
        </Text>
        <Pressable
          style={styles.permissionButton}
          onPress={requestCameraPermission}
        >
          <Text style={styles.permissionButtonText}>Enable Camera</Text>
        </Pressable>
        <Pressable
          style={styles.permissionSecondary}
          onPress={() => router.push("/(tabs)/library")}
        >
          <Text style={styles.permissionSecondaryText}>Browse Library</Text>
        </Pressable>
      </View>
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
        <Text style={styles.brand}>AdventureBook</Text>
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
          <Text style={styles.modeHint}>
            {mode === "photo" && "Point at something wonderful"}
            {mode === "video" &&
              (isRecordingVideo ? "Recording…" : "Capture a short moment")}
            {mode === "voice" &&
              (isRecordingVoice ? "Listening…" : "Tell the story out loud")}
          </Text>
        ) : (
          <Text style={styles.modeHint}>
            Search Library · Capture saves memories & unlocks adventures
          </Text>
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
          <Pressable
            onPress={() =>
              setFacing((current) => (current === "back" ? "front" : "back"))
            }
            style={styles.sideButton}
            accessibilityLabel="Flip camera"
          >
            <Text style={styles.sideButtonText}>Flip</Text>
          </Pressable>

          <ShutterButton
            mode={mode}
            isRecording={isRecordingVideo || isRecordingVoice}
            disabled={isProcessing}
            onPress={() => {
              void onShutter();
            }}
          />

          <View style={styles.sideButton} />
        </View>
      </View>

      <ProcessingOverlay
        visible={isProcessing}
        message="Saving your discovery…"
      />
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
  },
  modeHint: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: "rgba(247,255,248,0.78)",
    marginTop: 2,
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
    width: 64,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  sideButtonText: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: colors.cameraInk,
  },
  permission: {
    alignItems: "center",
    justifyContent: "center",
    padding: 28,
    gap: 12,
    backgroundColor: colors.skyMid,
  },
  permissionTitle: {
    fontFamily: fonts.display,
    fontSize: 28,
    color: colors.ink,
    textAlign: "center",
  },
  permissionBody: {
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 24,
    color: colors.inkMuted,
    textAlign: "center",
    marginBottom: 8,
  },
  permissionButton: {
    backgroundColor: colors.orange,
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 16,
  },
  permissionButtonText: {
    fontFamily: fonts.displaySemi,
    fontSize: 16,
    color: colors.surfaceRaised,
  },
  permissionSecondary: {
    paddingVertical: 10,
  },
  permissionSecondaryText: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: colors.moss,
  },
});
