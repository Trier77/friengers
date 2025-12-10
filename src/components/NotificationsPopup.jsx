import { doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { db } from "../firebase";
import useNotifications from "../components/useNotifications";

export default function NotificationsPopup() {
  const notifications = useNotifications();

  const handleResponse = async (postId, requesterUid, approve) => {
    const postRef = doc(db, "posts", postId);

    if (approve) {
      await updateDoc(postRef, {
        participants: arrayUnion(requesterUid),
        requests: arrayRemove(requesterUid),
      });
    } else {
      await updateDoc(postRef, {
        requests: arrayRemove(requesterUid),
      });
    }
  };

  if (notifications.length === 0) return null;

  return (
    <div className="absolute top-10 right-0 w-80 p-4 bg-(--secondary) rounded-lg shadow-lg z-50">
      {notifications.map((n) => (
        <div
          key={`${n.postId}-${n.requesterUid}`}
          className="flex justify-between items-center gap-3"
        >
          <div>
            <div className="flex gap-1">
              <p className="text-(--white) font-bold text-sm">
                {n.requesterName}
              </p>
              <p className="text-(--white) text-sm">vil tilmelde sig:</p>
            </div>

            <p className="text-(--white) font-bold text-sm">{n.postTitle}</p>
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={() => handleResponse(n.postId, n.requesterUid, false)}
              className="text-sm font-bold h-6 w-10 text-(--white) rounded"
            >
              Nej
            </button>
            <button
              onClick={() => handleResponse(n.postId, n.requesterUid, true)}
              className="text-sm font-bold h-6 w-10 bg-(--white) text-(--secondary) rounded"
            >
              Ja
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
