import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Dimensions,
  FlatList,
  Pressable,
  Text,
  View,
} from "react-native";

import VideoCard from "@/src/components/VideoCard";
import { useMediaStore } from "@/src/store/useMediaStore";

type SortOption = "NEWEST" | "DURATION" | "AZ";

const { width } = Dimensions.get("window");

export default function FolderScreen() {
  const { path } = useLocalSearchParams<{ path: string }>();
  const { folders } = useMediaStore();

  const [isGridView, setIsGridView] = useState(true);
  const [sortOption, setSortOption] = useState<SortOption>("NEWEST");

  const folder = folders.find((f) => f.folderPath === path);

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
            b.duration - a.duration ||
            a.filename.localeCompare(b.filename)
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
      prev === "NEWEST"
        ? "DURATION"
        : prev === "DURATION"
        ? "AZ"
        : "NEWEST"
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
      <View className="flex-1 bg-[#09090b] items-center justify-center">
        <Text className="text-zinc-500 text-sm">
          Folder not found
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#09090b]">
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
              className="p-2 rounded-full bg-zinc-900/60"
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
      <View className="px-4 py-2 flex-row justify-between items-center border-b border-zinc-800/40">
        <Text className="text-zinc-400 text-xs tracking-wider">
          {sortedVideos.length} VIDEOS
        </Text>

        <Pressable
          onPress={cycleSort}
          className="flex-row items-center bg-zinc-900 px-3 py-1.5 rounded-full border border-zinc-800 active:opacity-80"
        >
          <Ionicons
            name="swap-vertical"
            size={12}
            color="#2dd4bf"
          />
          <Text className="text-zinc-200 ml-1.5 text-xs font-semibold">
            {getSortLabel()}
          </Text>
        </Pressable>
      </View>

      {sortedVideos.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Ionicons
            name="videocam-off"
            size={42}
            color="#3f3f46"
          />
          <Text className="text-zinc-500 mt-3 text-sm">
            No videos found
          </Text>
        </View>
      ) : (
        <FlatList
          data={sortedVideos}
          key={isGridView ? "grid" : "list"}
          keyExtractor={(item) => item.id}
          numColumns={isGridView ? 2 : 1}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 12,
            paddingTop: 16,
            paddingBottom: 100,
          }}
          columnWrapperStyle={
            isGridView
              ? { justifyContent: "space-between" }
              : undefined
          }
          renderItem={({ item }) => (
            <View
              style={{
                width: isGridView
                  ? width / 2 - 18
                  : "100%",
              }}
            >
              <VideoCard video={item} grid={isGridView} />
            </View>
          )}
        />
      )}
    </View>
  );
}
