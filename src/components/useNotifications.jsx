import {
  collection,
  onSnapshot,
  query,
  where,
  getDoc,
  doc,
} from "firebase/firestore";
import { auth, db } from "../firebase";
import { useEffect, useState } from "react";

export default function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const userId = auth.currentUser?.uid;

  useEffect(() => {
    if (!userId) return;

    const q = query(collection(db, "posts"), where("uid", "==", userId));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const newNotifications = [];

      for (const postDoc of snapshot.docs) {
        const data = postDoc.data();
        if (data.requests && data.requests.length > 0) {
          for (const requesterUid of data.requests) {
            const userSnap = await getDoc(doc(db, "users", requesterUid));
            const userData = userSnap.exists()
              ? userSnap.data()
              : { fuldenavn: requesterUid };
            newNotifications.push({
              postId: postDoc.id,
              requesterUid,
              requesterName: userData.fuldenavn,
              postTitle: data.title,
            });
          }
        }
      }

      setNotifications(newNotifications);
    });

    return () => unsubscribe();
  }, [userId]);

  return notifications;
}
