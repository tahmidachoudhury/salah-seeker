import { Stack } from "expo-router";
import MapboxGL from "@rnmapbox/maps";
import { MAPBOX_TOKEN } from "../utils/mapbox";

export default function RootLayout() {
  MapboxGL.setAccessToken(MAPBOX_TOKEN); //set mapbox token globally across all components
  return <Stack initialRouteName="login" />;
}
