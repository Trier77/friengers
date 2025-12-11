import { useEffect } from "react";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../firebase";

/**
 * Hook der tracker brugerens online status
 * Opdaterer "lastActive" i Firebase hver 2. minut når brugeren er til stede
 */
export function useOnlineStatus() {
  useEffect(() => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const updateLastActive = async () => {
      try {
        await updateDoc(doc(db, "users", userId), {
          lastActive: serverTimestamp(),
        });
        console.log("✅ Updated lastActive timestamp");
      } catch (error) {
        console.error("Error updating lastActive:", error);
      }
    };

    // Opdater med det samme når komponenten loader
    updateLastActive();

    // Opdater hver 2. minut mens brugeren er aktiv
    const interval = setInterval(() => {
      updateLastActive();
    }, 2 * 60 * 1000); // 2 minutter

    // Cleanup når komponenten unmounter
    return () => {
      clearInterval(interval);
      // Kan eventuelt sætte offline status her
    };
  }, []);
}

/**
 * Hjælpefunktion til at tjekke om en bruger er online
 * @param {Timestamp} lastActive - Firebase timestamp fra brugerens lastActive felt
 * @returns {boolean} - true hvis brugeren var aktiv inden for sidste 5 minutter
 */
export function isUserOnline(lastActive) {
  if (!lastActive) return false;

  const now = Date.now();
  const lastActiveTime = lastActive.toMillis();
  const fiveMinutesInMs = 5 * 60 * 1000;

  return now - lastActiveTime < fiveMinutesInMs;
}
