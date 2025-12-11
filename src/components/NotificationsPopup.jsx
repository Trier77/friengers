import {
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  getDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import useNotifications from "./useNotifications";
import { useState } from "react";
import GroupChatPrompt from "./GroupChatPrompt";

export default function NotificationsPopup() {
  const notifications = useNotifications();
  const [showGroupChatPrompt, setShowGroupChatPrompt] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  const handleResponse = async (postId, requesterUid, approve, postTitle) => {
    console.log("🔵 handleResponse called:", {
      postId,
      requesterUid,
      approve,
      postTitle,
    });

    const postRef = doc(db, "posts", postId);

    if (approve) {
      try {
        // Hent post data for at se hvor mange deltagere der allerede er
        const postSnap = await getDoc(postRef);
        const postData = postSnap.data();
        const currentParticipants = postData.participants || [];

        console.log("📊 Current participants:", currentParticipants);
        console.log("📊 Participants length:", currentParticipants.length);
        console.log("📊 Post participants setting:", postData.participants);

        // Tilføj den nye deltager
        await updateDoc(postRef, {
          participants: arrayUnion(requesterUid),
          requests: arrayRemove(requesterUid),
        });

        console.log("✅ Deltager tilføjet til post");

        // Hvis dette er den første deltager (og opretteren selv ikke tæller)
        // Vis popup for at oprette gruppechat
        if (currentParticipants.length === 0) {
          console.log("🎉 FØRSTE DELTAGER - VIS POPUP!");
          setSelectedPost({ id: postId, title: postTitle });
          setShowGroupChatPrompt(true);

          // ✅ DEBUG LOGS:
          console.log("🔴 selectedPost sat til:", {
            id: postId,
            title: postTitle,
          });
          console.log("🔴 showGroupChatPrompt sat til:", true);
        } else {
          console.log(
            "⚠️ Ikke første deltager, tjekker om gruppechat findes..."
          );
          // Hvis gruppechat allerede eksisterer, tilføj brugeren
          const groupChatId = `group_${postId}`;
          const groupChatRef = doc(db, "chats", groupChatId);

          try {
            const groupChatSnap = await getDoc(groupChatRef);
            if (groupChatSnap.exists()) {
              await updateDoc(groupChatRef, {
                participants: arrayUnion(requesterUid),
              });
              console.log("✅ Bruger tilføjet til eksisterende gruppechat");
            } else {
              console.log(
                "⚠️ Gruppechat findes ikke (opretteren valgte måske nej)"
              );
            }
          } catch (error) {
            console.error("❌ Fejl ved tjek af gruppechat:", error);
          }
        }
      } catch (error) {
        console.error("❌ Fejl i handleResponse:", error);
      }
    } else {
      await updateDoc(postRef, {
        requests: arrayRemove(requesterUid),
      });
      console.log("❌ Anmodning afvist");
    }
  };

  const handleGroupChatClose = async (wasCreated) => {
    setShowGroupChatPrompt(false);

    // Hvis gruppechat blev oprettet, tilføj alle nuværende deltagere
    if (wasCreated && selectedPost) {
      const postRef = doc(db, "posts", selectedPost.id);
      const postSnap = await getDoc(postRef);
      const postData = postSnap.data();

      const groupChatId = `group_${selectedPost.id}`;
      const groupChatRef = doc(db, "chats", groupChatId);

      // Tilføj alle deltagere til gruppechatten
      if (postData.participants && postData.participants.length > 0) {
        await updateDoc(groupChatRef, {
          participants: arrayUnion(...postData.participants),
        });
        console.log("✅ Alle deltagere tilføjet til gruppechat");
      }
    }

    setSelectedPost(null);
  };

  // ✅ DEBUG LOGS - RENDER:
  console.log("🟣 RENDER - showGroupChatPrompt:", showGroupChatPrompt);
  console.log("🟣 RENDER - selectedPost:", selectedPost);

  // Hvis ingen notifikationer OG ingen popup, vis intet
  if (notifications.length === 0 && !showGroupChatPrompt) return null;

  return (
    <>
      {notifications.length > 0 && (
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
                <p className="text-(--white) font-bold text-sm">
                  {n.postTitle}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() =>
                    handleResponse(n.postId, n.requesterUid, false, n.postTitle)
                  }
                  className="text-sm font-bold h-6 w-10 text-(--white) rounded"
                >
                  Nej
                </button>
                <button
                  onClick={() =>
                    handleResponse(n.postId, n.requesterUid, true, n.postTitle)
                  }
                  className="text-sm font-bold h-6 w-10 bg-(--white) text-(--secondary) rounded"
                >
                  Ja
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showGroupChatPrompt && selectedPost && (
        <GroupChatPrompt
          postId={selectedPost.id}
          postTitle={selectedPost.title}
          onClose={handleGroupChatClose}
        />
      )}
    </>
  );
}
