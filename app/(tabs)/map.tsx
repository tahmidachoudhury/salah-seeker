import { useEffect, useState } from "react";
import { View, StyleSheet, PermissionsAndroid, Platform } from "react-native";
import MapboxGL from "@rnmapbox/maps";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/services/firebase";
import { PrayerSpot } from "@/types/PrayerSpot";
import { router } from "expo-router";
import { getDistanceMiles } from "@/utils/geo";
import { fetchPrayerTimes, getNextPrayer } from "@/utils/prayerTimes";
import { Text } from "@/components/Themed";

// ! Currently this componenet serves 3 jobs
// 1. get user location
// 2. filter spots closest to user in 5 mile radius
// 3. fetch the next prayer for users to see as a widget

//mapbox public key
MapboxGL.setAccessToken(
  "pk.eyJ1IjoidGFobWlkMDEiLCJhIjoiY21laDJkMnJjMDM0bjJrcDZucm1ubDZ5cCJ9.p85LMck0PSQRKa_obWk68w"
);

// Temporary, lean type for prayer spot just to test marker on map
type SpotMarker = {
  id: string;
  name: string;
  location: {
    lat: number;
    lng: number;
  };
};

const DEFAULT_RADIUS = 5; // miles between the user and the furthest possible spot: currently set at 5

//pulls all entries from `spots` table and then filters them based on the radius set above
export const getNearbySpots = async (
  userLat: number,
  userLng: number,
  radiusMiles = DEFAULT_RADIUS
) => {
  const snapshot = await getDocs(collection(db, "spots"));
  const allSpots: any[] = [];
  snapshot.forEach((doc) => allSpots.push(doc.data()));

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

export default function MapScreen() {
  const [spots, setSpots] = useState<SpotMarker[]>([]);

  const [userCoords, setUserCoords] = useState<{
    lng: number;
    lat: number;
  } | null>(null); // made this an object for readability

  const [nextPrayer, setNextPrayer] = useState<{
    name: string;
    formatted: string | null;
  } | null>(null);

  // retrieves user location
  useEffect(() => {
    const getLocation = async () => {
      if (Platform.OS === "android") {
        await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
      }
      const location = await MapboxGL.locationManager.getLastKnownLocation();
      if (location) {
        setUserCoords({
          lng: location.coords.longitude,
          lat: location.coords.latitude,
        });
      }
    };
    getLocation();
  }, []);

  // retrieves the spots closest to the user based on location and default radius
  useEffect(() => {
    if (!userCoords) return;
    (async () => {
      const spots = await getNearbySpots(
        userCoords.lat,
        userCoords.lng,
        DEFAULT_RADIUS // 5 miles
      );
      setSpots(spots);
    })();
  }, [userCoords]);

  // fetch the next prayer for users to see, based on their location
  useEffect(() => {
    if (!userCoords) return;

    (async () => {
      const timings = await fetchPrayerTimes(userCoords.lat, userCoords.lng);
      const next = getNextPrayer(timings);
      setNextPrayer(next);
    })();
  }, [userCoords]);

  return (
    <View style={styles.container}>
      <MapboxGL.MapView
        style={styles.map}
        styleURL="mapbox://styles/tahmid01/cmfikgi6b004k01quevez8hsu"
        // styleURL="mapbox://styles/mapbox/light-v11" -> just a backup style to test and compare
        logoEnabled={false}
      >
        <MapboxGL.Camera
          zoomLevel={13}
          centerCoordinate={
            userCoords ? [userCoords.lng, userCoords.lat] : [-0.1278, 51.5074]
          } // Fallback to London
        />
        <MapboxGL.UserLocation
          visible={true}
          showsUserHeadingIndicator={true}
        />
        {spots.map((spot) =>
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
      <View style={styles.prayerBanner}>
        {nextPrayer ? (
          <Text>
            Next prayer: {nextPrayer.name} ({nextPrayer.formatted})
          </Text>
        ) : (
          <Text>Loading prayer times...</Text>
        )}
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
    padding: 10,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});
