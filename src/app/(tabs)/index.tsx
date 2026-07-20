import { useCallback, useEffect, useRef, useState } from "react";
import {
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
import { DiscoveryConfirmationSheet } from "@/components/discover/DiscoveryConfirmationSheet";
import { ProcessingOverlay } from "@/components/discover/ProcessingOverlay";
import { ShutterButton } from "@/components/discover/ShutterButton";
import { colors, fonts } from "@/constants/theme";
import { useDiscovery } from "@/context/DiscoveryContext";

export default function DiscoverScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const isFocused = useIsFocused();
  const cameraRef = useRef<CameraView>(null);

  const {
    pendingDiscovery,
    isProcessing,
    capturePhoto,
    captureVideo,
    captureVoiceMemo,
    dismissConfirmation,
    celebrateDiscovery,
  } = useDiscovery();

  const [mode, setMode] = useState<CaptureMode>("photo");
  const [facing, setFacing] = useState<CameraType>("back");
  const [isRecordingVideo, setIsRecordingVideo] = useState(false);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [micPermission, requestMicPermission] = useMicrophonePermissions();

  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder);
  const isRecordingVoice = recorderState.isRecording;

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

  const handleCelebrate = useCallback(async () => {
    if (!pendingDiscovery) return;
    const id = pendingDiscovery.id;
    await celebrateDiscovery(id);
    router.push(`/celebrate/${id}`);
  }, [celebrateDiscovery, pendingDiscovery, router]);

  const takePhoto = useCallback(async () => {
    const ready = await ensurePermissions();
    if (!ready) return;

    if (Platform.OS === "web" || !cameraRef.current) {
      await capturePhoto(`mock-photo://${Date.now()}`);
      return;
    }

    const photo = await cameraRef.current.takePictureAsync({
      quality: 0.85,
      skipProcessing: false,
    });
    if (photo?.uri) {
      await capturePhoto(photo.uri);
    }
  }, [capturePhoto, ensurePermissions]);

  const toggleVideo = useCallback(async () => {
    const ready = await ensurePermissions();
    if (!ready) return;

    if (isRecordingVideo) {
      cameraRef.current?.stopRecording();
      return;
    }

    if (Platform.OS === "web" || !cameraRef.current) {
      await captureVideo(`mock-video://${Date.now()}`);
      return;
    }

    setIsRecordingVideo(true);
    try {
      const video = await cameraRef.current.recordAsync({ maxDuration: 30 });
      if (video?.uri) {
        await captureVideo(video.uri);
      }
    } finally {
      setIsRecordingVideo(false);
    }
  }, [captureVideo, ensurePermissions, isRecordingVideo]);

  const toggleVoice = useCallback(async () => {
    const ready = await ensurePermissions();
    if (!ready) return;

    if (isRecordingVoice) {
      await audioRecorder.stop();
      const uri = audioRecorder.uri;
      if (uri) {
        await captureVoiceMemo(uri);
      } else {
        await captureVoiceMemo(`mock-voice://${Date.now()}`);
      }
      return;
    }

    await audioRecorder.prepareToRecordAsync();
    audioRecorder.record();
  }, [
    audioRecorder,
    captureVoiceMemo,
    ensurePermissions,
    isRecordingVoice,
  ]);

  const onShutter = useCallback(async () => {
    if (isProcessing || pendingDiscovery) return;

    if (mode === "library") {
      router.push("/choose-discovery");
      return;
    }
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
    isProcessing,
    mode,
    pendingDiscovery,
    router,
    takePhoto,
    toggleVideo,
    toggleVoice,
  ]);

  const showCamera = isFocused && cameraPermission?.granted && mode !== "library";

  if (!cameraPermission) {
    return <View style={styles.root} />;
  }

  if (!cameraPermission.granted) {
    return (
      <View style={[styles.root, styles.permission]}>
        <Text style={styles.permissionTitle}>Camera unlocks Discover</Text>
        <Text style={styles.permissionBody}>
          AdventureBook needs the camera so families can capture the real world
          together.
        </Text>
        <Pressable style={styles.permissionButton} onPress={requestCameraPermission}>
          <Text style={styles.permissionButtonText}>Enable Camera</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {showCamera ? (
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
        colors={["rgba(8,20,16,0.55)", "transparent", "rgba(8,20,16,0.72)"]}
        locations={[0, 0.35, 1]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      <View style={[styles.topBar, { paddingTop: insets.top + 12 }]}>
        <Text style={styles.brand}>AdventureBook</Text>
        <Text style={styles.modeHint}>
          {mode === "photo" && "Point at something wonderful"}
          {mode === "video" && (isRecordingVideo ? "Recording…" : "Capture a short moment")}
          {mode === "voice" && (isRecordingVoice ? "Listening…" : "Tell the story out loud")}
          {mode === "library" && "Pick a saved discovery"}
        </Text>
      </View>

      <View style={[styles.controls, { paddingBottom: insets.bottom + 18 }]}>
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
            onPress={() => setFacing((current) => (current === "back" ? "front" : "back"))}
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
        message={
          mode === "photo" ? "Recognizing your discovery…" : "Saving your discovery…"
        }
      />

      <DiscoveryConfirmationSheet
        discovery={pendingDiscovery}
        onCelebrate={() => {
          void handleCelebrate();
        }}
        onKeepExploring={dismissConfirmation}
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
    paddingHorizontal: 20,
    gap: 6,
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
  },
  controls: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    gap: 18,
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
});
