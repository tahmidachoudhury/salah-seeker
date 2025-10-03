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

        // Check if role = "admin" exists in user collection
        if (user.uid) {
          const adminDoc = await getDoc(doc(db, "users", user.uid));
          if (adminDoc.exists()) {
            const data = adminDoc.data(); // returns an object with all the fields
            setIsAdmin(data.role === "admin");
          } else {
            setIsAdmin(false);
          }
        } else {
          setIsAdmin(false);
        }
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
