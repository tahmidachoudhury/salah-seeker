import { useEffect, useState } from "react";
import {
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/services/firebase";

export default function SpotDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [spot, setSpot] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{spot.name}</Text>
      <Text>Type: {spot.spotType}</Text>
      <Text>Address: {spot.address}</Text>
      <Text>Availability: {spot.availability}</Text>

      <View style={styles.amenities}>
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  subtitle: { marginTop: 10, fontWeight: "600" },
  amenities: { marginTop: 15 },
});
