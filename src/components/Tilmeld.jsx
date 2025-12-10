import { doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { auth, db } from "../firebase";
import { useState, useRef } from "react";

const toggleSignup = async (postId, participants) => {
  const userId = auth.currentUser.uid;
  const postRef = doc(db, "posts", postId);

  if (participants.includes(userId)) {
    await updateDoc(postRef, {
      participants: arrayRemove(userId),
    });
  } else {
    await updateDoc(postRef, {
      participants: arrayUnion(userId),
    });
  }
};

export default function Tilmeld({
  postId,
  participants,
  onUpdate,
  className = "",
}) {
  const userId = auth.currentUser.uid;
  const [localParticipants, setLocalParticipants] = useState(
    Array.isArray(participants) ? participants : []
  );
  const [progress, setProgress] = useState(0); // 0 til 100
  const intervalRef = useRef(null);

  const isJoined = localParticipants.includes(userId);

  const handleClick = async () => {
    await toggleSignup(postId, localParticipants);

    if (localParticipants.includes(userId)) {
      setLocalParticipants(localParticipants.filter((id) => id !== userId));
    } else {
      setLocalParticipants([...localParticipants, userId]);
    }

    onUpdate();
  };

  const handleMouseDown = () => {
    if (isJoined) {
      // Hvis brugeren allerede er tilmeldt, fjern med det samme
      handleClick();
      return;
    }

    setProgress(0);

    // start progress for nye tilmeldinger
    intervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(intervalRef.current);
          handleClick(); // udfør handling når fyldt
          return 100;
        }
        return prev + 2; // justér hastighed
      });
    }, 20); // tick hver 20ms
  };

  const handleMouseUp = () => {
    clearInterval(intervalRef.current);
    setProgress(0);
  };

  return (
    <button
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleMouseDown}
      onTouchEnd={handleMouseUp}
      className={`w-20 h-20 rounded-tl-full overflow-hidden border border-gray-300 ${className}`}
    >
      {/* Background */}
      <div
        className={`absolute inset-0 transition-colors duration-300 ${
          isJoined ? "bg-(--secondary)" : "bg-(--white)"
        }`}
      />
      {/* Progress overlay */}
      <div
        className="absolute bottom-0 left-0 w-full bg-(--secondary) transition-all"
        style={{ height: `${progress}%` }}
      />
    </button>
  );
}
