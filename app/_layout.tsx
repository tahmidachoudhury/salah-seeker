import { Stack } from "expo-router";
import MapboxGL from "@rnmapbox/maps";
import Constants from "expo-constants";
import { useEffect } from "react";
import { ErrorUtils } from "react-native";
import { setJSExceptionHandler } from "react-native-exception-handler";

// setting the token early, pulled from app config
MapboxGL.setAccessToken(Constants.expoConfig?.extra?.mapboxAccessToken);

export default function RootLayout() {
  useEffect(() => {
    setJSExceptionHandler((error, isFatal) => {
      console.error("🔥 Global JS Error:", error);

      if (isFatal) {
        alert(`Fatal JS error: ${error.message}`);
      }
    }, true); // <- second arg = allow in dev mode
  }, []);

  return <Stack />;
}
