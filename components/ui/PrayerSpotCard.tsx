import React from "react";
import { View, Text } from "react-native";
import { colors, spacing, typography } from "./theme";
import PrimaryButton from "./PrimaryButton";

type Props = {
  name: string;
  location: string;
  hasWudu?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
};

export default function PrayerSpotCard({
  name,
  location,
  hasWudu,
  onEdit,
  onDelete,
}: Props) {
  return (
    <View
      style={{
        backgroundColor: colors.background,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 10,
        padding: spacing.md,
        marginBottom: spacing.md,
      }}
    >
      <Text style={typography.title}>{name}</Text>
      <Text style={[typography.body, { color: colors.muted }]}>{location}</Text>
      {hasWudu && <Text style={typography.small}>🧼 Wudu available</Text>}

      <View style={{ flexDirection: "row", marginTop: spacing.sm, gap: 8 }}>
        <PrimaryButton
          label="Edit"
          onPress={onEdit}
          style={{ flex: 1 }}
          variant="primary"
        />
        <PrimaryButton
          label="Delete"
          onPress={onDelete}
          style={{ flex: 1 }}
          variant="danger"
        />
      </View>
    </View>
  );
}
