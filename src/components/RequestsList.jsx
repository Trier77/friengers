import {
  doc,
  updateDoc,
  arrayRemove,
  arrayUnion,
  getDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

// ⭐ Opdateret handleRequest med historik
const handleRequest = async (postId, userId, approve) => {
  const postRef = doc(db, "posts", postId);
  const postSnap = await getDoc(postRef);
  const postData = postSnap.data();

  const existingNotifications = postData.notifications || [];

  // 1. Find den tilhørende notifikation
  const updatedNotifications = existingNotifications.map((n) => {
    if (n.requesterUid === userId) {
      return {
        ...n,
        status: approve ? "accepted" : "rejected",
        handledAt: Date.now(),
      };
    }
    return n;
  });

  // 2. Opdater Firestore
  if (approve) {
    await updateDoc(postRef, {
      participants: arrayUnion(userId),
      requests: arrayRemove(userId),
      notifications: updatedNotifications,
    });
  } else {
    await updateDoc(postRef, {
      requests: arrayRemove(userId),
      notifications: updatedNotifications,
    });
  }
};

export default function RequestsList({ post }) {
  const {t} = useTranslation();
  const [requestUsers, setRequestUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const usersData = await Promise.all(
        (post.requests || []).map(async (uid) => {
          const docSnap = await getDoc(doc(db, "users", uid));
          return docSnap.exists() ? { uid, ...docSnap.data() } : { uid };
        })
      );
      setRequestUsers(usersData);
    };
    fetchUsers();
  }, [post.requests]);

  if (!post.requests || post.requests.length === 0) return null;

  return (
    <div className="p-2 border rounded-lg mt-2 bg-(--primary)">
      <h3 className="font-bold text-(--secondary)">Forespørgsler</h3>

      {requestUsers.map((user) => (
        <div
          key={user.uid}
          className="flex justify-between items-center mt-1 p-1 bg-(--secondary) rounded"
        >
          <p className="text-(--white)">{user.fuldenavn || user.uid}</p>
          <div className="flex gap-2">
            <button
              onClick={() => handleRequest(post.id, user.uid, true)}
              className="px-2 py-1 bg-green-500 text-white rounded"
            >
              {t("accept")}
            </button>
            <button
              onClick={() => handleRequest(post.id, user.uid, false)}
              className="px-2 py-1 bg-red-500 text-white rounded"
            >
              {t("deny")}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
