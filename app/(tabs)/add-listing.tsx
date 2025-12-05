import { Text, View } from "@/components/ui/Themed";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "expo-router";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import LocationPicker from "@/components/ui/LocationPicker";
import SpotImagesUploader from "@/modules/spots/SpotImagesUploader";
import {
  deleteListing,
  getMyListings,
  updateListing,
} from "@/modules/spots/firestore";
import { SpotMarker } from "@/modules/spots/PrayerSpot";
import PrayerSpotCard from "@/components/ui/PrayerSpotCard";
import { spacing, typography } from "@/components/ui/theme";
import Stack from "@/components/ui/Stack";

//TODO: we still need directions, opening hours, availability, capacityHint, multiFaith, sectNotes, updatedAt

const addressObjectSchema = z
  .object({
    road: z.string().optional(),
    city: z.string().optional(),
    city_district: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    country_code: z.string().optional(),
    postcode: z.string().optional(),
    suburb: z.string().optional(),
    "ISO3166-2-lvl4": z.string().optional(),
    "ISO3166-2-lvl8": z.string().optional(),
  })
  .passthrough(); // Allow additional properties

export const spotSchema = z.object({
  name: z.string().min(1, "Name is required"),
  spotType: z.enum(["masjid", "prayer_room", "restaurant", "cafe"]),
  address: addressObjectSchema,
  lat: z.number().refine((val) => val !== 0, {
    message: "Please select a location",
  }),
  lng: z.number().refine((val) => val !== 0, {
    message: "Please select a location",
  }),
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
  const [createdSpotId, setCreatedSpotId] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<SpotForm>({
    resolver: zodResolver(spotSchema),
    defaultValues: {
      name: "",
      spotType: "masjid",
      address: {},
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
    console.log("pinged!");
    if (!auth.currentUser) {
      console.log("❌ No authenticated user");
      Alert.alert("Only logged in users can add listings.");
      return;
    }
    console.log("✅ Form passed validation:", data);
    try {
      // Convert address object to display string
      const addressString =
        typeof data.address === "string"
          ? data.address
          : [
              data.address.road,
              data.address.city,
              data.address.postcode,
              data.address.country,
            ]
              .filter(Boolean)
              .join(", ") || "Address not available";

      const docRef = await addDoc(collection(db, "spots"), {
        ...data,
        address: addressString, // Store as string in Firestore
        addressDetails: data.address, // Also store the full object if needed
        location: {
          lat: data.lat,
          lng: data.lng,
          geopoint: `GeoPoint(${data.lat},${data.lng})`,
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        ownerID: auth.currentUser?.uid,
        source: "user",
      });

      console.log("🎉 Spot added with ID:", docRef.id);
      setCreatedSpotId(docRef.id);
      Alert.alert("Added", "Listing added successfully");
    } catch (err) {
      //TODO: add error handling or dont let unauth users see the form!!
      console.log("❌ Firestore addDoc failed:", err);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      nestedScrollEnabled={true}
      keyboardShouldPersistTaps="handled"
    >
      <View>
        {/* Name */}
        <Stack space={spacing.sm}>
          <Text style={typography.title}>Name *</Text>
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
        </Stack>

        {errors.name && <Text style={styles.error}>{errors.name.message}</Text>}
        {/* Spot Type */}
        <Stack space={spacing.sm}>
          <Text style={typography.title}>Spot Type *</Text>
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
        </Stack>
        {errors.spotType && (
          <Text style={styles.error}>{errors.spotType.message}</Text>
        )}

        <Stack space={spacing.sm}>
          <Text style={typography.title}>Location</Text>
          {/* Address */}
          <Controller
            control={control}
            name="lat"
            render={() => (
              <LocationPicker
                onLocationSelect={({ lat, lng, address, googleMapsUrl }) => {
                  setValue("lat", lat);
                  setValue("lng", lng);
                  setValue("address", address);
                  setValue("googleMapsUrl", googleMapsUrl);
                }}
              />
            )}
          />
        </Stack>
        {errors.address && (
          <Text style={styles.error}>
            {typeof errors.address === "object" &&
            errors.address !== null &&
            "message" in errors.address
              ? String(errors.address.message)
              : "Please select a location"}
          </Text>
        )}
        {errors.lat && <Text style={styles.error}>{errors.lat.message}</Text>}
        {errors.lng && <Text style={styles.error}>{errors.lng.message}</Text>}

        {/* Amenities */}
        <Stack space={spacing.sm}>
          <Text style={typography.title}>Amenities</Text>
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
        </Stack>

        {/* Submit */}
        <Stack space={spacing.sm}>
          <Button
            title="Submit"
            onPress={() => {
              console.log("Button pressed, errors:", errors);
              handleSubmit(onSubmit, (err) => {
                console.log("Validation errors:", err);
                Alert.alert(
                  "Validation Error",
                  "Please fill in all required fields. Check the form for details."
                );
              })();
            }}
          />
        </Stack>
        {createdSpotId && <SpotImagesUploader spotId={createdSpotId} />}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
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
