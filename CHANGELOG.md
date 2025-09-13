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

### 📅 August 14, 2025

- Switched from Mapbox "standard" style (broken on RN) to custom style with no imports
- Successfully rendered custom built Mapbox map + user location
- Set up Firestore query to load `spots` firestore table onto map
- Rendered spots on map with `PointAnnotation`
- Wired markers to navigate to `/listing-detail?id=...`
- Built `listing-detail.tsx` to fetch and display spot info (name, type, amenities, hours, etc.)
