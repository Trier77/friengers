import {
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  getDoc,
} from "firebase/firestore";
import { db, auth } from "../firebase";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import GroupChatPrompt from "./GroupChatPrompt";
import { useTranslation } from "react-i18next";

export default function NotificationsPopup({
  notifications,
  open,
  closePopup,
}) {
  const { t } = useTranslation();
  const [showGroupChatPrompt, setShowGroupChatPrompt] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const navigate = useNavigate();
  const currentUserUid = auth.currentUser?.uid;

  // 🆕 Auto-markér info-notifikationer som læst når popup åbnes
  useEffect(() => {
    if (!open || !currentUserUid) return;

    const autoMarkInfoNotifications = async () => {
      try {
        const userRef = doc(db, "users", currentUserUid);
        const userSnap = await getDoc(userRef);
        const userData = userSnap.data();

        const updatedNotifications = (userData.notifications || []).map((n) => {
          // 🆕 Auto-markér disse typer som læst
          const autoReadTypes = [
            "task_completed",
            "participant_left",
            "groupchat_created", // ← Tilføjet
            "post_deleted", // ← Tilføjet
          ];

          if (
            autoReadTypes.includes(n.notificationType) &&
            (!n.status || n.status === "pending")
          ) {
            return {
              ...n,
              status: "seen",
              seenAt: Date.now(),
            };
          }
          return n;
        });

        // Kun opdater hvis der faktisk er ændringer
        const hasChanges = updatedNotifications.some(
          (n, i) =>
            n.status !== (userData.notifications?.[i]?.status || "pending")
        );

        if (hasChanges) {
          await updateDoc(userRef, {
            notifications: updatedNotifications,
          });
          console.log("✅ Info-notifikationer auto-markeret som læst");
        }
      } catch (error) {
        console.error("Fejl ved auto-markering:", error);
      }
    };

    // Auto-markér efter 500ms når popup åbnes
    const timer = setTimeout(autoMarkInfoNotifications, 500);
    return () => clearTimeout(timer);
  }, [open, currentUserUid]);

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
        const maxParticipants = postData.maxParticipants || 1;

        // Tilføj den nye deltager
        await updateDoc(postRef, {
          participants: arrayUnion(requesterUid),
          requests: arrayRemove(requesterUid),
        });

        console.log("✅ Deltager tilføjet til post");

        // 🆕 SEND GODKENDELSE-NOTIFIKATION til anmoderen
        const requesterRef = doc(db, "users", requesterUid);
        await updateDoc(requesterRef, {
          notifications: arrayUnion({
            notificationType: "request_accepted",
            postId: postId,
            postTitle: postTitle,
            acceptedBy: currentUserUid,
            acceptedByName: userData.kaldenavn || userData.fuldenavn,
            status: "pending",
            timestamp: Date.now(),
            createdAt: Date.now(),
          }),
        });

        // 🆕 KUN opret gruppechat hvis maxParticipants > 1 OG der er deltagere
        if (maxParticipants > 1 && currentParticipants.length === 0) {
          console.log("🎉 FØRSTE DELTAGER + maxParticipants > 1 - VIS POPUP!");
          setSelectedPost({ id: postId, title: postTitle });
          setShowGroupChatPrompt(true);
        } else if (maxParticipants > 1 && currentParticipants.length > 0) {
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
        } else {
          console.log("ℹ️ maxParticipants = 1, ingen gruppechat oprettes");
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

      // 🆕 Tjek om opgaven stadig eksisterer
      const postSnap = await getDoc(postRef);
      if (!postSnap.exists()) {
        alert(t("notifications.invitation.taskDeleted"));

        // Markér notifikation som invalid
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
              status: "invalid",
              handledAt: Date.now(),
            };
          }
          return n;
        });

        await updateDoc(userRef, {
          notifications: updatedNotifications,
        });
        return;
      }

      const postData = postSnap.data();
      const maxParticipants = postData.maxParticipants || 1;

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

        // 🆕 SEND NOTIFIKATION til opgave-ejer om at invitation blev accepteret (kun hvis maxParticipants > 1)
        if (maxParticipants > 1) {
          const currentUserSnap = await getDoc(
            doc(db, "users", currentUserUid)
          );
          const currentUserData = currentUserSnap.data();

          const ownerRef = doc(db, "users", notification.from);
          await updateDoc(ownerRef, {
            notifications: arrayUnion({
              notificationType: "invitation_accepted",
              postId: notification.postId,
              postTitle: notification.postTitle,
              acceptedBy: currentUserUid,
              acceptedByName:
                currentUserData.kaldenavn || currentUserData.fuldenavn,
              acceptedByImage: currentUserData.profileImage || null,
              maxParticipants: maxParticipants,
              status: "pending",
              timestamp: Date.now(),
              createdAt: Date.now(),
            }),
          });
          console.log("✅ Invitation-accepted notifikation sendt til ejer");
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

  // 🆕 Håndter invitation_accepted (ejer får mulighed for at oprette gruppechat)
  const handleInvitationAcceptedResponse = async (
    notification,
    createGroupChat
  ) => {
    try {
      const userRef = doc(db, "users", currentUserUid);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data();

      // Opdater notifikationens status
      const updatedNotifications = (userData.notifications || []).map((n) => {
        if (
          n.postId === notification.postId &&
          n.acceptedBy === notification.acceptedBy &&
          n.notificationType === "invitation_accepted"
        ) {
          return {
            ...n,
            status: createGroupChat ? "groupchat_created" : "declined",
            handledAt: Date.now(),
          };
        }
        return n;
      });

      await updateDoc(userRef, {
        notifications: updatedNotifications,
      });

      if (createGroupChat) {
        // Opret gruppechat
        setSelectedPost({
          id: notification.postId,
          title: notification.postTitle,
        });
        setShowGroupChatPrompt(true);
      }
    } catch (error) {
      console.error("❌ Fejl ved håndtering af invitation_accepted:", error);
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

        // Send notifikationer til alle deltagere
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
      // Send brugeren til gruppechatten direkte (auto-markering håndteres af useEffect)
      const groupChatId = `group_${notification.postId}`;
      navigate(`/GroupChat/${groupChatId}`);
      closePopup();
    } catch (error) {
      console.error("❌ Fejl ved åbning af gruppechat:", error);
    }
  };

  // 🆕 Håndter "Se opgave" klik med validering
  const handleViewTask = async (notification) => {
    try {
      const userRef = doc(db, "users", currentUserUid);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data();

      // Tjek om opgaven stadig eksisterer
      const postRef = doc(db, "posts", notification.postId);
      const postSnap = await getDoc(postRef);

      if (!postSnap.exists() || postSnap.data().active === false) {
        // Opgave findes ikke eller er løst
        alert(t("notifications.requestAccepted.taskNoLongerExists"));

        // Markér som invalid
        const updatedNotifications = (userData.notifications || []).map((n) => {
          if (
            n.postId === notification.postId &&
            n.notificationType === "request_accepted"
          ) {
            return {
              ...n,
              status: "invalid",
              seenAt: Date.now(),
            };
          }
          return n;
        });

        await updateDoc(userRef, {
          notifications: updatedNotifications,
        });
        return;
      }

      // Opgave eksisterer - markér som set og naviger
      const updatedNotifications = (userData.notifications || []).map((n) => {
        if (
          n.postId === notification.postId &&
          n.notificationType === "request_accepted"
        ) {
          return {
            ...n,
            status: "seen",
            seenAt: Date.now(),
          };
        }
        return n;
      });

      await updateDoc(userRef, {
        notifications: updatedNotifications,
      });

      // Naviger til opgave-ejerens profil
      closePopup();
      navigate(`/AndresProfil/${notification.acceptedBy}`);
    } catch (error) {
      console.error("Fejl ved visning af opgave:", error);
    }
  };

  return (
    <>
      {/* Background overlay */}
      <div
        className={`
          fixed inset-0 bg-(--white)/70 z-500
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
          <h2 className="text-(--white) font-bold text-lg">
            {t(`notifications.title`)}
          </h2>
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
              {t("no-notifs")}
            </div>
          ) : (
            <>
              {[...notifications]
                .sort((a, b) => {
                  const timeA = a.createdAt || a.timestamp || 0;
                  const timeB = b.createdAt || b.timestamp || 0;
                  return timeB - timeA;
                })
                .map((n, index) => {
                  const isPending = !n.status || n.status === "pending";
                  const isAccepted = n.status === "accepted";
                  const isRejected = n.status === "rejected";
                  const isInvalid = n.status === "invalid";

                  // 🆕 OPGAVE LØST NOTIFIKATION (AUTO-READ efter 500ms NÅR POPUP ÅBNES)
                  if (n.notificationType === "task_completed") {
                    return (
                      <div
                        key={`task-completed-${n.postId}-${n.timestamp}`}
                        className={`p-4 ${
                          !isPending ? "opacity-50 bg-gray-50" : ""
                        } ${
                          index !== notifications.length - 1
                            ? "border-b border-gray-200"
                            : ""
                        }`}
                      >
                        <div className="mb-3">
                          <p className="text-green-600 text-sm mb-1 font-semibold">
                            {t(`notifications.taskCompleted.title`)}
                          </p>
                          <p className="text-(--secondary) font-bold text-base">
                            {n.postTitle}
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                            <svg
                              className="w-6 h-6 text-white"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <p className="text-gray-700 font-semibold">
                              {t(`notifications.taskCompleted.message`)}
                            </p>
                            <p className="text-gray-500 text-sm">
                              {t(`notifications.taskCompleted.thanks`)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  // 🆕 DELTAGER FORLOD OPGAVE NOTIFIKATION (AUTO-READ efter 500ms NÅR POPUP ÅBNES)
                  if (n.notificationType === "participant_left") {
                    return (
                      <div
                        key={`participant-left-${n.postId}-${n.leftBy}-${n.timestamp}`}
                        className={`p-4 ${
                          !isPending ? "opacity-50 bg-gray-50" : ""
                        } ${
                          index !== notifications.length - 1
                            ? "border-b border-gray-200"
                            : ""
                        }`}
                      >
                        <div className="mb-3">
                          <p className="text-orange-600 text-sm mb-1 font-semibold">
                            {t(`notifications.participantLeft.title`)}
                          </p>
                          <p className="text-(--secondary) font-bold text-base">
                            {n.postTitle}
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <img
                            src={
                              n.leftByImage || "https://via.placeholder.com/48"
                            }
                            alt={n.leftByName}
                            className="w-12 h-12 rounded-full object-cover border-2 border-orange-500 cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/AndresProfil/${n.leftBy}`);
                            }}
                          />
                          <div className="flex-1">
                            <p
                              className="text-(--secondary) font-semibold cursor-pointer hover:underline"
                              onClick={() =>
                                navigate(`/AndresProfil/${n.leftBy}`)
                              }
                            >
                              {n.leftByName}
                            </p>
                            <p className="text-gray-500 text-sm">
                              {t(`notifications.participantLeft.message`)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  // 🆕 ANMODNING ACCEPTERET NOTIFIKATION (MED VALIDERING)
                  if (n.notificationType === "request_accepted") {
                    return (
                      <div
                        key={`request-accepted-${n.postId}-${n.timestamp}`}
                        className={`p-4 ${
                          !isPending || isInvalid ? "opacity-50 bg-gray-50" : ""
                        } ${
                          index !== notifications.length - 1
                            ? "border-b border-gray-200"
                            : ""
                        }`}
                      >
                        <div className="mb-3">
                          <p className="text-green-600 text-sm mb-1 font-semibold">
                            {t(`notifications.requestAccepted.title`)}
                          </p>
                          <p className="text-(--secondary) font-bold text-base">
                            {n.postTitle}
                          </p>
                        </div>

                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                            <svg
                              className="w-6 h-6 text-white"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <p className="text-gray-700 font-semibold">
                              {n.acceptedByName}{" "}
                              {t(`notifications.requestAccepted.message`)}
                            </p>
                            <p className="text-gray-500 text-sm">
                              {t(`notifications.requestAccepted.subtitle`)}
                            </p>
                          </div>
                        </div>

                        {isPending && !isInvalid && (
                          <button
                            onClick={() => handleViewTask(n)}
                            className="w-full py-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
                          >
                            {t(`notifications.requestAccepted.ok`)}
                          </button>
                        )}

                        {isInvalid && (
                          <p className="text-center py-2 text-gray-500 text-sm italic">
                            {t(
                              `notifications.requestAccepted.taskNoLongerExists`
                            )}
                          </p>
                        )}

                        {!isPending && !isInvalid && (
                          <p className="text-center py-2 text-gray-500 text-sm italic">
                            {t(`notifications.requestAccepted.seen`)}
                          </p>
                        )}
                      </div>
                    );
                  }

                  // 🆕 INVITATION ACCEPTERET NOTIFIKATION (Ejer får mulighed for gruppechat)
                  if (n.notificationType === "invitation_accepted") {
                    return (
                      <div
                        key={`invitation-accepted-${n.postId}-${n.acceptedBy}-${n.timestamp}`}
                        className={`p-4 ${
                          !isPending ? "opacity-50 bg-gray-50" : ""
                        } ${
                          index !== notifications.length - 1
                            ? "border-b border-gray-200"
                            : ""
                        }`}
                      >
                        <div className="mb-3">
                          <p className="text-blue-600 text-sm mb-1 font-semibold">
                            {t(`notifications.invitationAccepted.title`)}
                          </p>
                          <p className="text-(--secondary) font-bold text-base">
                            {n.postTitle}
                          </p>
                        </div>

                        <div className="flex items-center gap-3 mb-3">
                          <img
                            src={
                              n.acceptedByImage ||
                              "https://via.placeholder.com/48"
                            }
                            alt={n.acceptedByName}
                            className="w-12 h-12 rounded-full object-cover border-2 border-blue-500 cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/AndresProfil/${n.acceptedBy}`);
                            }}
                          />
                          <div className="flex-1">
                            <p
                              className="text-(--secondary) font-semibold cursor-pointer hover:underline"
                              onClick={() =>
                                navigate(`/AndresProfil/${n.acceptedBy}`)
                              }
                            >
                              {n.acceptedByName}
                            </p>
                            <p className="text-gray-500 text-sm">
                              {t(`notifications.invitationAccepted.message`)}
                            </p>
                          </div>
                        </div>

                        {isPending && (
                          <div className="flex gap-3">
                            <button
                              onClick={() =>
                                handleInvitationAcceptedResponse(n, false)
                              }
                              className="flex-1 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-full hover:bg-gray-50 transition-colors"
                            >
                              {t(`notifications.invitationAccepted.noThanks`)}
                            </button>
                            <button
                              onClick={() =>
                                handleInvitationAcceptedResponse(n, true)
                              }
                              className="flex-1 py-3 bg-blue-500 text-white font-semibold rounded-full hover:bg-blue-600 transition-colors"
                            >
                              {t(
                                `notifications.invitationAccepted.createGroupChat`
                              )}
                            </button>
                          </div>
                        )}

                        {!isPending && (
                          <p className="text-center py-2 text-gray-500 text-sm italic">
                            {n.status === "groupchat_created"
                              ? t(
                                  `notifications.invitationAccepted.groupChatCreated`
                                )
                              : t(`notifications.invitationAccepted.declined`)}
                          </p>
                        )}
                      </div>
                    );
                  }

                  // GRUPPECHAT NOTIFIKATION (AUTO-READ efter 500ms NÅR POPUP ÅBNES, KLIKBAR)
                  if (n.notificationType === "groupchat_created") {
                    return (
                      <div
                        key={`groupchat-${n.postId}-${n.timestamp}`}
                        className={`p-4 cursor-pointer hover:brightness-95 transition-all ${
                          !isPending ? "opacity-50 bg-gray-50" : ""
                        } ${
                          index !== notifications.length - 1
                            ? "border-b border-gray-200"
                            : ""
                        }`}
                        onClick={() => handleGroupChatNotification(n)}
                      >
                        <div className="mb-3">
                          <p className="text-gray-600 text-sm mb-1">
                            {t(`notifications.group.created`)}
                          </p>
                          <p className="text-(--secondary) font-bold text-base">
                            {n.postTitle}
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
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
                              {t(`notifications.group.ready`)}
                            </p>
                            <p className="text-gray-500 text-sm">
                              {t(`notifications.group.click`)}
                            </p>
                          </div>
                        </div>
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
                            {t(`notifications.request.title`)}
                          </p>
                          <p className="text-(--secondary) font-bold text-base">
                            {n.postTitle}
                          </p>
                        </div>

                        <div className="flex items-center gap-3 mb-4">
                          <img
                            src={
                              n.requesterImage ||
                              "https://via.placeholder.com/48"
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
                              {t(`notifications.request.wantsHelp`)}
                            </p>
                          </div>
                        </div>

                        {isPending ? (
                          <div className="flex gap-3">
                            <button
                              onClick={() => handleResponse(n, false)}
                              className="flex-1 py-3 border-2 border-gray-300 rounded-full hover:bg-gray-50"
                            >
                              {t(`denied`)}
                            </button>
                            <button
                              onClick={() => handleResponse(n, true)}
                              className="flex-1 py-3 bg-(--secondary) text-white rounded-full hover:brightness-110"
                            >
                              {t(`accept`)}
                            </button>
                          </div>
                        ) : (
                          <p
                            className={`text-center py-3 font-semibold ${
                              isAccepted ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {isAccepted
                              ? t(`notifications.request.accepted`)
                              : t(`notifications.request.rejected`)}
                          </p>
                        )}
                      </div>
                    );
                  }

                  // INVITATION NOTIFIKATION (MED VALIDERING)
                  if (n.notificationType === "invitation") {
                    return (
                      <div
                        key={`invitation-${n.postId}-${n.from}-${n.timestamp}`}
                        className={`p-4 ${
                          !isPending || isInvalid ? "opacity-50 bg-gray-50" : ""
                        } ${
                          index !== notifications.length - 1
                            ? "border-b border-gray-200"
                            : ""
                        }`}
                      >
                        <div className="mb-3">
                          <p className="text-gray-600 text-sm mb-1">
                            {t(`notifications.invitation.title`)}
                          </p>
                          <p className="text-(--secondary) font-bold text-base">
                            {n.postTitle}
                          </p>
                        </div>

                        <div className="flex items-center gap-3 mb-4">
                          <img
                            src={
                              n.fromImage || "https://via.placeholder.com/48"
                            }
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
                              onClick={() =>
                                navigate(`/AndresProfil/${n.from}`)
                              }
                            >
                              {n.fromName}
                            </p>
                            <p className="text-gray-500 text-sm">
                              {t(`notifications.invitation.from`)}
                            </p>
                          </div>
                        </div>

                        {isPending && !isInvalid ? (
                          <div className="flex gap-3">
                            <button
                              onClick={() => handleInvitationResponse(n, false)}
                              className="flex-1 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-full hover:bg-gray-50 transition-colors"
                            >
                              {t(`notifications.invitation.rejected`)}
                            </button>
                            <button
                              onClick={() => handleInvitationResponse(n, true)}
                              className="flex-1 py-3 bg-(--secondary) text-(--white) font-semibold rounded-full hover:brightness-110 transition-all"
                            >
                              {t(`notifications.invitation.accepted`)}
                            </button>
                          </div>
                        ) : isInvalid ? (
                          <p className="text-center py-3 text-gray-500 text-sm italic">
                            {t(`notifications.invitation.taskDeleted`)}
                          </p>
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

                  // POST SLETTET NOTIFIKATION (AUTO-READ efter 500ms NÅR POPUP ÅBNES)
                  if (n.notificationType === "post_deleted") {
                    return (
                      <div
                        key={`post-deleted-${n.postId}-${n.timestamp}`}
                        className={`p-4 ${
                          !isPending ? "opacity-50 bg-gray-50" : ""
                        } ${
                          index !== notifications.length - 1
                            ? "border-b border-gray-200"
                            : ""
                        }`}
                      >
                        <div className="mb-3">
                          <p className="text-red-600 text-sm mb-1 font-semibold">
                            {t(`notifications.deleted.title`)}
                          </p>
                          <p className="text-(--secondary) font-bold text-base">
                            {n.postTitle}
                          </p>
                        </div>

                        <div className="flex items-center gap-3 mb-3">
                          <img
                            src={
                              n.deletedByImage ||
                              "https://via.placeholder.com/48"
                            }
                            alt={n.deletedByName}
                            className="w-12 h-12 rounded-full object-cover border-2 border-red-500"
                          />
                          <div className="flex-1">
                            <p className="text-gray-700 font-semibold">
                              {n.deletedByName}
                            </p>
                            <p className="text-gray-500 text-sm">
                              {t(`notifications.deleted.by`)}
                            </p>
                          </div>
                        </div>

                        {n.hadGroupChat && (
                          <div className="bg-red-50 border border-red-200 rounded-lg p-2">
                            <p className="text-red-700 text-sm">
                              {t(`notifications.deleted.groupCeased`)}
                            </p>
                          </div>
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
