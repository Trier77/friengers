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
import { useNavigate } from "react-router";
import GroupChatPrompt from "./GroupChatPrompt";

export default function NotificationsPopup() {
  const notifications = useNotifications();
  const [showGroupChatPrompt, setShowGroupChatPrompt] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const navigate = useNavigate();

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
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center sm:justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-(--secondary) p-4 text-center">
              <h2 className="text-(--white) font-bold text-lg">
                Nye anmodninger
              </h2>
            </div>

            {/* Notifikationer */}
            <div className="max-h-[70vh] overflow-y-auto">
              {notifications.map((n, index) => (
                <div
                  key={`${n.postId}-${n.requesterUid}`}
                  className={`p-4 ${
                    index !== notifications.length - 1
                      ? "border-b border-gray-200"
                      : ""
                  }`}
                >
                  {/* Post info */}
                  <div className="mb-3">
                    <p className="text-gray-600 text-sm mb-1">Anmodning til:</p>
                    <p className="text-(--secondary) font-bold text-base">
                      {n.postTitle}
                    </p>
                  </div>

                  {/* Bruger info med profilbillede */}
                  <div className="flex items-center gap-3 mb-4">
                    <img
                      src={n.requesterImage || "https://via.placeholder.com/48"}
                      alt={n.requesterName}
                      className="w-12 h-12 rounded-full object-cover cursor-pointer border-2 border-(--secondary)"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/AndresProfil/${n.requesterUid}`);
                      }}
                    />
                    <div className="flex-1">
                      <p
                        className="text-(--secondary) font-semibold text-base cursor-pointer hover:underline"
                        onClick={() =>
                          navigate(`/AndresProfil/${n.requesterUid}`)
                        }
                      >
                        {n.requesterName}
                      </p>
                      <p className="text-gray-500 text-sm">vil gerne hjælpe</p>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={() =>
                        handleResponse(
                          n.postId,
                          n.requesterUid,
                          false,
                          n.postTitle
                        )
                      }
                      className="flex-1 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-full hover:bg-gray-50 transition-colors"
                    >
                      Afvis
                    </button>
                    <button
                      onClick={() =>
                        handleResponse(
                          n.postId,
                          n.requesterUid,
                          true,
                          n.postTitle
                        )
                      }
                      className="flex-1 py-3 bg-(--secondary) text-(--white) font-semibold rounded-full hover:brightness-110 transition-all"
                    >
                      Godkend
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
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
