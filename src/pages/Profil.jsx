import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { NavLink } from "react-router";
import Settings from "./Settings";
import { motion } from "framer-motion";
import OwnPost from "../components/Post";

export default function Profil() {
  const [userData, setUserData] = useState(null);
  const [activeTab, setActiveTab] = useState("active"); // 'privat chat' eller 'gruppe chat'

  useEffect(() => {
    const fetchProfile = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const docRef = doc(db, "users", user.uid);
      const snap = await getDoc(docRef);

      if (snap.exists()) {
        setUserData(snap.data());
      }
    };

    fetchProfile();
  }, []);

  if (!userData) return <p>Henter profil...</p>;

  const accountBio = {
    bio: "Born and raised i Aarhus og læser biologi. Elsker fitness og programmering i min fritid. Altid villig til at give en hånd.",

    tasksCompleted: 14,
    memberSince: "12/09-2022",
    activePosts: [
      {
        id: 1,
        title: "Skab flyttes - hvem kan?",
        tags: ["Praktisk", "Flytning"],
        description:
          "Hej! Jeg sidder og mangler en ekstra hånd til at flytte et skab fra min lejlighed på Christian X's vej ned til...",
        participants: "0/2",
        date: "9. Maj",
        time: "Kl. 14:00",
      },
    ],
  };

  // const opgaver = activeTab === "private" ? privateChats : groupChats;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen  pb-20"
    >
      <div>
        {/*       
      <h1>Din Profil</h1>
      <div className="w-20 h-20 rounded-full">
        <img className="w-full h-full rounded-full object-cover"
        src={userData.profileImage}
        alt="Profilbillede"    
        
      />
      </div>
      
      <div>
      <h3>{userData.fuldenavn}</h3>
      <h3>{userData.study}</h3>
      <h3>{userData.pronouns}</h3>
      </div>
      
      {/* <p><strong>Oprettet:</strong> {new Date(userData.createdAt.seconds * 1000).toLocaleDateString()}</p>*/}
      </div>

      {/* Header Section */}
      <div className=" pt-8 pb-6 px-6 relative">
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
          </div>
          <div className="absolute right-5 top-5">
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

        {/* Bio */}
        <p className="text-gray-700 text-sm mb-4">{accountBio.bio}</p>
      </div>

      {/* <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-white pt-6 pb-4 px-6"
      > */}

      {/* Tab Buttons */}
      <div className="flex gap-3 mt-6 ml-2 mr-2">
        <button
          onClick={() => setActiveTab("active")}
          className={`flex-1 py-1 px-2 rounded-full font-semibold transition-colors ${
            activeTab === "active"
              ? "bg-blue-500 text-white"
              : "bg-white text-blue-500 border-2 border-blue-500"
          }`}
        >
          Aktive Opgaver
        </button>
        <button
          onClick={() => setActiveTab("solved")}
          className={`flex-1 py-1 px-2 rounded-full font-semibold transition-colors ${
            activeTab === "solved"
              ? "bg-blue-500 text-white"
              : "bg-white text-blue-500 border-2 border-blue-500"
          }`}
        >
          Løste Opgaver
        </button>
      </div>
      {/* </motion.div> */}

      {/* Active Posts Section */}
      <div className="px-6 mt-6">
        <h2 className="text-center font-bold text-gray-900 mb-4">
          Aktive opgaver
        </h2>

        <OwnPost user={accountBio} className="mt-4" />


        {accountBio.activePosts.length === 0 ? (
          <p className="text-center text-gray-500">Ingen aktive opgaver</p>
        ) : (
          accountBio.activePosts.map((post) => (
            <div
              key={post.id}
              className="bg-blue-900 rounded-3xl p-4 mb-4 text-white"
            >
              {/* Post Header */}
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-bold flex-1">{post.title}</h3>
                <div className="flex gap-2 text-xs">
                  <span className="bg-white text-blue-900 px-3 py-1 rounded-full font-semibold">
                    {post.date}
                  </span>
                  <span className="bg-white text-blue-900 px-3 py-1 rounded-full font-semibold">
                    {post.time}
                  </span>
                </div>
              </div>

              {/* Tags */}
              <div className="flex gap-2 mb-3">
                {post.tags.map((tag, index) => (
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
                    alt={userData.kaldenavn}
                    className="w-6 h-6 rounded-full"
                  />
                  <span className="text-sm">{accountBio.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                  <span className="text-sm">{post.participants}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Member Since */}
      <div className="text-center mt-8 mb-4">
        <p className="text-gray-400 text-sm">Oprettet</p>
        <p className="text-gray-500 text-sm">{accountBio.memberSince}</p>
      </div>
    </motion.div>
  );
}
