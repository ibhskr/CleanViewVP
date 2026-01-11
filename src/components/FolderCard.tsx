import { Pressable, StyleSheet, Text, View } from "react-native";

interface Props {
  name: string;
  count: number;
  onPress: () => void;
}

export default function FolderCard({ name, count, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.pressed,
      ]}
      android_ripple={{ color: "#1f2933" }}
    >
      <View>
        <Text style={styles.title} numberOfLines={1}>
          📁 {name}
        </Text>
        <Text style={styles.subtitle}>
         {"      "} {count} videos
        </Text>
      </View>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  card: {
    backgroundColor: "#111827", // dark slate
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  pressed: {
    opacity: 0.8,
  },
  title: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
  },
  subtitle: {
    color: "#9ca3af",
    fontSize: 14,
    marginTop: 4,
  },
});
