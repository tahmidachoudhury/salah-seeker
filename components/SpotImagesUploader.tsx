import { useState } from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import {
  arrayUnion,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { storage, db, auth } from "@/lib/firebase";

type Props = { spotId: string };

export default function SpotImagesUploader({ spotId }: Props) {
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);

  const pickAndUpload = async () => {
    try {
      setBusy(true);
      setProgress(null);

      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) throw new Error("Media library permission denied");

      const res = await ImagePicker.launchImageLibraryAsync({
        allowsMultipleSelection: true,
        selectionLimit: 3,
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.9,
      });
      if (res.canceled) return;

      // Upload sequentially for simplicity (stable on mobile)
      for (let i = 0; i < res.assets.length; i++) {
        const a = res.assets[i];
        const uri = a.uri;
        const extGuess = a.fileName?.split(".").pop()?.toLowerCase() || "jpg";
        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const path = `spots/${spotId}/${id}.${extGuess}`;

        // Convert to Blob
        const blob = await (await fetch(uri)).blob();

        // Upload
        await new Promise<void>((resolve, reject) => {
          const task = uploadBytesResumable(ref(storage, path), blob, {
            contentType: a.mimeType || "image/jpeg",
          });
          task.on(
            "state_changed",
            (snap) => {
              const pct = Math.round(
                (snap.bytesTransferred / snap.totalBytes) * 100
              );
              setProgress(pct);
            },
            (err) => reject(err),
            async () => {
              const url = await getDownloadURL(task.snapshot.ref);
              // Save into Firestore array
              await updateDoc(doc(db, "spots", spotId), {
                images: arrayUnion({
                  url,
                  path,
                  width: a.width,
                  height: a.height,
                  uploadedAt: serverTimestamp(),
                  uploadedBy: auth.currentUser?.uid ?? null,
                }),
                updatedAt: serverTimestamp(),
              });
              resolve();
            }
          );
        });
      }
    } catch (e) {
      console.error("❌ Image upload failed:", e);
    } finally {
      setBusy(false);
      setProgress(null);
    }
  };

  return (
    <View style={{ marginTop: 12 }}>
      <Pressable
        onPress={pickAndUpload}
        disabled={busy}
        style={{
          backgroundColor: busy ? "#aaa" : "#2e4e2c",
          paddingVertical: 10,
          borderRadius: 10,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "white", fontWeight: "600" }}>
          {busy
            ? progress != null
              ? `Uploading… ${progress}%`
              : "Uploading…"
            : "Upload photos (max 3)"}
        </Text>
      </Pressable>
    </View>
  );
}
