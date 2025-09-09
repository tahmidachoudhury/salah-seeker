import { Text, View } from "@/components/Themed";
import { db } from "@/services/firebase";
import { useRouter } from "expo-router";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useState } from "react";
import { Button, StyleSheet, Switch, TextInput } from "react-native";
// import { auth } from "@/services/firebase";

export default function AddListing() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [spotType, setSpotType] = useState<
    "masjid" | "prayer_room" | "restaurant" | "cafe"
  >("masjid");
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [wudu, setWudu] = useState(false);
  const [women, setWomen] = useState(false);

  //This line below is to check if the user is signed in
  // console.log(auth.currentUser?.uid);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await addDoc(collection(db, "spots"), {
        name,
        spotType,
        address,
        location: {
          lat: parseFloat(lat),
          lng: parseFloat(lng),
          geopoint: `GeoPoint(${lat},${lng})`,
        },
        amenities: { wudu, women },
        availability: "public",
        verified: false,
        source: "user",
        ownerId: "admin",
        images: [],
        reviews: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        dedupeKey: `${name.toLowerCase().replace(/\s+/g, "")}_${lat}_${lng}`,
      });

      // Success 🎉🎉 currently set to redirect to the map route
      router.push("/map");
    } catch (err) {
      console.error("❌ Failed to submit:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Name of the listing -> prayer room or masjid */}
      <Text style={styles.label}>Name</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} />

      {/*  Listing Type:  "masjid" | "prayer_room" | "restaurant" | "cafe"*/}
      <Text style={styles.label}>Spot Type</Text>
      <TextInput
        style={styles.input}
        value={spotType}
        onChangeText={(v) => setSpotType(v as any)}
      />

      {/* Address */}
      <Text style={styles.label}>Address</Text>
      <TextInput
        style={styles.input}
        value={address}
        onChangeText={setAddress}
      />

      {/* Hard code lat and long */}

      <Text style={styles.label}>Latitude</Text>
      <TextInput
        style={styles.input}
        value={lat}
        onChangeText={setLat}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Longitude</Text>
      <TextInput
        style={styles.input}
        value={lng}
        onChangeText={setLng}
        keyboardType="numeric"
      />

      {/* wudu and women facility are boolean switches!! */}
      <View style={styles.toggleRow}>
        <Text>Wudu Facility</Text>
        <Switch value={wudu} onValueChange={setWudu} />
      </View>

      <View style={styles.toggleRow}>
        <Text>Women’s Area</Text>
        <Switch value={women} onValueChange={setWomen} />
      </View>

      <Button
        title={submitting ? "Submitting..." : "Submit"}
        onPress={handleSubmit}
        disabled={submitting}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 12 },
  label: { fontWeight: "bold" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 8,
  },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
