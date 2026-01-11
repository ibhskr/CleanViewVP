import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { VideoItem } from "../types/media";

interface Props {
  video: VideoItem;
  grid: boolean;
}

export default function VideoCard({ video, grid }: Props) {
  return (
    <Pressable
      onPress={() =>
        router.push({
          pathname: "/player/[id]",
          params: {
            id: video.id,
            uri: video.uri,
            name: video.filename,
          },
        })
      }
      style={({ pressed }) => [
        styles.card,
        grid && styles.gridCard,
        pressed && styles.pressed,
      ]}
      android_ripple={{ color: "#1f2933" }}
    >
      {/* Thumbnail placeholder */}
      <View style={styles.thumbnail}>
        <Text style={styles.thumbnailIcon}>🎬</Text>
      </View>

      {/* Video title */}
      <Text numberOfLines={2} style={styles.title}>
        {video.filename}
      </Text>

      {/* Duration */}
      <Text style={styles.duration}>{Math.floor(video.duration / 60)} min</Text>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  card: {
    backgroundColor: "#111827",
    borderRadius: 14,
    padding: 10,
    marginBottom: 12,
    
  },
  gridCard: {
    flex: 1,
    margin: 6,
  },
  pressed: {
    opacity: 0.85,
  },
  thumbnail: {
    backgroundColor: "#374151",
    height: 120,
    borderRadius: 10,
    marginBottom: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  thumbnailIcon: {
    fontSize: 24,
    color: "#e5e7eb",
  },
  title: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "500",
  },
  duration: {
    color: "#9ca3af",
    fontSize: 12,
    marginTop: 4,
  },
});
