import { useEffect, useState } from "react";
import {
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Button,
  Linking,
  Switch,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useIsAdmin } from "@/lib/admin";
import { setSpotVerified } from "@/modules/spots/setSpotVerified";
import SpotImagesUploader from "@/modules/spots/SpotImagesUploader";
import SpotImages from "@/modules/spots/ViewSpotImages";

export default function SpotDetail() {
  const { id } = useLocalSearchParams();
  const [spot, setSpot] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { isAdmin, loading: adminLoading } = useIsAdmin();

  useEffect(() => {
    const fetchSpot = async () => {
      if (!id || typeof id !== "string") return;

      try {
        const ref = doc(db, "spots", id);
        const snapshot = await getDoc(ref);
        if (snapshot.exists()) {
          setSpot({ id: snapshot.id, ...snapshot.data() });
        } else {
          console.warn("Spot not found");
        }
      } catch (err) {
        console.error("Error fetching spot:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSpot();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!spot) {
    return (
      <View style={styles.center}>
        <Text>Spot not found.</Text>
      </View>
    );
  }

  const onToggleVerified = async (id: string, v: boolean) => {
    if (typeof id !== "string") {
      console.warn("Missing spot id");
      return;
    }

    // Optimistic update: immediately update the spot object
    setSpot((prev: any) => {
      if (!prev || typeof prev !== "object") return prev;
      return { ...prev, verified: v };
    });

    try {
      await setSpotVerified(id, v); // Firestore write
    } catch (e) {
      // Revert on failure
      setSpot((prev: any) => {
        if (!prev || typeof prev !== "object") return prev;
        return { ...prev, verified: !v };
      });
      console.error("verify toggle failed:", e);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <SpotImages images={spot.images ?? []} />

      <Text style={styles.title}>{spot.name}</Text>
      <View>
        <Text>Verified: {spot.verified ? "✅" : "❌"}</Text>
        {isAdmin &&
          (adminLoading ? (
            <ActivityIndicator size="small" />
          ) : (
            <Switch
              value={!!spot.verified}
              onValueChange={(v) => onToggleVerified(spot.id, v)}
            />
          ))}
      </View>
      <Text>Type: {spot.spotType}</Text>
      <Text>Address: {spot.address}</Text>
      <Text>Availability: {spot.availability}</Text>

      <View>
        <Text style={styles.subtitle}>Amenities</Text>
        <Text>Wudu: {spot.amenities?.wudu ? "✅" : "❌"}</Text>
        <Text>Women’s Area: {spot.amenities?.women ? "✅" : "❌"}</Text>
        <Text>Toilets: {spot.amenities?.toilets ? "✅" : "❌"}</Text>
        <Text>
          Disability Access: {spot.amenities?.disabilityAccess ? "✅" : "❌"}
        </Text>
      </View>

      {spot.openingHours && (
        <>
          <Text style={styles.subtitle}>Opening Hours</Text>
          {Object.entries(spot.openingHours).map(([day, slots]) =>
            Array.isArray(slots)
              ? slots.map((s: any, idx: number) => (
                  <Text
                    key={day + idx}
                  >{`${day}: ${s.open} - ${s.close}`}</Text>
                ))
              : null
          )}
        </>
      )}

      {spot.ownerID && (
        <View>
          <Text style={styles.subtitle}>Created by: {spot.ownerID}</Text>
        </View>
      )}

      <View style={{ marginVertical: 12 }}>
        <Button
          title="Get Directions"
          onPress={() => {
            if (spot.googleMapsUrl) {
              Linking.openURL(spot.googleMapsUrl);
            } else {
              console.warn("No Google Maps link available");
            }
          }}
        />
      </View>

      <SpotImagesUploader spotId={spot.id} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  subtitle: { marginTop: 10, fontWeight: "600" },
});
