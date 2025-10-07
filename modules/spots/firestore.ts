import { db } from "@/lib/firebase";
import {
  doc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { auth } from "@/lib/firebase";

export const updateListing = async (listingId: string, updatedData: any) => {
  try {
    const listingRef = doc(db, "spots", listingId);
    await updateDoc(listingRef, updatedData);
    console.log("Listing updated successfully!");
  } catch (error) {
    console.error("Error updating listing:", error);
  }
};

export const deleteListing = async (listingId: string) => {
  try {
    const listingRef = doc(db, "spots", listingId);
    await deleteDoc(listingRef);
    console.log("Listing deleted successfully!");
  } catch (error) {
    console.error("Error deleting listing:", error);
  }
};

export const getMyListings = async () => {
  const user = auth.currentUser;
  if (!user) return [];

  try {
    const q = query(collection(db, "spots"), where("ownerID", "==", user.uid));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching user listings:", error);
    return [];
  }
};

interface User {
  id: string;
  userId: string;
  displayName: string;
  [key: string]: any; // allow other optional fields (like email, photoURL, etc.)
}

//bug and doesnt work - will figure out later
export const getSpotOwner = async (ownerID: string): Promise<string | null> => {
  try {
    const q = query(collection(db, "users"), where("userId", "==", ownerID));
    const snapshot = await getDocs(q);

    const users: User[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as User[];

    return users.length > 0 ? users[0].displayName : null;
  } catch (error) {
    console.error("Error fetching spot owner:", error);
    return null;
  }
};
