import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  deleteDoc,
} from "firebase/firestore";
import { NavLink } from "react-router";
import Settings from "./Settings";
import { motion } from "framer-motion";
import OwnPost from "../components/Post";
import Tilmeld from "../components/Tilmeld";
import CreatePost from "../components/CreatePost";
import { useRef } from "react";

import { updateDoc } from "firebase/firestore";
import GroupsIcon from "../../public/icons/GroupsIcon";
import CalenderIcon from "../../public/icons/CalenderIcon";
import MapPinIcon from "../../public/icons/MapPinIcon";
import { useNavigate } from "react-router";
import ColorCircle from "../components/ColorCircle";
import { useTranslation } from "react-i18next";
import { arrayRemove } from "firebase/firestore";

export default function Profil() {
  const { t } = useTranslation();

  const [userData, setUserData] = useState(null);
  const [activeTab, setActiveTab] = useState("active");
  const [expandedPostId, setExpandedPostId] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const navigate = useNavigate();
  const [previewImage, setPreviewImage] = useState(null);
  const [userPosts, setUserPosts] = useState([]);

  const [bio, setBio] = useState("");
  const [posts, setPosts] = useState([]);

  const bioRef = useRef(null);

  useEffect(() => {
    if (bioRef.current) {
      bioRef.current.style.height = "auto"; // nulstil først
      bioRef.current.style.height = bioRef.current.scrollHeight + "px"; // sæt til scrollHeight
    }
  }, [bio]);

  const userId = auth.currentUser?.uid;

  const [editingPost, setEditingPost] = useState(null);

  useEffect(() => {
    if (!userId) return;

    const myCompletedPosts = posts.filter(
      (post) => post.uid === userId && post.active === false
    );

    setUserPosts(myCompletedPosts);
  }, [posts, userId]);

  const fetchPosts = async () => {
    const postsSnapshot = await getDocs(collection(db, "posts"));
    const userCache = {};

    const postsWithUser = await Promise.all(
      postsSnapshot.docs.map(async (postDoc) => {
        const postData = postDoc.data();
        const userSnap = await getDoc(doc(db, "users", postData.uid));

        const participantsArray = Array.isArray(postData.participants)
          ? postData.participants
          : [];

        const participantsData = await Promise.all(
          participantsArray.map(async (uid) => {
            if (!userCache[uid]) {
              const snap = await getDoc(doc(db, "users", uid));
              userCache[uid] = snap.exists() ? snap.data().fuldenavn : "Ukendt";
            }
            return userCache[uid];
          })
        );

        return {
          id: postDoc.id,
          ...postData,
          author: userSnap.exists() ? userSnap.data() : null,
          participantsNames: participantsData,
        };
      })
    );

    setPosts(postsWithUser);
  };

  const toggleExpand = (id) => {
    setExpandedPostId((prevId) => (prevId === id ? null : id));
  };

  useEffect(() => {
    const fetchData = async () => {
      await fetchPosts();
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const docRef = doc(db, "users", user.uid);
      const snap = await getDoc(docRef);

      if (snap.exists()) {
        const data = snap.data();
        setUserData(data);
        setBio(data.bio || "");
      }
    };

    fetchProfile();
  }, []);

  if (!userData) return <p>{t(`ownProfile.loading`)}</p>;

  const myPosts = posts.filter(
    (post) => post.uid === userId && post.active !== false
  );

  const joinedPosts = posts.filter(
    (post) =>
      Array.isArray(post.participants) &&
      post.participants.includes(userId) &&
      post.uid !== userId &&
      post.active !== false
  );

  function timeAgo(date) {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

    const intervals = [
      { label: [t(`time.year_one`), t(`time.year_other`)], secs: 31536000 },
      { label: [t(`time.month_one`), t(`time.month_other`)], secs: 2592000 },
      { label: [t(`time.week_one`), t(`time.week_other`)], secs: 604800 },
      { label: [t(`time.day_one`), t(`time.day_other`)], secs: 86400 },
      { label: [t(`time.hour_one`), t(`time.hour_other`)], secs: 3600 },
      { label: [t(`time.minute_one`), t(`time.minute_other`)], secs: 60 },
      { label: [t(`time.second_one`), t(`time.second_other`)], secs: 1 },
    ];

    for (const i of intervals) {
      const count = Math.floor(seconds / i.secs);
      if (count >= 1) {
        const label = count === 1 ? i.label[0] : i.label[1];
        return t(`time.ago`, { count: count, unit: label });
      }
    }

    return t(`time.now`);
  }

  const deletePost = async (postId) => {
    try {
      console.log("Sletter post:", postId);

      // Hent post data FØR vi sletter den
      const postRef = doc(db, "posts", postId);
      const postSnap = await getDoc(postRef);
      const postData = postSnap.data();
      const postTitle = postData.title;
      const participants = postData.participants || [];

      // Tjek om der var en gruppechat
      const groupChatId = `group_${postId}`;
      const groupChatRef = doc(db, "chats", groupChatId);
      const groupChatSnap = await getDoc(groupChatRef);
      const hadGroupChat = groupChatSnap.exists();

      // Hent info om den bruger der sletter (dig selv)
      const currentUserSnap = await getDoc(doc(db, "users", userId));
      const currentUserData = currentUserSnap.data();

      // Send notifikationer til alle deltagere
      if (participants.length > 0) {
        console.log("Sender notifikationer til deltagere:", participants);

        for (const participantId of participants) {
          try {
            const participantRef = doc(db, "users", participantId);
            const participantSnap = await getDoc(participantRef);

            if (participantSnap.exists()) {
              const participantData = participantSnap.data();
              const existingNotifications = participantData.notifications || [];

              const filteredNotifications = existingNotifications.filter(
                (n) =>
                  !(
                    n.notificationType === "post_deleted" &&
                    n.postId === postId &&
                    (!n.status || n.status === "pending")
                  )
              );

              const newNotification = {
                notificationType: "post_deleted",
                postId: postId,
                postTitle: postTitle,
                deletedBy: userId,
                deletedByName:
                  currentUserData.kaldenavn || currentUserData.fuldenavn,
                deletedByImage: currentUserData.profileImage || null,
                hadGroupChat: hadGroupChat,
                status: "pending",
                timestamp: Date.now(),
                createdAt: Date.now(),
              };

              await updateDoc(participantRef, {
                notifications: [...filteredNotifications, newNotification],
              });
            }
          } catch (error) {
            console.error(
              "Fejl ved sending af notifikation til:",
              participantId,
              error
            );
          }
        }

        console.log("Notifikationer sendt til alle deltagere");
      }

      // Slet selve opslaget
      await deleteDoc(postRef);
      console.log("Post slettet");

      // Slet gruppechat hvis den findes
      if (hadGroupChat) {
        console.log("Fandt gruppechat, sletter...");

        const messagesRef = collection(db, "chats", groupChatId, "messages");
        const messagesSnap = await getDocs(messagesRef);

        console.log("Sletter beskeder:", messagesSnap.docs.length);

        for (const messageDoc of messagesSnap.docs) {
          await deleteDoc(messageDoc.ref);
        }

        await deleteDoc(groupChatRef);
        console.log("Gruppechat og alle beskeder slettet");
      } else {
        console.log("Ingen gruppechat fundet");
      }

      // Opdater den lokale state
      setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));

      console.log("Alt slettet succesfuldt!");
    } catch (error) {
      console.error("Fejl ved sletning:", error);
      alert("Der opstod en fejl ved sletning. Prøv igen.");
    }
  };

  const markAsDone = async (postId) => {
    try {
      const postRef = doc(db, "posts", postId);
      await updateDoc(postRef, { active: false });

      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId ? { ...post, active: false } : post
        )
      );
      const groupChatId = `group_${postId}`;
      const groupChatRef = doc(db, "chats", groupChatId);

      const groupChatSnap = await getDoc(groupChatRef);

      if (groupChatSnap.exists()) {
        const messagesRef = collection(db, "chats", groupChatId, "messages");
        const messagesSnap = await getDocs(messagesRef);

        for (const messageDoc of messagesSnap.docs) {
          await deleteDoc(messageDoc.ref);
        }

        // 3b. Slet selve gruppechat dokumentet
        await deleteDoc(groupChatRef);
        console.log("✅ Gruppechat og alle beskeder slettet");
      } else {
        console.log("ℹ️ Ingen gruppechat fundet");
      }

      console.log("🎉 Opgave markeret som færdig og gruppechat slettet!");
    } catch (error) {
      console.error("❌ Fejl ved opdatering:", error);
      alert("Der opstod en fejl. Prøv igen.");
    }
  };

  const removeSelfFromTask = async (postId) => {
    const userId = auth.currentUser.uid;
    const postRef = doc(db, "posts", postId);

    try {
      await updateDoc(postRef, {
        participants: arrayRemove(userId),
      });

      // Optionally update local state
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? {
                ...post,
                participants: post.participants.filter((id) => id !== userId),
              }
            : post
        )
      );

      alert("You have been removed from this task.");
    } catch (error) {
      console.error("Error removing user from task:", error);
      alert("Could not remove you from this task.");
    }
  };

  const renderMyPost = (post) => (
    <motion.div
      key={post.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className=""
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{
          opacity:
            expandedPostId === null ? 1 : expandedPostId === post.id ? 1 : 0.5, // lavere opacity for ikke-aktuelle
          scale:
            expandedPostId === null ? 1 : expandedPostId === post.id ? 1 : 0.95, // lidt mindre
        }}
        transition={{ duration: 0.3 }}
        onClick={() => toggleExpand(post.id)}
        className="flex flex-col relative overflow-hidden mb-4"
      >
        <div className="p-4 bg-(--secondary) rounded-2xl gap-2 flex flex-col relative overflow-hidden">
          <div className="flex items-center justify-between">
            <h2 className="justify-start text-(--white) text-xl overskrift">
              {post.title}
            </h2>
            <div className="bg-(--white) rounded-full px-2 flex gap-4 font-bold text-sm text-(--secondary)">
              <div className="flex items-center gap-2">
                <MapPinIcon color="--secondary" size={10} />{" "}
                <p>{post.location}</p>
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
            </div>
          </div>

          <div>
            <ul className="flex flex-wrap gap-1 text-(--secondary) font-bold text-xs ">
              {post.tags.map((tag, index) => (
                <li
                  key={index}
                  className={`bg-(--white) py-1 rounded-2xl px-3 cursor-pointer ${
                    selectedTags.includes(tag)
                      ? "text-(--secondary) font-bold"
                      : ""
                  }`}
                >
                  {tag}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-3">
            <p
              className={` text-(--white) text-sm cursor-pointer overflow-hidden whitespace-pre-wrap ${
                expandedPostId === post.id ? "" : "line-clamp-3"
              }`}
            >
              {post.description}
            </p>

            {expandedPostId === post.id && post.imageUrls && (
              <div className="flex gap-2 overflow-x-auto mt-2">
                {post.imageUrls.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt="Post billede"
                    className="h-40 w-auto rounded-xl cursor-pointer"
                    onClick={() => setPreviewImage(url)}
                  />
                ))}
              </div>
            )}

            <div className="flex justify-between items-center">
              <div className="text-(--white) font-bold">
                <p>{post.createdAt ? timeAgo(post.createdAt.toDate()) : ""}</p>
              </div>
              <div className="flex gap-2">
                <GroupsIcon color="--white" size={20} />
                <p className="text-(--white) text-sm">
                  {post.participants?.length || 0}
                </p>
              </div>
            </div>
            <div
              className={`flex gap-2 ${
                expandedPostId === post.id ? "block" : "hidden"
              }`}
              onClick={() => toggleExpand(post.id)}
            >
              {post.participantsNames.length > 0 ? (
                <p className="text-(--white) text-sm">
                  {post.participantsNames.join(", ")}
                </p>
              ) : (
                <p className="text-(--white) text-sm">
                  {t(`post.noParticipants`)}
                </p>
              )}
            </div>
          </div>
        </div>
        <div
          className={`flex justify-between ${
            expandedPostId === post.id ? "block" : "hidden"
          } px-8`}
          onClick={() => toggleExpand(post.id)}
        >
          <button
            className="w-25 text-sm uppercase text-(--primary) font-bold px-3 py-1 rounded-b-xl"
            onClick={() => {
              if (window.confirm(t(`post.confirmDelete`))) {
                deletePost(post.id);
              }
            }}
          >
            {t(`actions.delete`)}
          </button>

          <button
            className="w-50 border-2 text-md uppercase border-t-0 bg-(--primary) text-(--white) font-bold px-5 py-2 rounded-b-xl"
            onClick={() => {
              if (window.confirm(t(`post.confirmDone`))) {
                markAsDone(post.id, post.title);
              }
            }}
          >
            {t(`actions.markDone`)}
          </button>

          <button
            className="w-25 text-sm uppercase text-(--primary) font-bold px-3 py-1 rounded-b-xl"
            onClick={(e) => {
              e.stopPropagation();
              setEditingPost(post);
            }}
          >
            Rediger
          </button>
        </div>
      </motion.div>
    </motion.div>
  );

  const renderOthersPost = (post) => (
    <motion.div
      key={post.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-4"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{
          opacity:
            expandedPostId === null ? 1 : expandedPostId === post.id ? 1 : 0.5, // lavere opacity for ikke-aktuelle
          scale:
            expandedPostId === null ? 1 : expandedPostId === post.id ? 1 : 0.95, // lidt mindre
        }}
        transition={{ duration: 0.3 }}
        onClick={() => toggleExpand(post.id)}
        className={`mb-4 p-4 bg-(--primary) rounded-2xl gap-2 flex flex-col relative overflow-hidden
          
          `}
      >
        <div className="flex items-center justify-between">
          <h2 className="justify-start text-(--secondary) text-xl overskrift">
            {post.title}
          </h2>
          <div className="bg-(--white) rounded-full px-2 flex gap-4 font-bold text-sm text-(--secondary)">
            <div className="flex items-center gap-2">
              <MapPinIcon color="--secondary" size={10} />{" "}
              <p>{post.location}</p>
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
          </div>
        </div>

        <div>
          <ul className="flex gap-1 text-(--white) text-xs">
            {post.tags.map((tag, index) => (
              <li
                key={index}
                className={`border border-(--secondary) py-1 rounded-2xl px-3 cursor-pointer ${
                  selectedTags.includes(tag)
                    ? "bg-(--white) text-(--secondary) font-bold"
                    : ""
                }`}
              >
                {tag}
              </li>
            ))}
          </ul>
        </div>

        <div
          className={`flex justify-between relative
      
        `}
        >
          <div className="flex flex-col justify-between gap-2">
            <p
              className={`w-70 text-(--white) text-sm cursor-pointer overflow-hidden ${
                expandedPostId === post.id ? "" : "line-clamp-3"
              }`}
            >
              {post.description}
            </p>

            {expandedPostId === post.id && post.imageUrls && (
              <div className="flex gap-2 overflow-x-auto mt-2">
                {post.imageUrls.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt="Post billede"
                    className="h-40 w-auto rounded-xl cursor-pointer"
                    onClick={() => setPreviewImage(url)}
                  />
                ))}
              </div>
            )}

            <div className="w-60 flex justify-between items-center">
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
              <div className="flex gap-2">
                <GroupsIcon color="--secondary" size={20} />
                <p className="text-(--secondary) text-sm">
                  {post.participants?.length || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
        <Tilmeld
          postId={post.id}
          participants={post.participants}
          requests={post.requests || []} // send requests med
          onUpdate={fetchPosts}
          className="absolute bottom-0 right-0 z-10"
        />
      </motion.div>
      <div
        className={`flex justify-center ${
          expandedPostId === post.id ? "block" : "hidden"
        } px-8`}
        onClick={() => toggleExpand(post.id)}
      >
        <button
          className="text-sm uppercase text-(--primary) font-bold"
          onClick={(e) => {
            e.stopPropagation(); // prevent collapsing the post
            if (
              window.confirm("Do you want to remove yourself from this task?")
            ) {
              removeSelfFromTask(post.id);
            }
          }}
        >
          {t(`actions.delete`)}
        </button>
      </div>
    </motion.div>
  );

  const completedCount = posts.filter(
    (post) =>
      post.active === false &&
      (post.uid === userId ||
        (Array.isArray(post.participants) &&
          post.participants.includes(userId)))
  ).length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="relative p-4 overflow-hidden"
    >
      <CreatePost
        open={!!editingPost}
        post={editingPost}
        onClose={() => {
          setEditingPost(null);
          fetchPosts(); // refresh list
        }}
      />

      <ColorCircle />

      {/* Header Section */}
      <div className="pb-4 relative">
        {/* Profile Info */}
        <div className="flex items-center gap-4 mb-4">
          {/* Avatar with border */}
          <div className="relative">
            <div className="w-20 h-20 rounded-full">
              <img
                src={userData.profileImage}
                alt={userData.fuldenavnname}
                className="w-full h-full rounded-full object-cover"
              />
            </div>
          </div>

          {/* Name and Study */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 whitespace-nowrap">
              {userData.fuldenavn}
            </h1>
            <p className="text-blue-500 font-bold text-sm">{userData.study}</p>
            <p className="text-sm text-blue-500/50">{userData.pronouns}</p>
            <div className="absolute right-0 top-2 pr-4 mt-2">
              <NavLink to="/Settings">
                <svg
                  className="w-6 h-6 text-[#002546]" // w-6/h-6 svarer nogenlunde til 24px
                  viewBox="0 0 21 20"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M7.3 20L6.9 16.8C6.68333 16.7167 6.47933 16.6167 6.288 16.5C6.09667 16.3833 5.909 16.2583 5.725 16.125L2.75 17.375L0 12.625L2.575 10.675C2.55833 10.5583 2.55 10.446 2.55 10.338V9.663C2.55 9.55433 2.55833 9.44167 2.575 9.325L0 7.375L2.75 2.625L5.725 3.875C5.90833 3.74167 6.1 3.61667 6.3 3.5C6.5 3.38333 6.7 3.28333 6.9 3.2L7.3 0H12.8L13.2 3.2C13.4167 3.28333 13.621 3.38333 13.813 3.5C14.005 3.61667 14.1923 3.74167 14.375 3.875L17.35 2.625L20.1 7.375L17.525 9.325C17.5417 9.44167 17.55 9.55433 17.55 9.663V10.337C17.55 10.4457 17.5333 10.5583 17.5 10.675L20.075 12.625L17.325 17.375L14.375 16.125C14.1917 16.2583 14 16.3833 13.8 16.5C13.6 16.6167 13.4 16.7167 13.2 16.8L12.8 20H7.3ZM10.1 13.5C11.0667 13.5 11.8917 13.1583 12.575 12.475C13.2583 11.7917 13.6 10.9667 13.6 10C13.6 9.03333 13.2583 8.20833 12.575 7.525C11.8917 6.84167 11.0667 6.5 10.1 6.5C9.11667 6.5 8.28733 6.84167 7.612 7.525C6.93667 8.20833 6.59933 9.03333 6.6 10C6.60067 10.9667 6.93833 11.7917 7.613 12.475C8.28767 13.1583 9.11667 13.5 10.1 13.5Z" />
                </svg>
              </NavLink>
            </div>
          </div>
        </div>

        {/* Bio */}
        <textarea
          ref={bioRef}
          className="w-full text-(--secondary) resize-none overflow-hidden"
          placeholder={t(`ownProfile.bioPlaceholder`)}
          value={bio}
          rows={3}
          onChange={(e) => {
            const lines = e.target.value.split("\n");
            if (lines.length <= 3) {
              setBio(e.target.value);
            } else {
              setBio(lines.slice(0, 3).join("\n")); // begræns til maks 3 linjer
            }
          }}
          onBlur={async () => {
            const user = auth.currentUser;
            if (!user) return;

            const docRef = doc(db, "users", user.uid);
            await updateDoc(docRef, { bio });
          }}
        />

        <div className="flex justify-center pt-4">
          <p className="text-xs flex gap-4 items-center text-(--primary) font-semibold">
            {t("tasks-solved")}
            <span className="text-(--secondary) font-bold text-xl">
              {completedCount}
            </span>
          </p>
        </div>
      </div>

      <div className="flex flex-col justify-center">
        {/* Tab Buttons */}
        <div className="flex gap-3 px-10 justify-center">
          <button
            onClick={() => setActiveTab("active")}
            className={`flex-1 py-2 px-6 rounded-full font-semibold transition-colors ${
              activeTab === "active"
                ? "bg-(--secondary) text-(--white) border-2 border-(--secondary"
                : "text-(--secondary) border-2 border-(--secondary"
            }`}
          >
            {t(`ownProfile.tabs.created`)}
          </button>
          <button
            onClick={() => setActiveTab("group")}
            className={`flex-1 py-2 px-6 rounded-full font-semibold transition-colors ${
              activeTab === "group"
                ? "bg-(--secondary) text-(--white) border-2 border-(--secondary"
                : "text-(--secondary) border-2 border-(--secondary "
            }`}
          >
            {t(`ownProfile.tabs.joined`)}
          </button>
        </div>

        <div className="mt-6">
          {activeTab === "active" &&
            myPosts.length > 0 &&
            myPosts.map((post, index) => renderMyPost(post, index))}

          {activeTab === "group" &&
            joinedPosts.length > 0 &&
            joinedPosts.map((post, index) => renderOthersPost(post, index))}
        </div>

        {previewImage && (
          <div
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
            onClick={() => setPreviewImage(null)}
          >
            <div className="max-w-3xl max-h-[90vh]">
              <img
                src={previewImage}
                alt={t(`common.preview`)}
                className="w-full h-full object-contain rounded-xl"
              />
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
