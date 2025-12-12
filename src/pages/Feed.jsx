import { useEffect, useState } from "react";
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

export default function Feed() {
  const { tags: allTags } = useTags();
  const [posts, setPosts] = useState([]);
  const navigate = useNavigate();
  const [expandedPostId, setExpandedPostId] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [showFilter, setShowFilter] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

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

  const myPosts = posts.filter(
    (post) => post.uid === userId && post.active !== false
  );

  // Det her er hvordan vores egne post skal se ud
  const renderMyPost = (post, index) => (
    <motion.div
      key={post.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-4"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: 0.6,
          delay: 0.3 + index * 0.15,
          ease: "easeInOut",
        }}
        className="flex text-(--secondary) justify-between items-center bg-(--secondary) rounded-full px-4 py-3"
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

  // Og her er så den samlet return
  return (
    <div className="p-4">
      <NotificationWrapper />
      {myPosts.length > 0 &&
        myPosts.map((post, index) => renderMyPost(post, index))}

      <Create allTags={allTags} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-4 flex flex-col justify-end"
      >
        <div className="flex justify-end">
          <button
            onClick={() => setShowFilter((prev) => !prev)}
            className="px-4 pt-2 text-lg text-(--primary)"
          >
            Filter {showFilter ? "▲" : "▼"}
          </button>
        </div>

        {showFilter && (
          <motion.div
            initial={{ opacity: 0, x: 0 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.1 }}
            className="flex flex-wrap gap-2 justify-end"
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
            <h2 className="text-lg font-bold mb-2">Filter</h2>
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
