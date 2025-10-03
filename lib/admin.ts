import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export function useIsAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setLoading(true); // Set loading to true when auth state changes

      try {
        if (!user) {
          setIsAdmin(false);
          return;
        }

        // Check if user document exists in admins collection
        const adminDoc = await getDoc(doc(db, "users", user.uid));
        setIsAdmin(adminDoc.exists());
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
      } finally {
        setLoading(false); // Always set loading to false
      }
    });

    return unsub;
  }, []);

  return { isAdmin, loading };
}
