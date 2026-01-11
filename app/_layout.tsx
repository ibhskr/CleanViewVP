import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Platform } from "react-native";

export default function RootLayout() {
  return (
    <>
      <StatusBar
        style="light"
        translucent={Platform.OS === "android"}
      />

      <Stack
        screenOptions={{
          headerShown: true,
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: "#09090b",
          },
          headerTintColor: "#ffffff",
          headerTitleStyle: {
            fontWeight: "600",
          },
          contentStyle: {
            backgroundColor: "#09090b",
          },
          animation: "fade",
        }}
      />
    </>
  );
}
