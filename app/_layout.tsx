import { Stack } from "expo-router";
import MapboxGL from "@rnmapbox/maps";
import Constants from "expo-constants";
import { useEffect } from "react";
import { ErrorUtils } from "react-native";

// setting the token early, pulled from app config
MapboxGL.setAccessToken(Constants.expoConfig?.extra?.mapboxAccessToken);

export default function RootLayout() {
  useEffect(() => {
    // Set up global JS error handler
    ErrorUtils.setGlobalHandler((error, isFatal) => {
      console.error("🔥 Global error caught:", error);

      if (isFatal) {
        alert(`Fatal JS error: ${error.message}`);
      }
    });
  }, []);

  return <Stack />;
}
