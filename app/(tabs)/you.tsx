import PrayerSpotCard from "@/components/ui/PrayerSpotCard";
import { Text, View } from "@/components/ui/Themed";
import { spacing, typography } from "@/components/ui/theme";
import { SpotMarker } from "@/modules/spots/PrayerSpot";
import {
  deleteListing,
  getMyListings,
  updateListing,
} from "@/modules/spots/firestore";
import { useEffect, useState } from "react";
import { Alert } from "react-native";

export default function YouScreen() {
  const [myListings, setMyListings] = useState<SpotMarker[]>([]);

  const loadListings = async () => {
    const listings: any = await getMyListings();
    setMyListings(listings);
  };

  useEffect(() => {
    loadListings();
  }, []);

  const handleUpdate = async (listing: SpotMarker) => {
    await updateListing(listing.id, { name: listing.name + " (Updated)" });
    Alert.alert("Updated", "Listing updated successfully");
    loadListings();
  };

  const handleDelete = async (listingId: string) => {
    Alert.alert("Delete", "Are you sure?", [
      { text: "Cancel" },
      {
        text: "Yes",
        onPress: async () => {
          await deleteListing(listingId);
          loadListings();
        },
      },
    ]);
  };

  return (
    <View style={{ padding: spacing.lg, flex: 1 }}>
      <Text style={typography.title}>Your Prayer Listings</Text>
      <Text style={{ marginTop: spacing.md }}>
        Your profile and saved items will appear here.
      </Text>

      {myListings.length === 0 ? (
        <Text>No listings yet.</Text>
      ) : (
        myListings.map((item) => (
          <PrayerSpotCard
            key={item.id}
            name={item.name}
            location={item.address}
            hasWudu={item.amenities.wudu}
            onEdit={() => handleUpdate(item)}
            onDelete={() => handleDelete(item.id)}
          />
        ))
      )}
    </View>
  );
}
