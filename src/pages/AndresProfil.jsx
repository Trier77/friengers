import { useParams, useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  arrayUnion,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db, auth } from "../firebase";
import PostCard from "../components/PostCard";
import PrivatChatIcon from "../../public/icons/PrivatChat";
import ColorCircle from "../components/ColorCircle";

function AndresProfil() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInviteDropdown, setShowInviteDropdown] = useState(false);
  const [myPosts, setMyPosts] = useState([]);
  const [invitedPosts, setInvitedPosts] = useState(new Set()); // Track hvilke posts brugeren er inviteret til
  const currentUserId = auth.currentUser?.uid;

  const [expandedPostId, setExpandedPostId] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const toggleExpand = (id) =>
    setExpandedPostId((prev) => (prev === id ? null : id));

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Hent brugerdata
        const userDoc = await getDoc(doc(db, "users", userId));
        if (!userDoc.exists()) {
          setLoading(false);
          return;
        }
        setUserData(userDoc.data());

        // 1. Hent brugerens egne opgaver
        const postsQuery = query(
          collection(db, "posts"),
          where("uid", "==", userId)
        );
        const postsSnapshot = await getDocs(postsQuery);
        const ownPosts = postsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // 2. Hent opgaver hvor brugeren er deltager
        const participantQuery = query(
          collection(db, "posts"),
          where("participants", "array-contains", userId)
        );
        const participantSnapshot = await getDocs(participantQuery);
        const participantPosts = participantSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // 3. Kombiner uden dubletter
        const allPostsMap = new Map();
        ownPosts.forEach((post) => allPostsMap.set(post.id, post));
        participantPosts.forEach((post) => allPostsMap.set(post.id, post));
        const allPosts = Array.from(allPostsMap.values());

        setUserPosts(allPosts);

        // 4. Hent MINE posts (for invitation dropdown)
        if (currentUserId) {
          const myPostsQuery = query(
            collection(db, "posts"),
            where("uid", "==", currentUserId)
          );
          const myPostsSnapshot = await getDocs(myPostsQuery);
          const myPostsList = myPostsSnapshot.docs
            .map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }))
            .filter((post) => {
              const participants = post.participants || [];
              const requests = post.requests || [];
              const maxParticipants = post.maxParticipants || 1;
              const isActive = post.active !== false;
              const hasSpace = participants.length < maxParticipants;
              const notAlreadyParticipant = !participants.includes(userId);
              const alreadyInvited = requests.includes(userId);

              if (alreadyInvited) {
                setInvitedPosts((prev) => new Set([...prev, post.id]));
                return isActive && notAlreadyParticipant;
              }

              return isActive && hasSpace && notAlreadyParticipant;
            });

          setMyPosts(myPostsList);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching user:", error);
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId, currentUserId]);

  const handleInvite = async (postId) => {
    try {
      const postRef = doc(db, "posts", postId);
      const postSnap = await getDoc(postRef);
      const postData = postSnap.data();

      // 1. Tilføj brugeren til post's requests
      await updateDoc(postRef, {
        requests: arrayUnion(userId),
      });

      const currentParticipants = postData.participants || [];

      // 2. Tjek om gruppechat skal oprettes (hvis første deltager)
      if (currentParticipants.length === 0) {
        console.log("🎉 FØRSTE DELTAGER - VIS GRUPPECHAT POPUP!");
        // Vis popup for at oprette gruppechat
        setShowInviteDropdown(false); // Luk dropdown
        // Vi skal vise popup her - men vi skal bruge en state i parent eller anden løsning
        // For nu, lad os bare oprette den automatisk hvis det er en invitation

        // Auto-opret gruppechat ved invitation
        const groupChatId = `group_${postId}`;
        const groupChatRef = doc(db, "chats", groupChatId);

        await setDoc(groupChatRef, {
          postId: postId,
          chatName: postData.title,
          participants: [currentUserId, userId], // Både dig og den inviterede
          createdAt: serverTimestamp(),
          createdBy: currentUserId,
          isGroupChat: true,
          lastMessage: "Gruppechat oprettet",
          lastMessageTime: serverTimestamp(),
          lastMessageSenderId: currentUserId,
        });

        console.log("✅ Gruppechat auto-oprettet ved invitation");
      } else {
        // 3. Hvis gruppechat allerede eksisterer, tilføj brugeren
        const groupChatId = `group_${postId}`;
        const groupChatRef = doc(db, "chats", groupChatId);

        try {
          const groupChatSnap = await getDoc(groupChatRef);
          if (groupChatSnap.exists()) {
            await updateDoc(groupChatRef, {
              participants: arrayUnion(userId),
            });
            console.log("✅ Bruger tilføjet til gruppechat");
          }
        } catch (error) {
          console.log("ℹ️ Ingen gruppechat endnu");
        }
      }

      // 4. Opret notification til den inviterede bruger
      const currentUserDoc = await getDoc(doc(db, "users", currentUserId));
      const currentUserData = currentUserDoc.data();

      // Opret notification dokument
      await updateDoc(doc(db, "users", userId), {
        notifications: arrayUnion({
          type: "invitation",
          from: currentUserId,
          fromName: currentUserData.kaldenavn || currentUserData.fuldenavn,
          fromImage: currentUserData.profileImage || null,
          postId: postId,
          postTitle: postData.title,
          timestamp: new Date().toISOString(),
        }),
      });

      console.log("✅ Invitation sendt!");

      // Opdater UI - marker som inviteret
      setInvitedPosts((prev) => new Set([...prev, postId]));

      // Vis success besked
      alert(`Du har inviteret ${userData.kaldenavn || userData.fuldenavn}!`);
    } catch (error) {
      console.error("❌ Fejl ved invitation:", error);
      alert("Der opstod en fejl. Prøv igen.");
    }
  };

  if (loading) {
    return <div className="p-4 text-center">Henter profil...</div>;
  }

  if (!userData) {
    return <div className="p-4 text-center">Bruger ikke fundet</div>;
  }

  const completedCount = userPosts.filter(
    (post) => post.active !== false
  ).length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="relative p-4 overflow-hidden"
    >
      <ColorCircle />

      {/* Header Section */}
      <div className="pb-4 relative">
        {/* Flag Icon - top right */}
        <button className="absolute top-4 right-4">
          <svg
            className="w-6 h-6 text-blue-500 opacity-40"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2z"
            />
          </svg>
        </button>
        {/* Profile Info */}
        <div className="flex items-center gap-4 mb-4">
          {/* Avatar with border */}
          <div className="relative">
            <div className="w-20 h-20 rounded-full">
              <img
                src={userData.profileImage || "https://via.placeholder.com/80"}
                alt={userData.fuldenavn}
                className="w-full h-full rounded-full object-cover"
              />
            </div>
          </div>

          {/* Name and Study */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 whitespace-nowrap">
              {userData.fuldenavn || userData.kaldenavn || "Ukendt"}
            </h1>
            <p className="text-blue-500 font-bold text-sm">
              {userData.study || "Ikke angivet"}
            </p>
            <p className="text-sm text-blue-500/50">
              {userData.pronouns || ""}
            </p>
          </div>
        </div>

        <div className="flex justify-between">
          {/* Bio */}
          <p className="text-(--secondary) text-sm">
            {userData.bio || "Ingen beskrivelse tilgængelig"}
          </p>{" "}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between pt-4 items-center">
          <div>
            <p className="text-xs flex gap-4 items-center text-(--primary) font-semibold">
              Opgaver løst:
              <span className="text-(--secondary) font-bold text-xl">
                {completedCount}
              </span>
            </p>
          </div>{" "}
          <div className="flex gap-4">
            {/* Message Button */}
            <div>
              <button
                onClick={() => navigate(`/Chats/${userId}`)}
                className="flex justify-center items-center w-10 h-10 rounded-full font-semibold transition-colors bg-(--secondary) text-(--white)"
              >
                <PrivatChatIcon color="--white" size={15} />
              </button>
            </div>

            {/* Invite Button */}
            <div>
              <button
                onClick={() => setShowInviteDropdown(!showInviteDropdown)}
                className="flex justify-center items-center w-25 h-10 rounded-full font-semibold transition-colors text-(--secondary) border border-(--secondary)"
              >
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  <p className="text-xs text-(--secondary) font-semibold">
                    Inviter
                  </p>{" "}
                </div>
              </button>
            </div>
          </div>
          {/* Tasks Completed */}
        </div>

        {/* Invite Dropdown */}
        <AnimatePresence>
          {showInviteDropdown && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="bg-gray-50 rounded-2xl p-4 mb-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Inviter til en opgave:
                </h3>

                {myPosts.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-gray-500 text-sm mb-2">
                      Du har ingen opgaver at invitere til
                    </p>
                    <p className="text-gray-400 text-xs">
                      Opret en opgave først for at kunne invitere andre
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {myPosts.map((post) => {
                      const isInvited =
                        invitedPosts.has(post.id) ||
                        post.requests?.includes(userId);

                      return (
                        <div
                          key={post.id}
                          onClick={() => !isInvited && handleInvite(post.id)}
                          className={`bg-white p-3 rounded-xl border transition-colors ${
                            isInvited
                              ? "border-green-300 bg-green-50 cursor-default"
                              : "border-gray-200 cursor-pointer hover:bg-blue-50"
                          }`}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="font-semibold text-gray-900 text-sm flex-1 pr-2">
                              {post.title}
                            </h4>
                            <div className="flex items-center gap-2">
                              {isInvited ? (
                                <span className="text-xs text-green-600 font-semibold flex items-center gap-1">
                                  <svg
                                    className="w-4 h-4"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                  Inviteret
                                </span>
                              ) : (
                                <span className="text-xs text-gray-500 whitespace-nowrap">
                                  {post.participants?.length || 0}/
                                  {post.maxParticipants || 1}
                                </span>
                              )}
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 line-clamp-1">
                            {post.description}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Active Posts Section */}
      <div className="p">
        <h2 className="text-center font-bold text-gray-900 mb-4">
          Aktive opgaver
        </h2>
        {userPosts.length === 0 ? (
          <p className="text-center text-gray-500">Ingen aktive opgaver</p>
        ) : (
          userPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              userId={userId} // den profil vi ser
              expandedPostId={expandedPostId}
              toggleExpand={toggleExpand}
              selectedTags={[]} // ingen filter her
              handleDropdownChange={() => {}}
              setPreviewImage={setPreviewImage} // kan bruges til at åbne billede
              navigate={navigate}
              fetchPosts={() => {}} // tom funktion, Tilmeld kan ignorere
              showAuthor={false}
              showTimestamp={true}
            />
          ))
        )}
      </div>
      {/* Preview modal */}
      {previewImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
          onClick={() => setPreviewImage(null)}
        >
          <div className="max-w-3xl max-h-[90vh]">
            <img
              src={previewImage}
              alt="Preview"
              className="w-full h-full object-contain rounded-xl"
            />
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default AndresProfil;
