import { Link } from "expo-router";
import { View, Text } from "react-native";

export default function HomeScreen() {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ fontSize: 20 }}>Welcome to Salah Seeker 🚀</Text>
      <Link href="/map">Go to Map</Link>
      <Link href="/qibla">Go to Qibla Compass</Link>
      <Link href="/debug-routes">See Routes</Link>
    </View>
  );
}
