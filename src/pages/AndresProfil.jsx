import { useParams, useNavigate } from "react-router";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../firebase";

function AndresProfil() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);

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

        // Hent brugerens posts
        const postsQuery = query(
          collection(db, "posts"),
          where("uid", "==", userId)
        );
        const postsSnapshot = await getDocs(postsQuery);
        const posts = postsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setUserPosts(posts);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user:", error);
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  if (loading) {
    return <div className="p-4 text-center">Henter profil...</div>;
  }

  if (!userData) {
    return <div className="p-4 text-center">Bruger ikke fundet</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-white pb-20"
    >
      {/* Header Section */}
      <div className="bg-white pt-8 pb-6 px-6 relative">
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
            <div className="w-20 h-20 rounded-full border-4 border-blue-500 p-1">
              <img
                src={userData.profileImage || "https://via.placeholder.com/80"}
                alt={userData.fuldenavn}
                className="w-full h-full rounded-full object-cover"
              />
            </div>
            {/* Online status dot */}
            <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
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

        {/* Message Button */}
        <button
          onClick={() => navigate(`/Chats/${userId}`)}
          className="p-3 bg-blue-500 rounded-full hover:bg-blue-600 transition-colors"
        >
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </button>

        {/* Bio - kan tilføjes til Firebase senere */}
        <p className="text-gray-700 text-sm mb-4">
          {userData.bio || "Ingen beskrivelse tilgængelig"}
        </p>

        {/* Tasks Completed - dummy for nu */}
        <div className="text-center">
          <p className="text-sm text-gray-600 font-semibold mb-2">
            Opgaver løst
          </p>
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-500 rounded-full">
            <span className="text-white font-bold text-lg">
              {userPosts.length}
            </span>
          </div>
        </div>
      </div>

      {/* Active Posts Section */}
      <div className="px-6 mt-6">
        <h2 className="text-center font-bold text-gray-900 mb-4">
          Aktive opgaver
        </h2>

        {userPosts.length === 0 ? (
          <p className="text-center text-gray-500">Ingen aktive opgaver</p>
        ) : (
          userPosts.map((post) => (
            <div
              key={post.id}
              className="bg-blue-900 rounded-3xl p-4 mb-4 text-white"
            >
              {/* Post Header */}
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-bold flex-1">{post.title}</h3>
                <div className="flex gap-2 text-xs">
                  <span className="bg-white text-blue-900 px-3 py-1 rounded-full font-semibold">
                    {post.time?.toDate().toLocaleDateString("da-DK", {
                      day: "2-digit",
                      month: "short",
                    })}
                  </span>
                </div>
              </div>

              {/* Tags */}
              <div className="flex gap-2 mb-3">
                {post.tags?.map((tag, index) => (
                  <span
                    key={index}
                    className="text-xs border border-white px-3 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Description */}
              <p className="text-sm mb-4">{post.description}</p>

              {/* Footer */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <img
                    src={userData.profileImage}
                    alt={userData.fuldenavn}
                    className="w-6 h-6 rounded-full"
                  />
                  <span className="text-sm">
                    {userData.kaldenavn || userData.fuldenavn}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                  <span className="text-sm">{post.participants || "0/0"}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Member Since - kan tilføjes til Firebase senere */}
      <div className="text-center mt-8 mb-4">
        <p className="text-gray-400 text-sm">Oprettet</p>
        <p className="text-gray-500 text-sm">
          {userData.createdAt
            ? new Date(userData.createdAt.seconds * 1000).toLocaleDateString(
                "da-DK"
              )
            : "Ukendt"}
        </p>
      </div>
    </motion.div>
  );
}

export default AndresProfil;
