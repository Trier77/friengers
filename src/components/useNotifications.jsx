import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  onSnapshot,
} from "firebase/firestore";
import { db, auth } from "../firebase";

export default function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const currentUserId = auth.currentUser?.uid;

  useEffect(() => {
    if (!currentUserId) return;

    // Lyt til brugerens document for invitations
    const userDocRef = doc(db, "users", currentUserId);

    const unsubscribeUser = onSnapshot(userDocRef, async (userDoc) => {
      if (!userDoc.exists()) return;

      const userData = userDoc.data();
      const invitationNotifs = userData.notifications || [];

      // Filtrer kun invitation notifications
      const invitations = invitationNotifs
        .filter((n) => n.type === "invitation")
        .map((n) => ({
          ...n,
          notificationType: "invitation",
        }));

      // Lyt til posts i real-time (IKKE getDocs - brug onSnapshot)
      const postsQuery = query(
        collection(db, "posts"),
        where("uid", "==", currentUserId)
      );

      const unsubscribePosts = onSnapshot(postsQuery, async (postsSnapshot) => {
        const requestNotifications = [];

        for (const postDoc of postsSnapshot.docs) {
          const postData = postDoc.data();

          if (postData.requests && postData.requests.length > 0) {
            for (const requesterUid of postData.requests) {
              const userSnap = await getDoc(doc(db, "users", requesterUid));
              const requesterData = userSnap.exists()
                ? userSnap.data()
                : {
                    fuldenavn: requesterUid,
                    profileImage: null,
                  };

              requestNotifications.push({
                postId: postDoc.id,
                requesterUid,
                requesterName:
                  requesterData.kaldenavn || requesterData.fuldenavn,
                requesterImage: requesterData.profileImage || null,
                postTitle: postData.title,
                notificationType: "request",
              });
            }
          }
        }

        // Kombiner begge typer notifications
        setNotifications([...requestNotifications, ...invitations]);
      });

      return () => unsubscribePosts();
    });

    return () => {
      unsubscribeUser();
    };
  }, [currentUserId]);

  return notifications;
}
