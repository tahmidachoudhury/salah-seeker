import React, { useEffect, useState } from "react";
import MapboxGL from "@rnmapbox/maps";
import { View, ActivityIndicator, Text } from "react-native";
import { getUserLocation } from "@/lib/getUserLocation";

type Props = {
  onLocationSelect: (data: {
    lat: number;
    lng: number;
    address: Record<string, any>; // Nominatim address object
    googleMapsUrl: string;
  }) => void;
};

const DEMO_MODE = process.env.EXPO_PUBLIC_DEMO_MODE === "true";
const DEMO_LAT = Number(process.env.EXPO_PUBLIC_DEMO_LAT);
const DEMO_LNG = Number(process.env.EXPO_PUBLIC_DEMO_LNG);

export default function LocationPicker({ onLocationSelect }: Props) {
  const [coords, setCoords] = useState<[number, number]>([0, 0]); // [lng, lat]
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [display, setDisplay] = useState<string | null>(null);

  useEffect(() => {
    const getLocation = async () => {
      const coordinates = await getUserLocation();
      if (coordinates) {
        const userCoords: [number, number] = DEMO_MODE
          ? [DEMO_LNG, DEMO_LAT]
          : [coordinates.lng, coordinates.lat];
        setCoords(userCoords);
      }
    };
    getLocation();
  }, []);

  async function fetchAddress(lat: number, lng: number) {
    try {
      setLoading(true);
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;
      const res = await fetch(url, {
        headers: { "User-Agent": "salah-seeker/1.0" }, // required by Nominatim
      });
      const data = await res.json();
      const display = data.display_name || "Unknown address";
      const addr = data.address || "Unknown address";

      setAddress(addr);
      setDisplay(display);

      onLocationSelect({
        lat,
        lng,
        address: addr,
        googleMapsUrl: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
      });
    } catch (err) {
      console.error("❌ Nominatim failed:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={{ height: 200 }}>
      <MapboxGL.MapView style={{ flex: 1 }}>
        <MapboxGL.Camera zoomLevel={14} centerCoordinate={coords} />

        <MapboxGL.PointAnnotation
          id="pin"
          coordinate={coords}
          draggable
          onDragEnd={(e) => {
            const [lng, lat] = e.geometry.coordinates as [number, number];
            setCoords([lng, lat]);
            fetchAddress(lat, lng);
          }}
        >
          <View />
        </MapboxGL.PointAnnotation>
      </MapboxGL.MapView>

      {loading && (
        <ActivityIndicator
          style={{ position: "absolute", top: 20, alignSelf: "center" }}
        />
      )}
      {address && (
        <View
          style={{
            position: "absolute",
            bottom: 0,
            backgroundColor: "white",
            padding: 10,
            borderWidth: 1,
          }}
        >
          <Text style={{ fontSize: 12 }}>{display}</Text>
        </View>
      )}
    </View>
  );
}
