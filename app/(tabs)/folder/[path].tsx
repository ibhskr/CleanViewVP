import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
// import { useWindowDimensions } from "react-native";

import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";

import VideoCard from "@/src/components/VideoCard";
import { useMediaStore } from "@/src/store/useMediaStore";

type SortOption = "NEWEST" | "DURATION" | "AZ";

// const { width } = Dimensions.get("window");

export default function FolderScreen() {
  const { path } = useLocalSearchParams<{ path: string }>();
  const { folders } = useMediaStore();
  const { width, height } = useWindowDimensions();
  const [isGridView, setIsGridView] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>("NEWEST");

  const isLandscape = width > height;

  // Dynamic columns
  const columns = isGridView
    ? isLandscape
      ? 3 // landscape grid
      : 2 // portrait grid
    : 1;

  // Spacing values
  const H_PADDING = 12;
  const GAP = 12;

  const availableWidth = width - H_PADDING * 2 - GAP * (columns - 1);
  const itemWidth = availableWidth / columns;

  const folder = folders.find((f: any) => f.folderPath === path);

  const sortedVideos = useMemo(() => {
    if (!folder?.videos?.length) return [];

    return [...folder.videos].sort((a, b) => {
      switch (sortOption) {
        case "AZ":
          return a.filename.localeCompare(b.filename, undefined, {
            numeric: true,
            sensitivity: "base",
          });
        case "DURATION":
          return (
            b.duration - a.duration || a.filename.localeCompare(b.filename)
          );
        case "NEWEST":
          return (
            (b.modified ?? 0) - (a.modified ?? 0) ||
            a.filename.localeCompare(b.filename)
          );
        default:
          return 0;
      }
    });
  }, [folder?.videos, sortOption]);

  const cycleSort = () => {
    setSortOption((prev) =>
      prev === "NEWEST" ? "DURATION" : prev === "DURATION" ? "AZ" : "NEWEST"
    );
  };

  const getSortLabel = () => {
    switch (sortOption) {
      case "AZ":
        return "A–Z";
      case "DURATION":
        return "Duration";
      default:
        return "Newest";
    }
  };

  if (!folder) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>Folder not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: folder.folderName,
          headerShadowVisible: false,
          headerStyle: { backgroundColor: "#09090b" },
          headerTintColor: "#ffffff",
          headerRight: () => (
            <Pressable
              onPress={() => setIsGridView((v) => !v)}
              hitSlop={10}
              style={styles.headerIcon}
            >
              <Ionicons
                name={isGridView ? "list" : "grid"}
                size={18}
                color="#e5e7eb"
              />
            </Pressable>
          ),
        }}
      />

      {/* Sub-header */}
      <View style={styles.subHeader}>
        <Text style={styles.subHeaderText}>{sortedVideos.length} VIDEOS</Text>

        <Pressable style={styles.sortChip} onPress={cycleSort}>
          <Ionicons name="swap-vertical" size={12} color="#2dd4bf" />
          <Text style={styles.sortText}>{getSortLabel()}</Text>
        </Pressable>
      </View>

      {sortedVideos.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="videocam-off" size={42} color="#3f3f46" />
          <Text style={styles.emptyText}>No videos found</Text>
        </View>
      ) : (
        // <FlatList
        //   data={sortedVideos}
        //   key={isGridView ? "grid" : "list"}
        //   keyExtractor={(item) => item.id}
        //   numColumns={isGridView ? 2 : 1}
        //   showsVerticalScrollIndicator={false}
        //   contentContainerStyle={styles.listContent}
        //   columnWrapperStyle={
        //     isGridView ? { justifyContent: "space-between" } : undefined
        //   }
        //   renderItem={({ item }) => (
        //     <View
        //       style={{
        //         width: isGridView ? width / 2 - 18 : "100%",
        //       }}
        //     >
        //       <VideoCard video={item} grid={isGridView} />
        //     </View>
        //   )}
        // />
        <FlatList
          data={sortedVideos}
          key={`${columns}`} // 👈 VERY IMPORTANT
          keyExtractor={(item) => item.id}
          numColumns={columns}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={columns > 1 ? { gap: GAP } : undefined}
          renderItem={({ item }) => (
            <View style={{ width: itemWidth }}>
              <VideoCard video={item} grid={columns > 1} />
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#09090b",
  },
  headerIcon: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(39,39,42,0.6)",
  },
  subHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(63,63,70,0.4)",
  },
  subHeaderText: {
    fontSize: 11,
    letterSpacing: 1,
    color: "#a1a1aa",
  },
  sortChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#18181b",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#27272a",
  },
  sortText: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: "600",
    color: "#e5e7eb",
  },
  listContent: {
    paddingHorizontal: 12,
    paddingTop: 16,
    paddingBottom: 100,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#09090b",
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    color: "#71717a",
  },
});
