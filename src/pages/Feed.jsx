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

export default function Feed() {
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

  const allTags = Array.from(new Set(posts.flatMap((post) => post.tags)));

  const myPosts = posts.filter((post) => post.uid === userId);

  const filteredPosts =
    selectedTags.length > 0
      ? posts.filter(
          (post) =>
            post.uid !== userId &&
            post.tags.some((tag) => selectedTags.includes(tag))
        )
      : [];

  const otherPosts = posts.filter(
    (post) => post.uid !== userId && !filteredPosts.includes(post)
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

  // Og det her så hvordan de andres skal se ud
  const renderPost = (post, index) => (
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
                onClick={() => handleDropdownChange(tag)}
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

        <motion.div
          className="absolute bottom-0 right-0 z-10 rounded-tl-full overflow-hidden"
          style={{
            pointerEvents: expandedPostId === post.id ? "auto" : "none",
            originX: 1, // højre
            originY: 1, // bund
          }}
          animate={{
            scale:
              expandedPostId === null
                ? 1
                : expandedPostId === post.id
                ? 1
                : 0.5,
          }}
          transition={{ duration: 0.3 }}
        >
          <Tilmeld
            postId={post.id}
            participants={post.participants}
            requests={post.requests || []}
            onUpdate={fetchPosts}
          />
        </motion.div>

        {post.uid === userId && <RequestsList post={post} />}
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

      {filteredPosts.length > 0 && (
        <div>
          <h2 className="text-lg font-bold mb-2">Filter</h2>
          {filteredPosts.map((post, index) => renderPost(post, index))}
        </div>
      )}

      {otherPosts.map((post, index) => renderPost(post, index))}

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
    </div>
  );
}
