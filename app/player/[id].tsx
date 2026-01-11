import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { VideoView, useVideoPlayer } from "expo-video";
import { useEffect, useRef, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

function formatTime(sec: number) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s < 10 ? "0" : ""}${s}`;
}

export default function PlayerScreen() {
  const { uri } = useLocalSearchParams<{ uri: string }>();

  const player = useVideoPlayer(uri!, (p) => {
    p.loop = false;
    p.play();
  });

  const [playing, setPlaying] = useState(true);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [locked, setLocked] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const hideTimer = useRef<NodeJS.Timeout | null>(null);

  // Update progress
  useEffect(() => {
    const sub = player.addListener("timeUpdate", (e) => {
      setCurrentTime(e.currentTime);
      setDuration(e.duration);
    });
    return () => sub.remove();
  }, []);

  // Auto-hide controls
  useEffect(() => {
    if (!controlsVisible || locked) return;
    hideTimer.current && clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      setControlsVisible(false);
    }, 3000);
  }, [controlsVisible, locked]);

  useEffect(() => {
    return () => {
      hideTimer.current && clearTimeout(hideTimer.current);
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

  const changeSpeed = () => {
    const speeds = [0.5, 1, 1.25, 1.5, 2];
    const next = speeds[(speeds.indexOf(speed) + 1) % speeds.length];
    setSpeed(next);
    player.playbackRate = next;
    setControlsVisible(true);
  };

  return (
    <Pressable
      style={styles.container}
      onPress={() => !locked && setControlsVisible((v) => !v)}
    >
      <VideoView
        player={player}
        style={styles.video}
        contentFit="contain"
        allowsFullscreen
        allowsPictureInPicture
      />

      {controlsVisible && (
        <View style={styles.overlay}>
          {/* Top bar */}
          <View style={styles.topBar}>
            <Pressable onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </Pressable>

            <Pressable onPress={changeSpeed}>
              <Text style={styles.speedText}>{speed}x</Text>
            </Pressable>
          </View>

          {/* Center controls */}
          {!locked && (
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

          {/* Bottom bar */}
          <View style={styles.bottomBar}>
            <Text style={styles.timeText}>
              {formatTime(currentTime)} / {formatTime(duration)}
            </Text>

            <Pressable onPress={() => setLocked(!locked)}>
              <Ionicons
                name={locked ? "lock-closed" : "lock-open"}
                size={22}
                color="#fff"
              />
            </Pressable>
          </View>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  video: {
    flex: 1,
    width: "100%",
    height: "100%",
    backgroundColor: "black",
  },
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
    alignItems: "center",
  },
  centerControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
  },
  bottomBar: {
    paddingHorizontal: 16,
    paddingBottom: 30,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  timeText: {
    color: "#fff",
    fontSize: 13,
  },
  speedText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});
