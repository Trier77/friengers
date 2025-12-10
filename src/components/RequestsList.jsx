import {
  doc,
  updateDoc,
  arrayRemove,
  arrayUnion,
  getDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { useState, useEffect } from "react";

const handleRequest = async (postId, userId, approve) => {
  const postRef = doc(db, "posts", postId);

  if (approve) {
    await updateDoc(postRef, {
      participants: arrayUnion(userId),
      requests: arrayRemove(userId),
    });
  } else {
    await updateDoc(postRef, {
      requests: arrayRemove(userId),
    });
  }
};

export default function RequestsList({ post }) {
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
              Accepter
            </button>
            <button
              onClick={() => handleRequest(post.id, user.uid, false)}
              className="px-2 py-1 bg-red-500 text-white rounded"
            >
              Afvis
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
