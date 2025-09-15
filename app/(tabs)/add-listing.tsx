import { Text, View } from "@/components/Themed";
import { db } from "@/services/firebase";
import { useRouter } from "expo-router";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useState } from "react";
import {
  Button,
  StyleSheet,
  Switch,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
// import { auth } from "@/services/firebase";

export const spotSchema = z.object({
  name: z.string().min(1, "Name is required"),
  spotType: z.enum(["masjid", "prayer_room", "restaurant", "cafe"]),
  address: z.string().min(1, "Address is required"),
  lat: z.number(),
  lng: z.number(),
  amenities: z.object({
    wudu: z.boolean(),
    women: z.boolean(),
    toilets: z.boolean(),
    disabilityAccess: z.boolean(),
  }),
  availability: z.string(),
  capacityHint: z.string(),
  directions: z.string(),
  googleMapsUrl: z.string(),
  googlePlaceId: z.string(),
});

type SpotForm = z.infer<typeof spotSchema>;

export default function AddListing() {
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SpotForm>({
    resolver: zodResolver(spotSchema),
    defaultValues: {
      name: "",
      spotType: "masjid",
      address: "",
      lat: 0,
      lng: 0,
      amenities: {
        wudu: false,
        women: false,
        toilets: false,
        disabilityAccess: false,
      },
      availability: "public",
      capacityHint: "unknown",
      directions: "",
      googleMapsUrl: "",
      googlePlaceId: "",
    },
  });

  const amenityKeys = ["wudu", "women", "toilets", "disabilityAccess"] as const;
  type AmenityKey = (typeof amenityKeys)[number];

  const onSubmit = async (data: SpotForm) => {
    console.log("✅ Form passed validation:", data);
    try {
      const docRef = await addDoc(collection(db, "spots"), {
        ...data,
        location: {
          lat: data.lat,
          lng: data.lng,
          geopoint: `GeoPoint(${data.lat},${data.lng})`,
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      console.log("🎉 Spot added with ID:", docRef.id);
    } catch (err) {
      console.log("❌ Firestore addDoc failed:", err);
    }
  };

  return (
    <View style={styles.container}>
      {/* Name */}
      <Text style={styles.label}>Name *</Text>
      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="Name"
            value={value}
            onChangeText={onChange}
          />
        )}
      />
      {errors.name && <Text style={styles.error}>{errors.name.message}</Text>}

      {/* Spot Type */}
      <Text style={styles.label}>Spot Type *</Text>
      <Controller
        control={control}
        name="spotType"
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="masjid / prayer_room / restaurant / cafe"
            value={value}
            onChangeText={onChange}
          />
        )}
      />
      {errors.spotType && (
        <Text style={styles.error}>{errors.spotType.message}</Text>
      )}

      {/* Address */}
      <Text style={styles.label}>Address *</Text>
      <Controller
        control={control}
        name="address"
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="123 Example St, London"
            value={value}
            onChangeText={onChange}
          />
        )}
      />
      {errors.address && (
        <Text style={styles.error}>{errors.address.message}</Text>
      )}

      {/* Latitude */}
      <Text style={styles.label}>Latitude *</Text>
      <Controller
        control={control}
        name="lat"
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="51.5074"
            value={value?.toString()}
            keyboardType="numeric"
            onChangeText={(text) => onChange(parseFloat(text))}
          />
        )}
      />
      {errors.lat && <Text style={styles.error}>{errors.lat.message}</Text>}

      {/* Longitude */}
      <Text style={styles.label}>Longitude *</Text>
      <Controller
        control={control}
        name="lng"
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="-0.1278"
            value={value?.toString()}
            keyboardType="numeric"
            onChangeText={(text) => onChange(parseFloat(text))}
          />
        )}
      />
      {errors.lng && <Text style={styles.error}>{errors.lng.message}</Text>}

      {/* Amenities */}
      <Text style={styles.label}>Amenities</Text>
      <View style={styles.amenitiesRow}>
        {amenityKeys.map((field: AmenityKey) => (
          <Controller
            key={field}
            control={control}
            name={`amenities.${field}` as const}
            render={({ field: { onChange, value } }) => (
              <TouchableOpacity
                style={[
                  styles.pill,
                  value ? styles.pillActive : styles.pillInactive,
                ]}
                onPress={() => onChange(!value)}
              >
                <Text style={{ color: value ? "#2e4e2c" : "black" }}>
                  {field}
                </Text>
              </TouchableOpacity>
            )}
          />
        ))}
      </View>

      {/* Submit */}
      <Button title="Submit" onPress={handleSubmit(onSubmit)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#fff",
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    marginBottom: 6,
  },
  error: {
    color: "red",
    fontSize: 12,
    marginBottom: 8,
  },
  amenitiesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginVertical: 8,
  },
  pill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  pillActive: {
    backgroundColor: "#d7f7d4",
    borderColor: "#2e4e2c",
  },
  pillInactive: {
    backgroundColor: "#f2f2f2",
    borderColor: "#ccc",
  },
});
