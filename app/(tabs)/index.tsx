import { router } from "expo-router";
import { useEffect } from "react";
import {
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import FolderCard from "../../src/components/FolderCard";
import { requestMediaPermission } from "../../src/services/mediaScanner";
import { useMediaStore } from "../../src/store/useMediaStore";

export default function HomeScreen() {
  const { folders, loadMedia, loading } = useMediaStore();

  useEffect(() => {
    (async () => {
      await requestMediaPermission();
      await loadMedia();
    })();
  }, []);

  // 🔄 Loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" />
        <Text style={styles.loadingText}>Scanning videos…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

     

      {/* 🔹 Folder list */}
      <FlatList
        data={folders}
        keyExtractor={(item) => item.folderPath}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <FolderCard
            name={item.folderName}
            count={item.videos.length}
            onPress={() =>
              router.push({
                pathname: "/folder/[path]",
                params: { path: item.folderPath },
              })
            }
          />
        )}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 12,
  },
  title: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "700",
  },
  subtitle: {
    color: "#9ca3af",
    fontSize: 14,
    marginTop: 4,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    color: "#fff",
    fontSize: 16,
  },
});
