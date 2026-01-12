import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { VideoItem } from "../types/media";

interface Props {
  video: VideoItem;
  grid: boolean;
}

// Helper to format bytes
// const formatSize = (bytes?: number) => {
//   if (!bytes) return "0 MB";
//   const mb = bytes / (1024 * 1024);
//   return mb > 1024 ? `${(mb / 1024).toFixed(1)} GB` : `${mb.toFixed(1)} MB`;
// };

const formatSize = (bytes: any) => {
  const numBytes = Number(bytes); // Force to number in case it's a string
  if (!numBytes || isNaN(numBytes)) return "0 MB";

  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(numBytes) / Math.log(k));

  return (numBytes / Math.pow(k, i)).toFixed(1) + " " + sizes[i];
};

export default function VideoCard({ video, grid }: Props) {
  return (
    <Pressable
      onPress={() =>
        router.push({
          pathname: "/player/[id]",
          params: { id: video.uri },
        })
      }
      android_ripple={{ color: "#334155" }}
      style={({ pressed }) => [
        styles.card,
        grid ? styles.gridCard : styles.listCard,
        pressed && styles.pressed,
      ]}
    >
      {/* THUMBNAIL */}
      <View
        style={[
          styles.thumbnail,
          grid ? styles.gridThumbnail : styles.listThumbnail,
        ]}
      >
        <Ionicons name="play-circle" size={grid ? 34 : 26} color="#9ca3af" />

        {/* Quality Badge */}
        {grid && (
          <View style={styles.qualityBadge}>
            <Text style={styles.qualityText}>HD</Text>
          </View>
        )}

        {/* Duration */}
        <View style={styles.durationOverlay}>
          <Text style={styles.durationText}>
            {(() => {
              const hrs = Math.floor(video.duration / 3600);
              const mins = Math.floor((video.duration % 3600) / 60);
              const secs = Math.floor(video.duration % 60);

              return hrs > 0
                ? `${hrs}:${mins.toString().padStart(2, "0")}:${secs
                    .toString()
                    .padStart(2, "0")}`
                : `${mins}:${secs.toString().padStart(2, "0")}`;
            })()}
          </Text>
        </View>
      </View>

      {/* INFO */}
      <View style={styles.infoContainer}>
        <Text numberOfLines={grid ? 1 : 2} style={styles.title}>
          {video.filename}
        </Text>

        <View style={styles.metaRow}>
          {/* Always show size */}
          <Text style={styles.metaText}>{formatSize(video.size)}</Text>

          {/* Only show extra details in List View */}
          {!grid && (
            <>
              <Text style={styles.metaDot}> • </Text>
              <Text style={styles.metaText}>
                {/* If video.height exists, show 4K/HD, otherwise default to MP4 */}
                {video.height && video.height >= 2160 ? "4K" : "HD"}
              </Text>
              <Text style={styles.metaDot}> • </Text>
              <Text style={styles.metaText}>MP4</Text>
            </>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#18181b",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#27272a",
    overflow: "hidden",
  },

  /* GRID MODE (NO margins, NO flex) */
  gridCard: {
    padding: 8,
    marginBottom: 12,
  },

  /* LIST MODE */
  listCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    marginHorizontal: 12,
    marginBottom: 10,
  },

  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.98 }],
  },

  thumbnail: {
    backgroundColor: "#27272a",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },

  gridThumbnail: {
    width: "100%",
    aspectRatio: 16 / 9,
    marginBottom: 8,
  },

  listThumbnail: {
    width: 110,
    height: 70,
    marginRight: 12,
  },

  durationOverlay: {
    position: "absolute",
    bottom: 4,
    right: 4,
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },

  durationText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },

  qualityBadge: {
    position: "absolute",
    top: 4,
    left: 4,
    backgroundColor: "#10b981",
    paddingHorizontal: 5,
    borderRadius: 3,
  },

  qualityText: {
    fontSize: 9,
    fontWeight: "900",
    color: "#000",
  },

  infoContainer: {
    flex: 1,
  },

  title: {
    color: "#f4f4f5",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  metaText: {
    color: "#71717a",
    fontSize: 12,
  },

  metaDot: {
    marginHorizontal: 6,
    color: "#3f3f46",
  },
});
