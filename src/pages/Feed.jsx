import { useEffect, useState, useRef } from "react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { motion } from "framer-motion";
import CalenderIcon from "../../public/icons/CalenderIcon";
import MapPinIcon from "../../public/icons/MapPinIcon";
import Tilmeld from "../components/Tilmeld";
import { useNavigate } from "react-router";
import Create from "../components/Create";
import GroupsIcon from "../../public/icons/GroupsIcon";
import NotificationWrapper from "../components/NotificationWrapper";
import useTags from "../components/Tags";
import PostCard from "../components/PostCard";
import FunnelIcon from "../../public/icons/FunnelIcon";

export default function Feed() {
  const { tags: allTags } = useTags();
  const [posts, setPosts] = useState([]);
  const navigate = useNavigate();
  const [expandedPostId, setExpandedPostId] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [showFilter, setShowFilter] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [highlightPostId, setHighlightPostId] = useState(null);
  const myPostsRef = useRef(null);

  const userId = auth.currentUser?.uid;

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
    const fetchData = async () => {
      await fetchPosts();
    };
    fetchData();
  }, []);

  const myPosts = posts.filter(
    (post) => post.uid === userId && post.active !== false
  );

  // FUNGERENDE VERSION - Bruger friske data direkte
  const handlePostCreated = async () => {
    console.log(" handlePostCreated started");

    const oldPostIds = new Set(myPosts.map((p) => p.id));
    console.log(" Old post IDs:", Array.from(oldPostIds));

    // Hent friske posts direkte (ikke via state)
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

    console.log(" Fresh posts fetched:", freshPosts.length);

    // Opdater state (til UI)
    setPosts(freshPosts);

    // Find det nye opslag med de FRISKE data (ikke state)
    const newMyPosts = freshPosts.filter(
      (post) => post.uid === userId && post.active !== false
    );
    console.log(" New myPosts count:", newMyPosts.length);
    console.log(
      " New myPosts IDs:",
      newMyPosts.map((p) => p.id)
    );

    const newPost = newMyPosts.find((p) => !oldPostIds.has(p.id));
    console.log("✨ New post:", newPost ? newPost.id : "NONE");

    if (newPost) {
      console.log("🎉 New post found:", newPost.id);

      // 1️ Scroll til toppen FØRST
      myPostsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

      // 2️ Vent på scroll er færdig, SÅ trigger shockwave
      setTimeout(() => {
        console.log(" Triggering shockwave animation");
        setHighlightPostId(newPost.id);

        // 3️ Fjern highlight efter shockwave er færdig
        setTimeout(() => {
          console.log(" Removing highlight");
          setHighlightPostId(null);
        }, 1200); // Match shockwave animation duration
      }, 800); //  Delay så scroll når at blive færdig først
    } else {
      console.log("❌ NO NEW POST FOUND!");
      console.log("Debug - oldPostIds:", Array.from(oldPostIds));
      console.log(
        "Debug - newMyPosts IDs:",
        newMyPosts.map((p) => p.id)
      );
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
            post.tags.some((tag) => selectedTags.includes(tag))
        )
      : [];

  const otherPosts = posts.filter(
    (post) => post.uid !== userId && post.active !== false
  );

  const renderMyPost = (post, index) => (
    <motion.div
      key={post.id}
      initial={{
        opacity: 0,
        y: -20, // Lidt mindre bevægelse
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.5,
        ease: "easeOut",
      }}
      className="mb-4 relative"
    >
      {/*  Shockwave effekt - enkelt bølge der pulserer ud */}
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
        className="flex text-(--secondary) justify-between items-center bg-(--secondary) rounded-full px-4 py-3 transition-all duration-300"
      >
        <h3 className="justify-start text-(--white) text-xl overskrift">
          {post.title}
        </h3>

        <div className="flex justify-between items-center text-sm font-bold bg-(--white) rounded-full px-2 gap-5">
          <div className="gap-2 flex items-center">
            <GroupsIcon color="--secondary" size={20} />
            <p className="text-(--secondary)">{post.participants.length}</p>
          </div>
          <div className="flex items-center gap-2">
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

      <div ref={myPostsRef}>
        {myPosts.length > 0 &&
          myPosts.map((post, index) => renderMyPost(post, index))}
      </div>

      <Create allTags={allTags} onPostCreated={handlePostCreated} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-4 flex flex-col justify-end"
      >
        <div className="flex gap-4 items-center px-4">
          <h3 className="text-(--secondary) font-bold text-lg">Oversigt</h3>{" "}
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
        </div>
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
            Ingen opslag matcher de valgte tags.
          </p>
        )
      ) : (
        otherPosts.map((post) => (
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
        ))
      )}
    </div>
  );
}
