import { useEffect, useState } from "react";
import { View, StyleSheet, PermissionsAndroid, Platform } from "react-native";
import MapboxGL from "@rnmapbox/maps";

MapboxGL.setAccessToken(
  "pk.eyJ1IjoidGFobWlkMDEiLCJhIjoiY21laDJkMnJjMDM0bjJrcDZucm1ubDZ5cCJ9.p85LMck0PSQRKa_obWk68w"
);

export default function MapScreen() {
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
        // styleURL="mapbox://styles/mapbox/light-v11"
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
      </MapboxGL.MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
});
