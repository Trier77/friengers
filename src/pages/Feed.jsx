import { useEffect, useState, useRef } from "react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { motion, AnimatePresence } from "framer-motion";
import CalenderIcon from "../../public/icons/CalenderIcon";
import MapPinIcon from "../../public/icons/MapPinIcon";
import Tilmeld from "../components/Tilmeld";
import { useNavigate, useSearchParams } from "react-router";
import Create from "../components/Create";
import GroupsIcon from "../../public/icons/GroupsIcon";
import NotificationWrapper from "../components/NotificationWrapper";
import useTags from "../components/Tags";
import PostCard from "../components/PostCard";
import FunnelIcon from "../../public/icons/FunnelIcon";
import { useSwipe } from "../components/SwipeContext";
import { useTranslation } from "react-i18next";
import OnboardingModal from "../components/OnboardingModal";
import PreviewModal from "../components/PreviewModal";

export default function Feed() {
  const { t } = useTranslation();
  const { tags: allTags } = useTags();
  const [posts, setPosts] = useState([]);
  const navigate = useNavigate();
  const [expandedPostId, setExpandedPostId] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [showFilter, setShowFilter] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [highlightPostId, setHighlightPostId] = useState(null);
  const myPostsRef = useRef(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [myPostsDropdownOpen, setMyPostsDropdownOpen] = useState(false); // 🆕 Dropdown state

  const { setSwipeEnabled } = useSwipe();

  const userId = auth.currentUser?.uid;
  const [searchParams, setSearchParams] = useSearchParams();
  const invitationPostId = searchParams.get("invitation");
  const invitationFrom = searchParams.get("from");

  const fetchPosts = async () => {
    const postsSnapshot = await getDocs(collection(db, "posts"));
    const postsWithUser = await Promise.all(
      postsSnapshot.docs.map(async (postDoc) => {
        const postData = postDoc.data();
        const userSnap = await getDoc(doc(db, "users", postData.uid));
        return {
          id: postDoc.id,
          ...postData,
          author: userSnap.exists() ? userSnap.data() : null,
        };
      })
    );
    setPosts(postsWithUser);
  };

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem("hasSeenOnboarding");
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      await fetchPosts();
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (invitationPostId && posts.length > 0) {
      setTimeout(() => {
        const postElement = document.getElementById(`post-${invitationPostId}`);
        if (postElement) {
          postElement.scrollIntoView({ behavior: "smooth", block: "center" });
          setExpandedPostId(invitationPostId);
        }
      }, 300);
    }
  }, [invitationPostId, posts]);

  const myPosts = posts.filter(
    (post) => post.uid === userId && post.active !== false
  );

  const handlePostCreated = async () => {
    console.log(" handlePostCreated started");

    const oldPostIds = new Set(myPosts.map((p) => p.id));
    console.log(" Old post IDs:", Array.from(oldPostIds));

    // Hent friske posts direkte
    const postsSnapshot = await getDocs(collection(db, "posts"));
    const freshPosts = await Promise.all(
      postsSnapshot.docs.map(async (postDoc) => {
        const postData = postDoc.data();
        const userSnap = await getDoc(doc(db, "users", postData.uid));
        return {
          id: postDoc.id,
          ...postData,
          author: userSnap.exists() ? userSnap.data() : null,
        };
      })
    );

    console.log("✅ Fresh posts fetched:", freshPosts.length);

    // Opdater state
    setPosts(freshPosts);

    // Find det nye opslag
    const newMyPosts = freshPosts.filter(
      (post) => post.uid === userId && post.active !== false
    );
    console.log("📊 New myPosts count:", newMyPosts.length);

    const newPost = newMyPosts.find((p) => !oldPostIds.has(p.id));
    console.log("✨ New post:", newPost ? newPost.id : "NONE");

    if (newPost) {
      console.log("🎉 New post found:", newPost.id);

      // Åbn dropdown automatisk når nyt post oprettes
      setMyPostsDropdownOpen(true);

      // Scroll til toppen
      myPostsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

      // Trigger shockwave animation
      setTimeout(() => {
        console.log("💫 Triggering shockwave animation");
        setHighlightPostId(newPost.id);

        // Fjern highlight
        setTimeout(() => {
          console.log(" Removing highlight");
          setHighlightPostId(null);
        }, 1200);
      }, 800);
    } else {
      console.log("❌ NO NEW POST FOUND!");
    }
  };

  const toggleExpand = (id) => {
    setExpandedPostId((prevId) => (prevId === id ? null : id));
  };

  const handleDropdownChange = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const filteredPosts =
    selectedTags.length > 0
      ? posts.filter(
          (post) =>
            post.uid !== userId &&
            post.active !== false && // ← only active posts
            post.tags.some((tag) => selectedTags.includes(tag))
        )
      : [];

  const otherPosts = posts.filter(
    (post) => post.uid !== userId && post.active !== false
  );

  const handleOnboardingDone = () => {
    localStorage.setItem("hasSeenOnboarding", "true");
    setShowOnboarding(false);
  };

  const renderMyPost = (post, index) => (
    <motion.div
      key={post.id}
      initial={{
        opacity: 0,
        y: -20,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.5,
        ease: "easeOut",
      }}
      className="mb-2 relative"
    >
      {/* Shockwave effekt */}
      {highlightPostId === post.id && (
        <div className="absolute inset-0 border-4 border-blue-400 rounded-full animate-shockwave pointer-events-none"></div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: 0.6,
          delay: 0.3 + index * 0.15,
          ease: "easeInOut",
        }}
        onClick={() => navigate("/Profil")}
        className="flex text-(--secondary) justify-between items-center bg-(--secondary)/70 rounded-full p-2 transition-all duration-300 cursor-pointer hover:brightness-110"
      >
        <h3 className="justify-start text-(--white) text-md overskrift truncate maw-w-[120]">
          {post.title}
        </h3>

        <div className="flex justify-between items-center text-sm font-bold bg-(--white) rounded-full w-30 px-2">
          <div className="gap-1 flex items-center">
            <GroupsIcon color="--secondary" size={20} />
            <p className="text-(--secondary)">{post.participants.length}</p>
          </div>
          <div className="flex items-center gap-1">
            <CalenderIcon color="--secondary" size={10} />
            <p className="">
              {post.time?.toDate().toLocaleDateString(undefined, {
                day: "2-digit",
                month: "2-digit",
              })}
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );

  return (
    <div className="p-4">
      <NotificationWrapper />

      {/* Mine opgaver dropdown */}
      {myPosts.length > 0 && (
        <div ref={myPostsRef} className="mb-4">
          <motion.button
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0 }}
            onClick={() => setMyPostsDropdownOpen(!myPostsDropdownOpen)}
            className="w-full flex items-center justify-between bg-(--secondary) text-(--white) rounded-2xl p-4 font-bold text-lg hover:brightness-110 transition-all"
          >
            <div className="flex items-center gap-1">
              <span className="overskrift">
                {t("My Tasks") || "Mine opgaver"}
              </span>
            </div>

            {/* Chevron icon */}
            <motion.svg
              animate={{ rotate: myPostsDropdownOpen ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              className="w-6 h-6"
              fill="none"
              stroke="white"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </motion.svg>
          </motion.button>

          {/* Dropdown content med AnimatePresence */}
          <AnimatePresence>
            {myPostsDropdownOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="mt-2 space-y-2">
                  {myPosts.map((post, index) => renderMyPost(post, index))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <Create
        allTags={allTags}
        onPostCreated={handlePostCreated}
        onOpen={() => setSwipeEnabled(false)}
        onClose={() => setSwipeEnabled(true)}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-4 flex flex-col justify-end"
      >
        <motion.div
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex gap-4 items-center px-4"
        >
          <h3 className="text-(--secondary) font-bold text-lg">
            {t("overview")}
          </h3>{" "}
          <div className="w-full border border-(--secondary)"></div>
          <button
            onClick={() => setShowFilter((prev) => !prev)}
            className="text-(--primary)"
          >
            <FunnelIcon
              color="--secondary"
              size={20}
              filled={showFilter || selectedTags.length > 0}
            />
          </button>
        </motion.div>
        {selectedTags.length > 0 && !showFilter && (
          <div className="flex flex-wrap gap-2 px-2 mt-2 justify-end">
            {selectedTags.map((tag) => (
              <button
                key={tag}
                onClick={() => handleDropdownChange(tag)}
                className="px-3 py-1 rounded-2xl text-xs font-bold bg-(--secondary) text-(--white)"
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        {showFilter && (
          <motion.div
            initial={{ opacity: 0, x: 0 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.1 }}
            className="flex flex-wrap gap-2 justify-end px-2 mt-2"
          >
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => handleDropdownChange(tag)}
                className={`px-3 py-1 rounded-2xl text-xs font-bold ${
                  selectedTags.includes(tag)
                    ? "bg-(--secondary) text-(--white)"
                    : "border text-(--secondary) border-(--secondary)"
                }`}
              >
                {tag}
              </button>
            ))}
          </motion.div>
        )}
      </motion.div>

      {selectedTags.length > 0 ? (
        filteredPosts.length > 0 ? (
          <div>
            {filteredPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                userId={userId}
                expandedPostId={expandedPostId}
                toggleExpand={toggleExpand}
                selectedTags={selectedTags}
                handleDropdownChange={handleDropdownChange}
                setPreviewImage={setPreviewImage}
                navigate={navigate}
                fetchPosts={fetchPosts}
              />
            ))}
          </div>
        ) : (
          <p className="text-(--white) mt-4">
            {t(`feed.filnoMatchingPostster`)}
          </p>
        )
      ) : (
        otherPosts.map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.5,
              delay: 0.2 + index * 0.15, // staggered animation
              ease: "easeOut",
            }}
            id={`post-${post.id}`}
          >
            <PostCard
              post={post}
              userId={userId}
              expandedPostId={expandedPostId}
              toggleExpand={toggleExpand}
              selectedTags={selectedTags}
              handleDropdownChange={handleDropdownChange}
              setPreviewImage={setPreviewImage}
              navigate={navigate}
              fetchPosts={fetchPosts}
              isInvitation={invitationPostId === post.id}
              invitationFrom={invitationFrom}
              onInvitationHandled={() => {
                setSearchParams({});
                fetchPosts();
              }}
            />
          </motion.div>
        ))
      )}
      <OnboardingModal
        isOpen={showOnboarding}
        onFinish={handleOnboardingDone}
      />

      {previewImage && (
        <PreviewModal
          imageUrl={previewImage}
          onClose={() => setPreviewImage(null)}
        />
      )}
    </div>
  );
}
