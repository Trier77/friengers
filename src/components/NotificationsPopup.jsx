import {
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  getDoc,
} from "firebase/firestore";
import { db, auth } from "../firebase";
import useNotifications from "./useNotifications";
import { useState } from "react";
import { useNavigate } from "react-router";
import GroupChatPrompt from "./GroupChatPrompt";

export default function NotificationsPopup() {
  const notifications = useNotifications();
  const [showGroupChatPrompt, setShowGroupChatPrompt] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const navigate = useNavigate();

  // Håndter request godkendelse/afvisning
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
        const postSnap = await getDoc(postRef);
        const postData = postSnap.data();
        const currentParticipants = postData.participants || [];

        console.log("📊 Current participants:", currentParticipants);

        // Tilføj den nye deltager
        await updateDoc(postRef, {
          participants: arrayUnion(requesterUid),
          requests: arrayRemove(requesterUid),
        });

        console.log("✅ Deltager tilføjet til post");

        // Hvis første deltager, vis popup
        if (currentParticipants.length === 0) {
          console.log("🎉 FØRSTE DELTAGER - VIS POPUP!");
          setSelectedPost({ id: postId, title: postTitle });
          setShowGroupChatPrompt(true);
        } else {
          // Tilføj til eksisterende gruppechat
          const groupChatId = `group_${postId}`;
          const groupChatRef = doc(db, "chats", groupChatId);

          try {
            const groupChatSnap = await getDoc(groupChatRef);
            if (groupChatSnap.exists()) {
              await updateDoc(groupChatRef, {
                participants: arrayUnion(requesterUid),
              });
              console.log("✅ Bruger tilføjet til eksisterende gruppechat");
            }
          } catch (error) {
            console.error("❌ Fejl ved tjek af gruppechat:", error);
          }
        }
      } catch (error) {
        console.error("❌ Fejl i handleResponse:", error);
      }
    } else {
      // Afvis - fjern fra requests
      await updateDoc(postRef, {
        requests: arrayRemove(requesterUid),
      });
      console.log("❌ Anmodning afvist");
    }

    // Request er nu håndteret - useNotifications vil automatisk opdatere
  };

  // Håndter invitation godkendelse/afvisning
  const handleInvitationResponse = async (notification, approve) => {
    try {
      const postRef = doc(db, "posts", notification.postId);
      const currentUserUid = auth.currentUser?.uid;

      if (approve) {
        // Godkend invitation - tilføj til participants
        await updateDoc(postRef, {
          participants: arrayUnion(currentUserUid),
          requests: arrayRemove(currentUserUid),
        });

        // Tilføj til gruppechat hvis den eksisterer
        const groupChatId = `group_${notification.postId}`;
        const groupChatRef = doc(db, "chats", groupChatId);

        try {
          const groupChatSnap = await getDoc(groupChatRef);
          if (groupChatSnap.exists()) {
            await updateDoc(groupChatRef, {
              participants: arrayUnion(currentUserUid),
            });
            console.log("✅ Tilføjet til gruppechat");
          }
        } catch (error) {
          console.log("ℹ️ Ingen gruppechat endnu");
        }

        console.log("✅ Invitation godkendt");
      } else {
        // Afvis invitation - fjern fra requests
        await updateDoc(postRef, {
          requests: arrayRemove(currentUserUid),
        });
        console.log("❌ Invitation afvist");
      }

      // VIGTIGT: Fjern notification fra brugerens notifications array
      const userRef = doc(db, "users", currentUserUid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        const updatedNotifications = (userData.notifications || []).filter(
          (n) =>
            !(n.postId === notification.postId && n.from === notification.from)
        );

        await updateDoc(userRef, {
          notifications: updatedNotifications,
        });

        console.log("✅ Notification fjernet fra Firebase");
      }
    } catch (error) {
      console.error("❌ Fejl ved håndtering af invitation:", error);
    }
  };

  const handleGroupChatClose = async (wasCreated) => {
    setShowGroupChatPrompt(false);

    if (wasCreated && selectedPost) {
      const postRef = doc(db, "posts", selectedPost.id);
      const postSnap = await getDoc(postRef);
      const postData = postSnap.data();

      const groupChatId = `group_${selectedPost.id}`;
      const groupChatRef = doc(db, "chats", groupChatId);

      if (postData.participants && postData.participants.length > 0) {
        await updateDoc(groupChatRef, {
          participants: arrayUnion(...postData.participants),
        });
        console.log("✅ Alle deltagere tilføjet til gruppechat");
      }
    }

    setSelectedPost(null);
  };

  // Hvis ingen notifikationer OG ingen popup, vis intet
  if (notifications.length === 0 && !showGroupChatPrompt) return null;

  // Separer notifikationer efter type
  const requests = notifications.filter(
    (n) => n.notificationType === "request"
  );
  const invitations = notifications.filter(
    (n) => n.notificationType === "invitation"
  );

  return (
    <>
      {notifications.length > 0 && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center sm:justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-(--secondary) p-4 text-center">
              <h2 className="text-(--white) font-bold text-lg">
                Notifikationer
              </h2>
            </div>

            {/* Notifikationer */}
            <div className="max-h-[70vh] overflow-y-auto">
              {/* REQUESTS */}
              {requests.map((n, index) => (
                <div
                  key={`request-${n.postId}-${n.requesterUid}`}
                  className={`p-4 ${
                    index !== requests.length - 1 || invitations.length > 0
                      ? "border-b border-gray-200"
                      : ""
                  }`}
                >
                  <div className="mb-3">
                    <p className="text-gray-600 text-sm mb-1">Anmodning til:</p>
                    <p className="text-(--secondary) font-bold text-base">
                      {n.postTitle}
                    </p>
                  </div>

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

              {/* INVITATIONS */}
              {invitations.map((n, index) => (
                <div
                  key={`invitation-${n.postId}-${n.timestamp}`}
                  className={`p-4 ${
                    index !== invitations.length - 1
                      ? "border-b border-gray-200"
                      : ""
                  }`}
                >
                  <div className="mb-3">
                    <p className="text-gray-600 text-sm mb-1">
                      Invitation til:
                    </p>
                    <p className="text-(--secondary) font-bold text-base">
                      {n.postTitle}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 mb-4">
                    <img
                      src={n.fromImage || "https://via.placeholder.com/48"}
                      alt={n.fromName}
                      className="w-12 h-12 rounded-full object-cover cursor-pointer border-2 border-(--secondary)"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/AndresProfil/${n.from}`);
                      }}
                    />
                    <div className="flex-1">
                      <p
                        className="text-(--secondary) font-semibold text-base cursor-pointer hover:underline"
                        onClick={() => navigate(`/AndresProfil/${n.from}`)}
                      >
                        {n.fromName}
                      </p>
                      <p className="text-gray-500 text-sm">har inviteret dig</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleInvitationResponse(n, false)}
                      className="flex-1 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-full hover:bg-gray-50 transition-colors"
                    >
                      Afvis
                    </button>
                    <button
                      onClick={() => handleInvitationResponse(n, true)}
                      className="flex-1 py-3 bg-(--secondary) text-(--white) font-semibold rounded-full hover:brightness-110 transition-all"
                    >
                      Acceptér
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
