import React from "react";
import { View } from "react-native";

type Props = {
  children: React.ReactNode;
  space?: number;
  direction?: "row" | "column";
};

export default function Stack({
  children,
  space = 8,
  direction = "column",
}: Props) {
  return (
    <View style={{ flexDirection: direction, marginVertical: space }}>
      {children}
    </View>
  );
}
