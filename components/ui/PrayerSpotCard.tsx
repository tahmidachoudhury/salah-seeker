import React from "react";
import { View, Text, Image, Pressable, StyleSheet } from "react-native";
import { colors, spacing, typography } from "@/components/ui/theme";
// if you switch to lucide:
import { MapPin, Building2, Trash2, BadgeCheck } from "lucide-react-native";
// or keep FontAwesome here instead

type Props = {
  name: string;
  address: string;
  type: string;
  imageUrl: string;
  verified?: boolean;
  onDelete?: () => void;
};

export default function PrayerSpotCard({
  name,
  address,
  type,
  imageUrl,
  verified = false,
  onDelete,
}: Props) {
  return (
    <View style={styles.card}>
      {/* Top image section */}
      <View style={styles.imageWrapper}>
        <Image source={{ uri: imageUrl }} style={styles.image} />

        {onDelete && (
          <Pressable style={styles.deleteButton} onPress={onDelete}>
            <Trash2 size={24} color="#111827" />
          </Pressable>
        )}
      </View>

      {/* Bottom info section */}
      <View style={styles.info}>
        <View>
          <Text style={styles.title}>{name}</Text>

          {/* Address row */}
          <View style={styles.row}>
            <MapPin size={16} color="#111827" style={styles.icon} />
            <Text style={styles.text}>{address}</Text>
          </View>

          {/* Type row */}
          <View style={styles.row}>
            <Building2 size={16} color="#111827" style={styles.icon} />
            <Text style={styles.text}>{type}</Text>
          </View>
        </View>

        {/* Verified badge middle-right */}
        {verified && (
          <View style={styles.verifiedWrapper}>
            <View style={styles.verifiedBadge}>
              <BadgeCheck size={32} color="#111827" />
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const CARD_RADIUS = 24;

const styles = StyleSheet.create({
  card: {
    borderRadius: CARD_RADIUS,
    backgroundColor: "#fff",
    overflow: "hidden",
    marginBottom: spacing.lg,
    // shadow / elevation
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  imageWrapper: {
    position: "relative",
  },
  image: {
    width: "100%",
    height: 180,
  },
  deleteButton: {
    position: "absolute",
    top: spacing.md,
    right: spacing.md,
    backgroundColor: "#C7F9FF", // light teal like in your design
    padding: spacing.md,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    backgroundColor: "#C7F9FF", // bottom panel colour
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    display: "flex",
    flexDirection: "row",
  },
  title: {
    ...typography.title,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.xs,
  },
  icon: {
    marginRight: spacing.sm,
  },
  text: {
    ...typography.body,
  },
  verifiedWrapper: {
    justifyContent: "center",
    alignItems: "flex-end",
    marginLeft: spacing.md,
  },
  verifiedBadge: {
    padding: spacing.md,
    borderRadius: 999,
    backgroundColor: "transparent",
  },
});
