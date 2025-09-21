import { Platform, PermissionsAndroid } from "react-native";
import MapboxGL from "@rnmapbox/maps";

/**
 * Retrieves the user's current location
 * @returns {Promise<{lng: number, lat: number} | null>} User coordinates or null if unavailable
 */
export const getUserLocation = async () => {
  try {
    // Request location permission on Android
    if (Platform.OS === "android") {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );

      // Check if permission was denied
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        console.warn("Location permission denied");
        return null;
      }
    }

    // Get the last known location
    const location = await MapboxGL.locationManager.getLastKnownLocation();

    if (location && location.coords) {
      return {
        lng: location.coords.longitude,
        lat: location.coords.latitude,
      };
    }

    return null;
  } catch (error) {
    console.error("Error getting user location:", error);
    return null;
  }
};
