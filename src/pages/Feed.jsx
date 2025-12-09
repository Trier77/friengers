import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { motion } from "framer-motion";
import CalenderIcon from "../../public/icons/CalenderIcon";
import MapPinIcon from "../../public/icons/MapPinIcon";
import Tilmeld from "../components/Tilmeld";
import { useNavigate } from "react-router";

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const navigate = useNavigate();
  const [expandedPosts, setExpandedPosts] = useState({});
  const [selectedTags, setSelectedTags] = useState([]);
  const [showFilter, setShowFilter] = useState(false); // toggle dropdown visibility

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const postsCollection = collection(db, "posts");
        const postsSnapshot = await getDocs(postsCollection);
        const postsList = postsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPosts(postsList);
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };

    fetchPosts();
  }, []);

  const toggleExpand = (id) => {
    setExpandedPosts((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleDropdownChange = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const allTags = Array.from(new Set(posts.flatMap((post) => post.tags)));

  const filteredPosts =
    selectedTags.length > 0
      ? posts.filter((post) =>
          post.tags.some((tag) => selectedTags.includes(tag))
        )
      : posts;

  return (
    <div className="text-2xl p-4">
      {/* Det her filtre funktion hell yeah */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-4 flex flex-col justify-end"
      >
        <div className="flex justify-end">
          <button
            onClick={() => setShowFilter((prev) => !prev)}
            className="px-4 py-2 text-lg text-(--primary) "
          >
            Filter {showFilter ? "▲" : "▼"}
          </button>
        </div>

        {showFilter && (
          <motion.div
            initial={{ opacity: 0, x: 0 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-2 flex flex-wrap gap-2 p-2 justify-end "
          >
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => handleDropdownChange(tag)}
                className={`px-3 py-1 rounded-2xl text-xs font-bold ${
                  selectedTags.includes(tag)
                    ? "bg-(--secondary)  text-(--white)"
                    : "border  text-(--secondary) border-(--secondary)"
                }`}
              >
                {tag}
              </button>
            ))}
          </motion.div>
        )}
      </motion.div>

      {filteredPosts.length === 0 ? (
        <p>
          {selectedTags.length > 0 ? ` for "${selectedTags.join(", ")}"` : ""}.
        </p>
      ) : (
        filteredPosts.map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                duration: 0.6,
                delay: 0.3 + index * 0.15,
                ease: "easeInOut",
              }}
              className="mb-4 p-4 bg-(--primary) rounded-2xl gap-2 flex flex-col relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <h2 className="justify-start text-(--secondary) text-xl overskrift">
                  {post.title}
                </h2>
                <div className="bg-(--white) rounded-2xl px-2 flex gap-4 font-bold text-sm text-(--secondary)">
                  <div className="flex items-center gap-1">
                    <MapPinIcon /> <p>{post.location}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <CalenderIcon />
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
                      className={`border border-(--secondary) py-1  rounded-2xl px-3 cursor-pointer ${
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

              <div className="flex justify-between relative">
                <div className="w-60 flex flex-col justify-between gap-2">
                  <p
                    className={`text-(--white) text-sm cursor-pointer overflow-hidden ${
                      expandedPosts[post.id] ? "" : "line-clamp-3"
                    }`}
                    onClick={() => toggleExpand(post.id)}
                  >
                    {post.description}
                  </p>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <img
                        src={
                          "https://media.istockphoto.com/id/2151669184/vector/vector-flat-illustration-in-grayscale-avatar-user-profile-person-icon-gender-neutral.jpg?s=612x612&w=0&k=20&c=UEa7oHoOL30ynvmJzSCIPrwwopJdfqzBs0q69ezQoM8="
                        }
                        alt={"Afsender"}
                        className="w-10 h-10 rounded-full object-cover cursor-pointer"
                        onClick={() =>
                          navigate(`/AndresProfil/${post.senderId}`)
                        }
                      />
                      <p className="text-(--secondary) text-sm">{"Afsender"}</p>
                    </div>
                    <p className="text-(--secondary) text-sm">
                      {post.participants}
                    </p>
                  </div>
                </div>
              </div>
              <Tilmeld className="absolute bottom-0 right-0 z-10" />
            </motion.div>
          </motion.div>
        ))
      )}
    </div>
  );
}
