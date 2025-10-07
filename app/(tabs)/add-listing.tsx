import { Text, View } from "@/components/Themed";
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
import LocationPicker from "@/components/LocationPicker";
import SpotImagesUploader from "@/modules/spots/SpotImagesUploader";
import {
  deleteListing,
  getMyListings,
  updateListing,
} from "@/modules/spots/firestore";
import { SpotMarker } from "@/modules/spots/PrayerSpot";

//TODO: we still need directions, opening hours, availability, capacityHint, multiFaith, sectNotes, updatedAt

export const spotSchema = z.object({
  name: z.string().min(1, "Name is required"),
  spotType: z.enum(["masjid", "prayer_room", "restaurant", "cafe"]),
  address: z.string().min(1, "Address is required"),
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
    if (!auth.currentUser) {
      console.log("❌ No authenticated user");
      Alert.alert("Only logged in users can add listings.");
      return;
    }
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

  const [myListings, setMyListings] = useState<SpotMarker[]>([]);

  const loadListings = async () => {
    const listings: any = await getMyListings();
    setMyListings(listings);
  };

  useEffect(() => {
    loadListings();
  }, []);

  const handleUpdate = async (listing: SpotMarker) => {
    await updateListing(listing.id, { title: listing.name + " (Updated)" });
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

  const renderItem = ({ item }: any) => (
    <View style={{ padding: 12, borderBottomWidth: 1 }}>
      <Text style={{ fontWeight: "bold" }}>{item.name}</Text>
      <View style={{ flexDirection: "row", marginTop: 6, gap: 12 }}>
        <Pressable onPress={() => handleUpdate(item)}>
          <Text style={{ color: "blue" }}>Edit</Text>
        </Pressable>
        <Pressable onPress={() => handleDelete(item.id)}>
          <Text style={{ color: "red" }}>Delete</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View>
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
        <Text style={styles.label}>Location</Text>
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
        {createdSpotId && <SpotImagesUploader spotId={createdSpotId} />}
      </View>
      <View>
        <Text style={{ fontWeight: "bold", fontSize: 18, marginBottom: 8 }}>
          My Listings
        </Text>

        {myListings.length === 0 ? (
          <Text>No listings yet.</Text>
        ) : (
          myListings.map((item) => (
            <View
              key={item.id}
              style={{
                padding: 12,
                borderWidth: 1,
                borderColor: "#ccc",
                borderRadius: 8,
                marginBottom: 12,
              }}
            >
              <Text style={{ fontWeight: "600" }}>{item.name}</Text>
              <View style={{ flexDirection: "row", marginTop: 6, gap: 12 }}>
                <Pressable
                  onPress={() =>
                    Alert.alert("Delete?", "", [
                      { text: "Cancel" },
                      {
                        text: "Delete",
                        onPress: async () => {
                          await deleteListing(item.id);
                          loadListings();
                        },
                      },
                    ])
                  }
                  style={{
                    marginTop: 8,
                    backgroundColor: "#f66",
                    padding: 8,
                    borderRadius: 6,
                    flex: 1,
                  }}
                >
                  <Text style={{ color: "white", textAlign: "center" }}>
                    Delete
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    Alert.alert(
                      "Confirm Update",
                      "Change the name to 'Updated Spot'?",
                      [
                        { text: "Cancel" },
                        {
                          text: "Yes",
                          onPress: async () => {
                            await updateListing(item.id, {
                              name: "Updated Spot",
                            });
                            loadListings();
                          },
                        },
                      ]
                    );
                  }}
                  style={{
                    marginTop: 8,
                    backgroundColor: "#66f",
                    padding: 8,
                    borderRadius: 6,
                    flex: 1,
                  }}
                >
                  <Text style={{ color: "white", textAlign: "center" }}>
                    Update
                  </Text>
                </Pressable>
              </View>
            </View>
            // <View style={{ padding: 12, borderBottomWidth: 1 }}>
            //   <Text style={{ fontWeight: "bold" }}>{item.name}</Text>
            //   <View style={{ flexDirection: "row", marginTop: 6, gap: 12 }}>
            //     <Pressable onPress={() => handleUpdate(item)}>
            //       <Text style={{ color: "blue" }}>Edit</Text>
            //     </Pressable>
            //     <Pressable onPress={() => handleDelete(item.id)}>
            //       <Text style={{ color: "red" }}>Delete</Text>
            //     </Pressable>
            //   </View>
            // </View>
          ))
        )}
      </View>
    </ScrollView>
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
