import { Stack } from "expo-router";
import MapboxGL from "@rnmapbox/maps";
import Constants from "expo-constants";

// setting the token early, pulled from app config
MapboxGL.setAccessToken(Constants.expoConfig?.extra?.mapboxAccessToken);

export default function RootLayout() {
  return <Stack initialRouteName="login" />;
}
