import CalenderIcon from "../../public/icons/CalenderIcon";
import MapPinIcon from "../../public/icons/MapPinIcon";
import GroupsIcon from "../../public/icons/GroupsIcon";
import Tilmeld from "../components/Tilmeld";
import { motion, AnimatePresence } from "framer-motion";
import FingerPrintIcon from "../../public/icons/FingerPrintIcon";
import { auth, db } from "../firebase";
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { useTranslation } from "react-i18next";

export default function PostCard({
  post,
  expandedPostId,
  toggleExpand,
  selectedTags,
  handleDropdownChange,
  setPreviewImage,
  navigate,
  fetchPosts,
  showAuthor = true,
  showTimestamp = false,
  isInvitation = false,
  invitationFrom = null,
  onInvitationHandled = () => {},
}) {
  const { t } = useTranslation();
  const isFocused = expandedPostId === post.id;

  function timeAgo(date) {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

    const intervals = [
      { label: [t(`time.year_one`), t(`time.year_other`)], secs: 31536000 },
      { label: [t(`time.month_one`), t(`time.month_other`)], secs: 2592000 },
      { label: [t(`time.week_one`), t(`time.week_other`)], secs: 604800 },
      { label: [t(`time.day_one`), t(`time.day_other`)], secs: 86400 },
      { label: [t(`time.hour_one`), t(`time.hour_other`)], secs: 3600 },
      { label: [t(`time.minute_one`), t(`time.minutter_other`)], secs: 60 },
      { label: [t(`time.year_one`), t(`time.sekunder_other`)], secs: 1 },
    ];

    for (const i of intervals) {
      const count = Math.floor(seconds / i.secs);
      if (count >= 1) {
        const label = count === 1 ? i.label[0] : i.label[1];
        return `for ${count} ${label} siden`;
      }
    }

    return "lige nu";
  }

  const handleInvitationResponse = async (approve) => {
    try {
      const currentUserId = auth.currentUser?.uid;
      const postRef = doc(db, "posts", post.id);
      const userRef = doc(db, "users", currentUserId);

      const userSnap = await getDoc(userRef);
      const userData = userSnap.data();
      const updatedNotifications = (userData.notifications || []).map((n) => {
        if (
          n.postId === post.id &&
          n.from === invitationFrom &&
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
        const postSnap = await getDoc(postRef);
        const postData = postSnap.data();
        const currentParticipants = postData.participants || [];

        await updateDoc(postRef, {
          participants: arrayUnion(currentUserId),
          requests: arrayRemove(currentUserId),
        });

        const groupChatId = `group_${post.id}`;
        const groupChatRef = doc(db, "chats", groupChatId);
        const groupChatSnap = await getDoc(groupChatRef);

        if (groupChatSnap.exists()) {
          await updateDoc(groupChatRef, {
            participants: arrayUnion(currentUserId),
          });
        } else {
          const allParticipants = [
            ...currentParticipants,
            currentUserId,
            postData.uid,
          ];
          const uniqueParticipants = [...new Set(allParticipants)];

          await setDoc(groupChatRef, {
            postId: post.id,
            chatName: postData.title,
            participants: uniqueParticipants,
            createdAt: serverTimestamp(),
            createdBy: postData.uid,
            isGroupChat: true,
            lastMessage: "Gruppechat oprettet",
            lastMessageTime: serverTimestamp(),
            lastMessageSenderId: currentUserId,
          });

          for (const uid of uniqueParticipants) {
            const participantRef = doc(db, "users", uid);

            await updateDoc(participantRef, {
              notifications: arrayUnion({
                notificationType: "groupchat_created",
                postId: post.id,
                postTitle: postData.title,
                status: "pending",
                timestamp: Date.now(),
                createdAt: Date.now(),
              }),
            });
          }
        }
      } else {
        await updateDoc(postRef, {
          requests: arrayRemove(currentUserId),
        });
      }

      onInvitationHandled();
    } catch (error) {
      console.error("Fejl ved håndtering af invitation:", error);
    }
  };

  return (
    <motion.div
      key={post.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{
          opacity:
            expandedPostId === null ? 1 : expandedPostId === post.id ? 1 : 0.5,
          scale:
            expandedPostId === null ? 1 : expandedPostId === post.id ? 1 : 0.95,
        }}
        transition={{ duration: 0.3 }}
        onClick={() => {
          toggleExpand(post.id);
        }}
        className={`mb-4 p-4 bg-(--primary) rounded-2xl gap-2 flex flex-col relative overflow-hidden`}
      >
        <motion.div
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
          style={{
            background:
              "linear-gradient(to left, rgba(59,130,246,0.2), rgba(59,130,246,0))",
            transformOrigin: "right",
            zIndex: 0, // lav z-index
          }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: expandedPostId === post.id ? 1 : 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />

        <div className="flex items-center justify-between z-10">
          {expandedPostId !== post.id && (
            <h2 className="justify-start text-(--secondary) text-xl overskrift flex-none w-40 truncate">
              {post.title}
            </h2>
          )}
          {expandedPostId === post.id && (
            <h2 className="justify-start text-(--secondary) text-2xl mb-1 overskrift flex-none">
              {post.title}
            </h2>
          )}
          {expandedPostId !== post.id && (
            <motion.div
              className="bg-(--white) rounded-full px-2 flex gap-4 font-bold text-sm text-(--secondary)"
              animate={{
                opacity: 1,
                scale: 1,
              }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center gap-2 flex-none w-16">
                <MapPinIcon color="--secondary" size={12} />
                <p className="truncate">{post.location}</p>
              </div>

              <div className="flex items-center gap-2">
                <CalenderIcon color="--secondary" size={10} />
                <p>
                  {post.time?.toDate().toLocaleDateString(undefined, {
                    day: "2-digit",
                    month: "2-digit",
                  })}
                </p>
              </div>
            </motion.div>
          )}
        </div>
        {expandedPostId === post.id && (
          <motion.div
            className="bg-(--white) rounded-full px-4 flex w-fit gap-6 mb-1 font-bold text-sm text-(--secondary)"
            animate={{
              opacity: 1,
              scale: 1,
            }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center gap-2">
              <MapPinIcon color="--secondary" size={12} />
              <p className="truncate">{post.location}</p>
            </div>

            <div className="flex items-center gap-2">
              <CalenderIcon color="--secondary" size={10} />
              <p>
                {post.time?.toDate().toLocaleDateString(undefined, {
                  day: "2-digit",
                  month: "2-digit",
                })}
              </p>
            </div>
          </motion.div>
        )}

        <div className="z-10">
          <ul className="flex gap-1 text-(--white) text-xs">
            {post.tags.map((tag, index) => (
              <li
                key={index}
                className={`border border-(--secondary) py-1 rounded-2xl px-3 cursor-pointer ${
                  selectedTags.includes(tag)
                    ? "bg-(--white) text-(--secondary) font-bold"
                    : ""
                }`}
                onClick={() => handleDropdownChange(tag)}
              >
                {tag}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex justify-between relative z-10">
          <div className="flex flex-col justify-between gap-2">
            <p
              className={`w-70 text-(--white) text-sm cursor-pointer overflow-hidden whitespace-pre-wrap ${
                expandedPostId === post.id ? "" : "line-clamp-3"
              }`}
            >
              {post.description}
            </p>

            {expandedPostId === post.id && post.imageUrls?.length > 0 && (
              <div className="flex gap-2 overflow-x-auto">
                {post.imageUrls.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt="Post billede"
                    className="h-40 w-auto rounded-xl cursor-pointer"
                    onClick={() => setPreviewImage(url)} // just call the handler
                  />
                ))}
              </div>
            )}

            <div className="w-60 flex justify-between items-center">
              {showAuthor && (
                <div className="flex items-center gap-2">
                  <img
                    src={post.author?.profileImage}
                    alt="Afsender"
                    className="w-8 h-8 rounded-full object-cover cursor-pointer"
                    onClick={() => navigate(`/AndresProfil/${post.uid}`)}
                  />

                  <p className="text-(--secondary) text-sm">
                    {post.author?.fuldenavn}
                  </p>
                </div>
              )}

              {showTimestamp && (
                <div className="flex items-center gap-2 text-(--secondary) text-xs ">
                  <p>
                    {post.createdAt ? timeAgo(post.createdAt.toDate()) : ""}
                  </p>
                </div>
              )}
              <div className="flex gap-2">
                <GroupsIcon color="--secondary" size={20} />
                <p className="text-(--secondary) text-sm">
                  {post.participants?.length || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        <motion.div
          className="absolute bottom-0 right-0 z-10 rounded-tl-full overflow-hidden"
          style={{
            originX: 1,
            originY: 1,
            pointerEvents: isFocused ? "auto" : "none",
          }}
          animate={{
            scale: expandedPostId === null ? 0.8 : isFocused ? 1 : 0.5,
          }}
          transition={{ duration: 0.3 }}
        >
          {expandedPostId === post.id && (
            <motion.div
              className="absolute bottom-3 right-3 z-20 pointer-events-none animate-pulse"
              animate={{
                opacity: expandedPostId === post.id ? 1 : 0,
                scale: expandedPostId === post.id ? 1 : 0.6,
              }}
              transition={{ duration: 0.2 }}
            >
              <FingerPrintIcon color="--secondary" size={30} />
            </motion.div>
          )}

          {isInvitation ? (
            <motion.div
              className="absolute bottom-0 right-0 z-10 flex gap-2 p-2 bg-white rounded-tl-2xl shadow-lg"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleInvitationResponse(false);
                }}
                className="px-4 py-2 border-2 border-gray-300 text-gray-700 font-semibold rounded-full hover:bg-gray-50"
              >
                {t("deny")}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleInvitationResponse(true);
                }}
                className="px-4 py-2 bg-(--secondary) text-white font-semibold rounded-full hover:brightness-110"
              >
                {t("accept")}
              </button>
            </motion.div>
          ) : (
            <Tilmeld
              postId={post.id}
              participants={post.participants}
              requests={post.requests || []}
              onUpdate={fetchPosts}
            />
          )}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
