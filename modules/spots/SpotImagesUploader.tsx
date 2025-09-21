import { useState } from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import {
  arrayUnion,
  doc,
  updateDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { storage, db, auth } from "@/lib/firebase";

type Props = { spotId: string };

export default function SpotImagesUploader({ spotId }: Props) {
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [currentImage, setCurrentImage] = useState(0);
  const [totalImages, setTotalImages] = useState(0);

  const pickAndUpload = async () => {
    try {
      setBusy(true);
      setProgress(null);
      setCurrentImage(0);
      setTotalImages(0);

      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) throw new Error("Media library permission denied");

      const res = await ImagePicker.launchImageLibraryAsync({
        allowsMultipleSelection: true,
        selectionLimit: 3,
        mediaTypes: ["images"],
        quality: 0.9,
      });
      if (res.canceled) return;

      setTotalImages(res.assets.length);

      // Upload sequentially for simplicity (stable on mobile)
      for (let i = 0; i < res.assets.length; i++) {
        setCurrentImage(i + 1);
        const a = res.assets[i];
        const uri = a.uri;
        const extGuess = a.fileName?.split(".").pop()?.toLowerCase() || "jpg";
        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const path = `spots/${spotId}/${id}.${extGuess}`;

        try {
          // Convert to Blob
          const blob = await (await fetch(uri)).blob();

          // Upload with proper error handling
          const downloadURL = await uploadImageAndGetURL(blob, path, a);

          // Save into Firestore array - use Timestamp.now() instead of serverTimestamp()
          // because serverTimestamp() doesn't work inside arrayUnion()
          await updateDoc(doc(db, "spots", spotId), {
            images: arrayUnion({
              url: downloadURL,
              path,
              width: a.width,
              height: a.height,
              uploadedAt: Timestamp.now(), // Use Timestamp.now() instead
              uploadedBy: auth.currentUser?.uid ?? null,
            }),
            updatedAt: serverTimestamp(), // This works fine outside arrayUnion
          });

          console.log(
            `✅ Successfully uploaded image ${i + 1}: ${downloadURL}`
          );
        } catch (imageError) {
          console.error(`❌ Failed to upload image ${i + 1}:`, imageError);
          // Continue with next image instead of failing completely
        }
      }
    } catch (e) {
      console.error("❌ Image upload failed:", e);
    } finally {
      setBusy(false);
      setProgress(null);
      setCurrentImage(0);
      setTotalImages(0);
    }
  };

  const uploadImageAndGetURL = (
    blob: Blob,
    path: string,
    asset: any
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      const task = uploadBytesResumable(ref(storage, path), blob, {
        contentType: asset.mimeType || "image/jpeg",
      });

      task.on(
        "state_changed",
        (snap) => {
          const pct = Math.round(
            (snap.bytesTransferred / snap.totalBytes) * 100
          );
          setProgress(pct);
        },
        (error) => {
          console.error("Upload task error:", error);
          reject(error);
        },
        async () => {
          try {
            const url = await getDownloadURL(task.snapshot.ref);
            resolve(url);
          } catch (urlError) {
            console.error("Failed to get download URL:", urlError);
            reject(urlError);
          }
        }
      );
    });
  };

  const getStatusText = () => {
    if (!busy) return "Upload photos (max 3)";

    if (totalImages > 1) {
      return progress != null
        ? `Uploading ${currentImage}/${totalImages}… ${progress}%`
        : `Uploading ${currentImage}/${totalImages}…`;
    }

    return progress != null ? `Uploading… ${progress}%` : "Uploading…";
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
          {getStatusText()}
        </Text>
      </Pressable>
      {busy && (
        <View style={{ marginTop: 8, alignItems: "center" }}>
          <ActivityIndicator size="small" color="#2e4e2c" />
        </View>
      )}
    </View>
  );
}
