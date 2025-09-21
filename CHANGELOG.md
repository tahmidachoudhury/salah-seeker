# Salah Seeker — Changelog

---

### 📅 August 8, 2025

- Created Expo app with TypeScript
- Set up Firebase project + config
- Built login screen with Firebase Auth

### 📅 August 9, 2025

- Defined Firestore schema for prayer spots
- Seeded 20 dummy listings
- Built `/add-spot.tsx` form
- Fixed Firestore rules (write access for signed-in users)

### 📅 August 13, 2025

- Switched from Mapbox "standard" style (broken on React Native) to custom style with no imports
- Successfully rendered custom built Mapbox map + user location
- Set up Firestore query to load `spots` firestore table onto map
- Rendered spots on map with `PointAnnotation`
- Wired markers to navigate to `/listing-detail?id=...`
- Built `listing-detail.tsx` to fetch and display spot info (name, type, amenities, hours, etc.)

### 📅 August 14, 2025

- Nearby Feed → filtering works client-side (5 miles).
- Prayer Times API → integrated, showing next prayer with hours/minutes.
- Qibla Compass → screen renders, arrow rotates.
  - Bearing calculation correct (~118° for London).

### 📅 August 15, 2025

- Map filters: Added Wudu / Women / Toilets toggles with client-side filtering; derived `filteredSpots` via `useMemo` from `nearbySpots` (5-mile radius).
- Index dashboard: Built home screen with “Next Prayer” banner + quick links to Map and Qibla.
- Build fix: Resolved import issue that was crashing the eas build.
- Add-Listing validation: Integrated Zod + react-hook-form (`zodResolver`) for required fields (`name`, `spotType`, `address`, `lat`, `lng`) and amenities; inline error messages.
- Location picking: Implemented Mapbox pin selection flow:
- User drops/moves pin → capture lat/lng.
- Reverse-geocode via Nominatim to get human-readable address.
- Save to Firestore: `lat`, `lng`, `address`, and `googleDirectionsUrl` →
  `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`.

### 📅 August 16, 2025

- Made `getUserLocation` an exported utility function to organise code

```
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
```
