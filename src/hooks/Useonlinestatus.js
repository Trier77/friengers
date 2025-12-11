import { useEffect } from "react";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../firebase";

/**
 * Hook der tracker brugerens RIGTIGE online status
 * Sætter isOnline: true når brugeren er aktiv
 * Sætter isOnline: false når brugeren lukker appen eller mister forbindelse
 */
export function useOnlineStatus() {
  useEffect(() => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const userStatusRef = doc(db, "users", userId);

    // Funktion til at sætte online status
    const setOnline = async () => {
      try {
        await setDoc(
          userStatusRef,
          {
            isOnline: true,
            lastActive: serverTimestamp(),
          },
          { merge: true }
        );
        console.log("🟢 User is now ONLINE");
      } catch (error) {
        console.error("Error setting online:", error);
      }
    };

    // Funktion til at sætte offline status
    const setOffline = async () => {
      try {
        await setDoc(
          userStatusRef,
          {
            isOnline: false,
            lastActive: serverTimestamp(),
          },
          { merge: true }
        );
        console.log("⚪ User is now OFFLINE");
      } catch (error) {
        console.error("Error setting offline:", error);
      }
    };

    // Sæt online med det samme
    setOnline();

    // Opdater hver 30 sekund for at vise vi stadig er online
    const interval = setInterval(() => {
      setOnline();
    }, 30 * 1000); // 30 sekunder

    // Lyt til når brugeren lukker siden/appen
    const handleBeforeUnload = () => {
      setOffline();
    };

    // Lyt til når brugeren lukker browseren/tab
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Lyt til når appen går i baggrunden (mobile)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setOffline();
      } else {
        setOnline();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Cleanup når komponenten unmounter
    return () => {
      clearInterval(interval);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      setOffline(); // Sæt offline når komponenten unmounter
    };
  }, []);
}

/**
 * Hjælpefunktion til at tjekke om en bruger er online LIGE NU
 * @param {boolean} isOnline - Firebase boolean fra brugerens isOnline felt
 * @param {Timestamp} lastActive - Firebase timestamp fra brugerens lastActive felt
 * @returns {boolean} - true hvis brugeren er online lige nu
 */
export function isUserOnline(isOnline, lastActive) {
  // Hvis brugeren har isOnline sat til true, brug det
  if (isOnline === true) return true;
  if (isOnline === false) return false;

  // Fallback: hvis isOnline ikke findes, brug lastActive (gammel metode)
  if (!lastActive) return false;

  const now = Date.now();
  const lastActiveTime = lastActive.toMillis();
  const oneMinuteInMs = 1 * 60 * 1000; // 1 minut

  return now - lastActiveTime < oneMinuteInMs;
}
