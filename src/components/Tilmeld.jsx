import { doc, updateDoc, arrayUnion, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";

export default function Tilmeld({
  postId,
  participants,
  requests = [],
  onUpdate,
  className = "",
}) {
  const { t } = useTranslation();
  const userId = auth.currentUser.uid;
  const [localParticipants, setLocalParticipants] = useState(
    Array.isArray(participants) ? participants : []
  );
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef(null);

  const isJoined = localParticipants.includes(userId);
  const isRequested = requests.includes(userId);

  const [showNotification, setShowNotification] = useState(false);

  const isActive = isJoined || isRequested;

  const sendJoinRequest = async (postId) => {
    const userId = auth.currentUser.uid;
    const postRef = doc(db, "posts", postId);
    const userSnap = await getDoc(doc(db, "users", userId));
    const userData = userSnap.exists() ? userSnap.data() : {};
    const postSnap = await getDoc(postRef);
    const postData = postSnap.data();
    const postOwnerUid = postData.uid;

    await updateDoc(postRef, {
      requests: arrayUnion(userId),
    });

    const ownerRef = doc(db, "users", postOwnerUid);
    const ownerSnap = await getDoc(ownerRef);

    if (ownerSnap.exists()) {
      const ownerData = ownerSnap.data();
      const existingNotifications = ownerData.notifications || [];

      const filteredNotifications = existingNotifications.filter(
        (n) =>
          !(
            n.notificationType === "request" &&
            n.postId === postId &&
            n.requesterUid === userId &&
            (!n.status || n.status === "pending")
          )
      );

      const newNotification = {
        notificationType: "request",
        requesterUid: userId,
        requesterName: userData.kaldenavn || userData.fuldenavn || "Anonym",
        requesterImage: userData.profileImage || null,
        postId: postId,
        postTitle: postData.title || "Uden titel",
        status: "pending",
        createdAt: Date.now(),
      };

      await updateDoc(ownerRef, {
        notifications: [...filteredNotifications, newNotification],
      });
    }
  };

  const handleClick = async () => {
    if (isJoined || isRequested) return;

    try {
      await sendJoinRequest(postId);
      setShowNotification(true);
      onUpdate();

      setTimeout(() => {
        setShowNotification(false);
      }, 3000);
    } catch (error) {
      console.error(error);
    }
  };

  const handleMouseDown = () => {
    if (isJoined) {
      handleClick();
      return;
    }

    setProgress(0);

    intervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(intervalRef.current);
          handleClick();
          return 100;
        }
        return prev + 2;
      });
    }, 20);
  };

  const handleMouseUp = () => {
    clearInterval(intervalRef.current);
    setProgress(0);
  };

  return (
    <div>
      {showNotification &&
        createPortal(
          <>
            <div className="fixed inset-0 bg-(--white) opacity-60 z-40" />

            <div className="fixed w-60 text-center left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-(--secondary) font-bold text-(--white) p-2  rounded-full z-50">
              {t("request-sent")}
            </div>
          </>,
          document.body
        )}

      <button
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchEnd={handleMouseUp}
        className={`w-20 h-20 rounded-tl-full overflow-hidden ${className}`}
      >
        <div
          className={`absolute inset-0 transition-colors duration-300 ${
            isActive ? "bg-(--secondary)" : "bg-(--white)"
          }`}
        />

        <div
          className="absolute bottom-0 left-0 w-full bg-(--secondary) transition-all"
          style={{ height: `${progress}%` }}
        />
      </button>
    </div>
  );
}
