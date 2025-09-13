import { useEffect, useState } from "react";
import { View, StyleSheet, PermissionsAndroid, Platform } from "react-native";
import MapboxGL from "@rnmapbox/maps";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/services/firebase";
import { PrayerSpot } from "@/types/PrayerSpot";

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

export default function MapScreen() {
  //fetching prayer spots test
  const [spots, setSpots] = useState<SpotMarker[]>([]);

  // fetches prayerspots from "spots" table.
  //types the spot to temporary SpotMarker interface
  useEffect(() => {
    const fetchSpots = async () => {
      try {
        const snap = await getDocs(collection(db, "spots"));
        const rawSpots = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as SpotMarker[];

        setSpots(rawSpots);
      } catch (err) {
        console.error("❌ Error fetching spots from Firestore:", err);
      }
    };

    fetchSpots();
  }, []);

  const [coords, setCoords] = useState<[number, number] | null>(null);

  useEffect(() => {
    const getLocation = async () => {
      if (Platform.OS === "android") {
        await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
      }
      const location = await MapboxGL.locationManager.getLastKnownLocation();
      if (location) {
        setCoords([location.coords.longitude, location.coords.latitude]);
      }
    };
    getLocation();
  }, []);

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
          centerCoordinate={coords || [-0.1278, 51.5074]} // Fallback to London
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
            >
              <></>
            </MapboxGL.PointAnnotation>
          ) : null
        )}
      </MapboxGL.MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
});
