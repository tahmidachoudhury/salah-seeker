import { View, Text } from "react-native";
import { useSegments } from "expo-router";

export default function DebugRoutes() {
  const segments = useSegments();

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontWeight: "bold", marginBottom: 10 }}>
        Discovered Routes:
      </Text>
      {segments.map((seg, i) => (
        <Text key={i}>{JSON.stringify(seg)}</Text>
      ))}
    </View>
  );
}
