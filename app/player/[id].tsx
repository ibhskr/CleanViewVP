import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
import { VideoView, useVideoPlayer } from "expo-video";
import { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

function formatTime(sec: number) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s < 10 ? "0" : ""}${s}`;
}

export default function PlayerScreen() {
  // Change 'uri' to 'id' here
  const { id } = useLocalSearchParams<{ id: string }>();

  // Now console.log will show your video path
  // console.log("Video URI:", id);

  const player = useVideoPlayer(id, (p) => {
    p.play();
  });
  // const player = useVideoPlayer(uri!, (p) => {
  //   p.loop = false;
  //   p.play();
  // });

  const [playing, setPlaying] = useState(true);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [locked, setLocked] = useState(false);
  const [loop, setLoop] = useState(false);
  const [bgPlay, setBgPlay] = useState(false);
  // Professional TypeScript Union Type
  const [fit, setFit] = useState<"contain" | "cover" | "fill">("contain");
  const [speed, setSpeed] = useState(1);
  const [rotated, setRotated] = useState(false);

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const hideTimer = useRef<NodeJS.Timeout | null>(null);

  // Progress updates
  useEffect(() => {
    const sub = player.addListener("timeUpdate", (e) => {
      setCurrentTime(e.currentTime);
      setDuration(e.duration);
    });
    return () => sub.remove();
  }, []);

  // Auto-hide controls
  useEffect(() => {
    if (!controlsVisible || locked || drawerOpen) return;
    hideTimer.current && clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      setControlsVisible(false);
    }, 3000);
  }, [controlsVisible, locked, drawerOpen]);

  useEffect(() => {
    return () => {
      hideTimer.current && clearTimeout(hideTimer.current);
      ScreenOrientation.unlockAsync();
      player.release();
    };
  }, []);

  const togglePlay = () => {
    playing ? player.pause() : player.play();
    setPlaying(!playing);
    setControlsVisible(true);
  };

  const seekBy = (sec: number) => {
    player.seekTo(Math.max(0, currentTime + sec));
    setControlsVisible(true);
  };

  const toggleRotation = async () => {
    if (rotated) {
      await ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.PORTRAIT
      );
    } else {
      await ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.LANDSCAPE
      );
    }
    setRotated(!rotated);
  };

  const toggleLoop = () => {
    player.loop = !loop;
    setLoop(!loop);
  };

  const toggleSpeed = () => {
    const speeds = [0.5, 1, 1.25, 1.5, 2];
    const next = speeds[(speeds.indexOf(speed) + 1) % speeds.length];
    setSpeed(next);
    player.playbackRate = next;
  };

  return (
    <Pressable
      style={styles.container}
      onPress={() => !locked && setControlsVisible((v) => !v)}
    >
      <VideoView
        player={player}
        style={styles.video}
        contentFit={fit}
        allowsPictureInPicture={bgPlay}
        nativeControls={false} // 🔥 CRITICAL FIX
      />

      {controlsVisible && (
        <View style={styles.overlay}>
          {/* TOP BAR */}
          <View style={styles.topBar}>
            <Pressable onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </Pressable>

            <Pressable onPress={toggleSpeed}>
              <Text style={styles.speedText}>{speed}x</Text>
            </Pressable>
          </View>

          {/* CENTER CONTROLS (hidden when drawer open or locked) */}
          {!locked && !drawerOpen && (
            <View style={styles.centerControls}>
              <Pressable onPress={() => seekBy(-10)}>
                <Ionicons name="play-back" size={36} color="#fff" />
              </Pressable>

              <Pressable onPress={togglePlay}>
                <Ionicons
                  name={playing ? "pause-circle" : "play-circle"}
                  size={64}
                  color="#fff"
                />
              </Pressable>

              <Pressable onPress={() => seekBy(10)}>
                <Ionicons name="play-forward" size={36} color="#fff" />
              </Pressable>
            </View>
          )}

          {/* BOTTOM BAR */}
          <View style={styles.bottomBar}>
            <Text style={styles.timeText}>
              {formatTime(currentTime)} / {formatTime(duration)}
            </Text>

            <Pressable onPress={() => setDrawerOpen((v) => !v)}>
              <Ionicons name="ellipsis-vertical" size={22} color="#fff" />
            </Pressable>
          </View>

          {/* BOTTOM DRAWER */}
          {drawerOpen && (
            <View style={styles.drawer}>
              <DrawerItem
                icon={locked ? "lock-closed" : "lock-open"}
                label="Lock"
                onPress={() => setLocked(!locked)}
              />
              <DrawerItem
                icon="repeat"
                label="Loop"
                active={loop}
                onPress={toggleLoop}
              />
              <DrawerItem
                icon={
                  fit === "contain"
                    ? "contract"
                    : fit === "cover"
                    ? "scan"
                    : "expand"
                }
                label={`Fit: ${fit.charAt(0).toUpperCase() + fit.slice(1)}`}
                active={fit !== "contain"} // Highlights if not default
                onPress={() => {
                  setFit((prev) => {
                    if (prev === "contain") return "cover";
                    if (prev === "cover") return "fill";
                    return "contain";
                  });
                  // Optional: showFitIndicator();
                }}
              />
              <DrawerItem
                icon="phone-landscape"
                label="Rotate"
                onPress={toggleRotation}
              />
              <DrawerItem
                icon="headset"
                label="BG Play"
                active={bgPlay}
                onPress={() => setBgPlay(!bgPlay)}
              />
              <DrawerItem
                icon="text"
                label="Subtitles"
                onPress={() => alert("Subtitle support coming soon")}
              />
            </View>
          )}
        </View>
      )}
    </Pressable>
  );
}

function DrawerItem({
  icon,
  label,
  onPress,
  active,
}: {
  icon: any;
  label: string;
  onPress: () => void;
  active?: boolean;
}) {
  return (
    <Pressable style={styles.drawerItem} onPress={onPress}>
      <Ionicons name={icon} size={22} color={active ? "#2dd4bf" : "#fff"} />
      <Text style={styles.drawerText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "black" },
  video: { flex: 1, width: "100%", height: "100%" },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "space-between",
  },

  topBar: {
    paddingTop: 40,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  centerControls: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
  },

  bottomBar: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  drawer: {
    backgroundColor: "#0f172a64",
    paddingVertical: 14,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    flexDirection: "row",
    justifyContent: "space-around",
  },

  drawerItem: {
    alignItems: "center",
    gap: 4,
  },

  drawerText: {
    color: "#e5e7eb",
    fontSize: 11,
  },

  timeText: {
    color: "#fff",
    fontSize: 13,
  },

  speedText: {
    color: "#fff",
    fontWeight: "600",
  },
});
