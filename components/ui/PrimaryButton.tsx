import React from "react";
import { Pressable, Text, StyleSheet, ViewStyle } from "react-native";
import { colors, spacing } from "./theme";

type Props = {
  label: string;
  onPress?: () => void;
  style?: ViewStyle;
  variant?: "primary" | "danger" | "outline";
};

export default function PrimaryButton({
  label,
  onPress,
  style,
  variant = "primary",
}: Props) {
  const backgroundColor =
    variant === "danger"
      ? colors.danger
      : variant === "outline"
      ? "transparent"
      : colors.primary;

  const textColor = variant === "outline" ? colors.primary : colors.background;

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.button,
        { backgroundColor, borderColor: colors.primary },
        variant === "outline" && { borderWidth: 1 },
        style,
      ]}
    >
      <Text style={[styles.label, { color: textColor }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: spacing.sm,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontWeight: "600",
    fontSize: 16,
  },
});
