import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db, auth } from "../firebase";

export default function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const currentUserId = auth.currentUser?.uid;

  useEffect(() => {
    if (!currentUserId) return;

    // Lyt til brugerens document for ALLE notifications
    const userDocRef = doc(db, "users", currentUserId);

    const unsubscribe = onSnapshot(userDocRef, (userDoc) => {
      if (!userDoc.exists()) {
        setNotifications([]);
        return;
      }

      const userData = userDoc.data();
      const allNotifications = userData.notifications || [];

      // Sorter efter nyeste først
      const sortedNotifications = allNotifications.sort((a, b) => {
        return (b.createdAt || 0) - (a.createdAt || 0);
      });

      // ✅ VIGTIG: Returner ALLE notifications (både pending og håndterede)
      setNotifications(sortedNotifications);
    });

    return () => unsubscribe();
  }, [currentUserId]);

  return notifications;
}