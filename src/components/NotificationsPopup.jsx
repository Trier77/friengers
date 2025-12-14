import {
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  getDoc,
} from "firebase/firestore";
import { db, auth } from "../firebase";
import { useState } from "react";
import { useNavigate } from "react-router";
import GroupChatPrompt from "./GroupChatPrompt";

export default function NotificationsPopup({
  notifications,
  open,
  closePopup,
}) {
  const [showGroupChatPrompt, setShowGroupChatPrompt] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const navigate = useNavigate();
  const currentUserUid = auth.currentUser?.uid;

  // Håndter request godkendelse/afvisning
  const handleResponse = async (notification, approve) => {
    const postId = notification.postId;
    const requesterUid = notification.requesterUid;
    const postTitle = notification.postTitle;

    const postRef = doc(db, "posts", postId);
    const userRef = doc(db, "users", currentUserUid);

    try {
      // Opdater notifikationens status i brugerens dokument
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data();
      const updatedNotifications = (userData.notifications || []).map((n) => {
        if (n.postId === postId && n.requesterUid === requesterUid) {
          return {
            ...n,
            status: approve ? "accepted" : "rejected",
            handledAt: Date.now(),
          };
        }
        return n;
      });

      await updateDoc(userRef, {
        notifications: updatedNotifications,
      });

      if (approve) {
        const postSnap = await getDoc(postRef);
        const postData = postSnap.data();
        const currentParticipants = postData.participants || [];

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
      } else {
        // Afvis - fjern fra requests
        await updateDoc(postRef, {
          requests: arrayRemove(requesterUid),
        });
        console.log("❌ Anmodning afvist");
      }
    } catch (error) {
      console.error("❌ Fejl i handleResponse:", error);
    }
  };

  const sendGroupChatNotifications = async (
    postId,
    postTitle,
    participantUids
  ) => {
    try {
      console.log("📬 Sender gruppechat-notifikationer til:", participantUids);

      for (const uid of participantUids) {
        const userRef = doc(db, "users", uid);

        await updateDoc(userRef, {
          notifications: arrayUnion({
            notificationType: "groupchat_created",
            postId: postId,
            postTitle: postTitle,
            status: "pending",
            timestamp: Date.now(),
            createdAt: Date.now(),
          }),
        });
      }

      console.log("✅ Gruppechat-notifikationer sendt!");
    } catch (error) {
      console.error("❌ Fejl ved sending af gruppechat-notifikationer:", error);
    }
  };

  // Håndter invitation godkendelse/afvisning
  const handleInvitationResponse = async (notification, approve) => {
    try {
      const postRef = doc(db, "posts", notification.postId);
      const userRef = doc(db, "users", currentUserUid);

      // Opdater notifikationens status
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data();
      const updatedNotifications = (userData.notifications || []).map((n) => {
        if (
          n.postId === notification.postId &&
          n.from === notification.from &&
          n.notificationType === "invitation"
        ) {
          return {
            ...n,
            status: approve ? "accepted" : "rejected",
            handledAt: Date.now(),
          };
        }
        return n;
      });

      await updateDoc(userRef, {
        notifications: updatedNotifications,
      });

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

        // 🎉 NYT: Send notifikationer til alle deltagere
        await sendGroupChatNotifications(
          selectedPost.id,
          selectedPost.title,
          [...postData.participants, postData.uid] // Inkluder også opgave-ejeren
        );
      }
    }

    setSelectedPost(null);
  };

  const handleGroupChatNotification = async (notification) => {
    try {
      const userRef = doc(db, "users", currentUserUid);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data();

      // Opdater notifikationens status
      const updatedNotifications = (userData.notifications || []).map((n) => {
        if (
          n.postId === notification.postId &&
          n.notificationType === "groupchat_created"
        ) {
          return {
            ...n,
            status: "opened",
            openedAt: Date.now(),
          };
        }
        return n;
      });

      await updateDoc(userRef, {
        notifications: updatedNotifications,
      });

      // Send brugeren til gruppechatten
      const groupChatId = `group_${notification.postId}`;
      navigate(`/GroupChat/${groupChatId}`);
      closePopup();
    } catch (error) {
      console.error("❌ Fejl ved åbning af gruppechat:", error);
    }
  };

  return (
    <>
      {/* Background overlay */}
      <div
        className={`
          fixed inset-0 bg-black/50 z-500
          transition-opacity duration-300
          ${
            open
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }
        `}
        onClick={closePopup}
      />

      {/* Sliding popup */}
      <div
        className={`
          fixed inset-x-0 bottom-0 w-screen
          bg-white z-500
          transition-transform duration-300
          rounded-t-3xl sm:rounded-3xl
          max-h-[85vh] overflow-hidden
          ${open ? "translate-y-0" : "translate-y-full"}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-(--secondary) p-4 flex justify-between items-center">
          <h2 className="text-(--white) font-bold text-lg">Notifikationer</h2>
          <button
            onClick={closePopup}
            className="text-(--white) text-2xl font-bold hover:opacity-80"
          >
            ✕
          </button>
        </div>

        {/* Notifikationer */}
        <div className="max-h-[70vh] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Ingen notifikationer endnu
            </div>
          ) : (
            <>
              {notifications.map((n, index) => {
                const isPending = !n.status || n.status === "pending";
                const isAccepted = n.status === "accepted";
                const isRejected = n.status === "rejected";

                // GRUPPECHAT NOTIFIKATION
                if (n.notificationType === "groupchat_created") {
                  return (
                    <div
                      key={`groupchat-${n.postId}-${n.timestamp}`}
                      className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                        !isPending ? "opacity-50 bg-gray-50" : ""
                      } ${
                        index !== notifications.length - 1
                          ? "border-b border-gray-200"
                          : ""
                      }`}
                      onClick={() => {
                        if (isPending) {
                          handleGroupChatNotification(n);
                        }
                      }}
                    >
                      <div className="mb-3">
                        <p className="text-gray-600 text-sm mb-1">
                          Gruppechat oprettet:
                        </p>
                        <p className="text-(--secondary) font-bold text-base">
                          {n.postTitle}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
                          <svg
                            className="w-6 h-6 text-white"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-700 font-semibold">
                            Gruppechat er klar!
                          </p>
                          <p className="text-gray-500 text-sm">
                            Klik for at åbne chatten
                          </p>
                        </div>
                      </div>

                      {!isPending && (
                        <p className="text-center py-2 text-gray-500 text-sm italic">
                          Åbnet
                        </p>
                      )}
                    </div>
                  );
                }

                // REQUEST NOTIFIKATION
                if (n.notificationType === "request") {
                  return (
                    <div
                      key={`request-${n.postId}-${n.requesterUid}-${n.createdAt}`}
                      className={`p-4 ${
                        !isPending ? "opacity-50 bg-gray-50" : ""
                      } ${
                        index !== notifications.length - 1
                          ? "border-b border-gray-200"
                          : ""
                      }`}
                    >
                      <div className="mb-3">
                        <p className="text-gray-600 text-sm mb-1">
                          Anmodning til:
                        </p>
                        <p className="text-(--secondary) font-bold text-base">
                          {n.postTitle}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 mb-4">
                        <img
                          src={
                            n.requesterImage || "https://via.placeholder.com/48"
                          }
                          alt={n.requesterName}
                          className="w-12 h-12 rounded-full border-2 border-(--secondary) cursor-pointer object-cover"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/AndresProfil/${n.requesterUid}`);
                          }}
                        />
                        <div className="flex-1">
                          <p
                            className="text-(--secondary) font-semibold cursor-pointer hover:underline"
                            onClick={() =>
                              navigate(`/AndresProfil/${n.requesterUid}`)
                            }
                          >
                            {n.requesterName}
                          </p>
                          <p className="text-gray-500 text-sm">
                            vil gerne hjælpe
                          </p>
                        </div>
                      </div>

                      {isPending ? (
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleResponse(n, false)}
                            className="flex-1 py-3 border-2 border-gray-300 rounded-full hover:bg-gray-50"
                          >
                            Afvis
                          </button>
                          <button
                            onClick={() => handleResponse(n, true)}
                            className="flex-1 py-3 bg-(--secondary) text-white rounded-full hover:brightness-110"
                          >
                            Godkend
                          </button>
                        </div>
                      ) : (
                        <p
                          className={`text-center py-3 font-semibold ${
                            isAccepted ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {isAccepted
                            ? "Du accepterede denne anmodning"
                            : "Du afviste denne anmodning"}
                        </p>
                      )}
                    </div>
                  );
                }

                // INVITATION NOTIFIKATION
                if (n.notificationType === "invitation") {
                  return (
                    <div
                      key={`invitation-${n.postId}-${n.from}-${n.timestamp}`}
                      className={`p-4 ${
                        !isPending ? "opacity-50 bg-gray-50" : ""
                      } ${
                        index !== notifications.length - 1
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
                          <p className="text-gray-500 text-sm">
                            har inviteret dig
                          </p>
                        </div>
                      </div>

                      {isPending ? (
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
                      ) : (
                        <p
                          className={`text-center py-3 font-semibold ${
                            isAccepted ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {isAccepted
                            ? "Du accepterede denne invitation"
                            : "Du afviste denne invitation"}
                        </p>
                      )}
                    </div>
                  );
                }

                return null;
              })}
            </>
          )}
        </div>
      </div>

      {/* Popup til gruppechat */}
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
