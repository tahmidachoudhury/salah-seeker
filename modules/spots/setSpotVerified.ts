import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";

export async function setSpotVerified(spotId: string, value: boolean) {
  await updateDoc(doc(db, "spots", spotId), {
    verified: value,
    verifiedBy: auth.currentUser?.uid ?? null,
    updatedAt: serverTimestamp(),
  });
}
