import { Magnetometer } from "expo-sensors";
import MapboxGL from "@rnmapbox/maps";
import { useEffect, useState } from "react";
import { PermissionsAndroid, Platform } from "react-native";
import { getQiblaBearing } from "@/utils/getQiblaBearing";
import { Text, View } from "@/components/Themed";
import { getUserLocation } from "@/utils/getUserLocation";

export default function QiblaScreen() {
  const [heading, setHeading] = useState(0);
  const [userCoords, setUserCoords] = useState<{
    lng: number;
    lat: number;
  } | null>(null);

  // compass heading
  useEffect(() => {
    const subscription = Magnetometer.addListener((data: any) => {
      let angle = Math.atan2(data.y, data.x) * (180 / Math.PI);
      if (angle < 0) angle += 360;
      setHeading(angle);
    });

    return () => subscription.remove();
  }, []);

  // user location
  useEffect(() => {
    const getLocation = async () => {
      const coords = await getUserLocation();
      if (coords) {
        setUserCoords(coords);
      }
    };
    getLocation();
  }, []);

  // says approx 118.7 in London which is correct
  const qiblaBearing = userCoords
    ? getQiblaBearing(userCoords.lat, userCoords.lng)
    : 0;

  const tolerance = 10; // degrees
  const facingQibla = Math.abs(heading - qiblaBearing) < tolerance;

  let rotation = qiblaBearing - heading;
  if (rotation < 0) rotation += 360;

  return (
    <View style={{ alignItems: "center", marginTop: 40 }}>
      <Text>Qibla Direction</Text>
      <View
        style={{
          width: 100,
          height: 100,
          borderRadius: 50,
          borderWidth: 2,
          borderColor: "black",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <View
          style={{
            width: 0,
            height: 0,
            borderLeftWidth: 15,
            borderRightWidth: 15,
            borderBottomWidth: 40,
            borderLeftColor: "transparent",
            borderRightColor: "transparent",
            borderBottomColor: "green",
            transform: [{ rotate: `${rotation}deg` }],
          }}
        />
      </View>
      <Text style={{ marginTop: 10 }}>
        {facingQibla ? "✅ Facing Qibla" : "↔ Adjust your direction"}
      </Text>
    </View>
  );
}
