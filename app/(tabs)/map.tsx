import { useEffect, useMemo, useState } from "react";
import {
  View,
  StyleSheet,
  PermissionsAndroid,
  Platform,
  TouchableOpacity,
} from "react-native";
import MapboxGL from "@rnmapbox/maps";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { PrayerSpot } from "@/modules/spots/PrayerSpot";
import { router } from "expo-router";
import { getDistanceMiles } from "@/utils/geo";
import { fetchPrayerTimes, getNextPrayer } from "@/lib/prayerTimes";
import { Text } from "@/components/ui/Themed";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import FilterPill from "@/components/ui/FilterPill";
import { getUserLocation } from "@/lib/getUserLocation";
import { spacing } from "@/components/ui/theme";

// ! Currently this component serves 3 jobs
// 1. filter `spots` table to closest to user in 5 mile radius
// 2. fetch the next prayer for users to see as a widget
// 3. filter closest spots to active filters (women, wudu, masjid)

//mapbox public key
MapboxGL.setAccessToken(
  "pk.eyJ1IjoidGFobWlkMDEiLCJhIjoiY21laDJkMnJjMDM0bjJrcDZucm1ubDZ5cCJ9.p85LMck0PSQRKa_obWk68w"
);

// Temporary, lean type for prayer spot just to test marker on map
type SpotMarker = {
  id: string; // Firebase document ID - always present from doc.id
  name: string;
  location: {
    lat: number;
    lng: number;
  };
  amenities: {
    toilets: boolean;
    women: boolean;
    wudu: boolean;
    disabilityAccess: boolean;
  };
  spotType: "masjid" | "prayer_room" | "restaurant" | "cafe";
  address?: string; // added from Nominatim
  googleMapsUrl?: string; // added for "Get Directions"
  verified?: boolean;
};

const DEFAULT_RADIUS = 5; // miles between the user and the furthest possible spot: currently set at 5

//pulls all entries from `spots` table and then filters them based on the radius set above
export const getNearbySpots = async (
  userLat: number,
  userLng: number,
  radiusMiles = DEFAULT_RADIUS
) => {
  const snapshot = await getDocs(collection(db, "spots"));

  const allSpots: SpotMarker[] = snapshot.docs.map((doc) => {
    const data = doc.data();
    // Remove any existing id field from document data to avoid conflicts
    const { id: _, ...cleanData } = data;
    return {
      id: doc.id, // ✅ guaranteed ID from metadata
      ...cleanData,
    } as SpotMarker;
  });

  // filters all the spots and only returns the closest
  const nearbySpots = allSpots.filter((spot) => {
    if (!spot.location?.lat || !spot.location?.lng) return false;
    const distance = getDistanceMiles(
      userLat,
      userLng,
      spot.location.lat,
      spot.location.lng
    );
    return distance <= radiusMiles;
  });

  return nearbySpots;
};

const DEMO_MODE = process.env.EXPO_PUBLIC_DEMO_MODE === "true";
const DEMO_LAT = Number(process.env.EXPO_PUBLIC_DEMO_LAT);
const DEMO_LNG = Number(process.env.EXPO_PUBLIC_DEMO_LNG);

export default function MapScreen() {
  const [userCoords, setUserCoords] = useState<{
    lng: number;
    lat: number;
  } | null>(null); // made this an object for readability
  const [spots, setSpots] = useState<SpotMarker[]>([]);
  const [nextPrayer, setNextPrayer] = useState<{
    name: string;
    formatted: string | null;
  } | null>(null);
  const [showWudu, setShowWudu] = useState(false);
  const [showWomen, setShowWomen] = useState(false);
  const [showMasjid, setShowMasjid] = useState(false);

  // retrieves user location
  useEffect(() => {
    const getLocation = async () => {
      const coords = await getUserLocation();
      if (coords) {
        setUserCoords(coords);
      }
    };
    getLocation();
  }, []);

  const effectiveLat = DEMO_MODE ? DEMO_LAT : userCoords?.lat ?? 51.5074;
  const effectiveLng = DEMO_MODE ? DEMO_LNG : userCoords?.lng ?? -0.1278;

  // retrieves the spots closest to the user based on location and default radius
  useEffect(() => {
    if (!userCoords) return;
    (async () => {
      const spots = await getNearbySpots(
        effectiveLat,
        effectiveLng,
        DEFAULT_RADIUS // 5 miles
      );
      setSpots(spots);
    })();
  }, [userCoords]);

  // fetch the next prayer for users to see, based on their location
  useEffect(() => {
    if (!userCoords) return;

    (async () => {
      const timings = await fetchPrayerTimes(effectiveLat, effectiveLng);
      const next = getNextPrayer(timings);
      setNextPrayer(next);
    })();
  }, [userCoords]);

  // these are the spots that are shown on the map based on active filters
  const filteredSpots = useMemo(() => {
    return spots.filter((spot) => {
      if (showWudu && !spot.amenities.wudu) return false;
      if (showWomen && !spot.amenities.women) return false;
      if (showMasjid && !(spot.spotType == "masjid")) return false;
      return true;
    });
  }, [spots, showWudu, showWomen, showMasjid]);

  return (
    <View style={styles.container}>
      {/* Using custom map with point annotation and zooming into user's location */}
      <MapboxGL.MapView
        style={styles.map}
        styleURL="mapbox://styles/tahmid01/cmitea7gm002801r5ci2aecoc"
        // styleURL="mapbox://styles/mapbox/light-v11" -> just a backup style to test and compare
        logoEnabled={false}
      >
        <MapboxGL.Camera
          zoomLevel={13}
          centerCoordinate={
            userCoords ? [effectiveLng, effectiveLat] : [-0.1278, 51.5074]
          } // Fallback to London
          maxBounds={{
            // note: lng, lat
            sw: [-10.5, 49.0],
            ne: [2.1, 59.0],
          }}
        />
        <MapboxGL.UserLocation
          visible={!DEMO_MODE}
          showsUserHeadingIndicator={true}
        />

        {/* displays spots based on active filters */}
        {filteredSpots.map((spot) =>
          spot.location?.lat && spot.location?.lng ? (
            <MapboxGL.PointAnnotation
              key={spot.id}
              id={spot.id}
              coordinate={[spot.location.lng, spot.location.lat]}
              onSelected={() => router.push(`/listing-detail?id=${spot.id}`)}
            >
              <View />
            </MapboxGL.PointAnnotation>
          ) : null
        )}
      </MapboxGL.MapView>

      {/* Prayer Time banner to show the next prayer */}
      <View style={styles.prayerBanner}>
        {nextPrayer ? (
          <Text>
            Next prayer: {nextPrayer.name} ({nextPrayer.formatted})
          </Text>
        ) : (
          <Text>Loading prayer times...</Text>
        )}
      </View>

      {/* FilterPill component for toggling Women, Wudu, Masjid */}
      {/* I should add a currently open filter to only return open prayer rooms!! */}
      <View style={styles.filterBar}>
        <FilterPill
          label="Wudu"
          active={showWudu}
          onPress={() => setShowWudu(!showWudu)}
        />
        <FilterPill
          label="Women"
          active={showWomen}
          onPress={() => setShowWomen(!showWomen)}
        />
        <FilterPill
          label="Masjid"
          active={showMasjid}
          onPress={() => setShowMasjid(!showMasjid)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  prayerBanner: {
    position: "absolute",
    top: 40,
    left: 20,
    right: 20,
    backgroundColor: "white",
    padding: spacing.md,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  filterBar: {
    flexDirection: "row",
    position: "absolute",
    top: 80,
    left: 20,
    justifyContent: "center",
    marginVertical: spacing.md,
  },
});
