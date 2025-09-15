import FontAwesome from "@expo/vector-icons/FontAwesome";
import { StyleSheet, TouchableOpacity } from "react-native";
import { Text } from "./Themed";

export default function FilterPill({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.pill, active ? styles.pillActive : styles.pillInactive]}
      onPress={onPress}
    >
      {active && <FontAwesome size={12} name="close" />}
      <Text style={{ color: active ? "#2e4e2c" : "black" }}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: "8",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginHorizontal: 5,
  },
  pillActive: {
    backgroundColor: "#a8d38d",
  },
  pillInactive: {
    backgroundColor: "#e0e0e0",
  },
});
