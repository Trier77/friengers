import { useState } from "react";
import UnreadBadge from "../components/UnreadBadge";
import { motion } from "framer-motion";
import { useNavigate } from "react-router";

function Chats() {
  const [activeTab, setActiveTab] = useState("private"); // 'privat chat' eller 'gruppe chat'
  const navigate = useNavigate();

  // Dette er bare noget dummy data, indtil at vi når til det
  const privateChats = [
    {
      id: 1,
      name: "Emma Sørensen",
      message: "Hvis det passer?",
      time: "9:33",
      avatar:
        "https://img.freepik.com/free-photo/fair-haired-woman-looking-with-pleased-calm-expression_176420-15145.jpg?semt=ais_hybrid&w=740&q=80",
      unread: 2,
      online: true,
    },
    {
      id: 2,
      name: "Jesper Madsen",
      message: "Tak for hjælpen, endnu en gang!",
      time: "Tir.",
      avatar:
        "https://media.istockphoto.com/id/1200677760/photo/portrait-of-handsome-smiling-young-man-with-crossed-arms.jpg?s=612x612&w=0&k=20&c=g_ZmKDpK9VEEzWw4vJ6O577ENGLTOcrvYeiLxi8mVuo=",
      unread: 0,
      online: true,
    },
    {
      id: 3,
      name: "Jens Andersen",
      message: "Dig: Super, så ses vi der!",
      time: "27/11",
      avatar:
        "https://t3.ftcdn.net/jpg/00/77/71/12/360_F_77711294_BA5QTjtgGPmLKCXGdtbAgZciL4kEwCnx.jpg",
      unread: 0,
      online: true,
    },
  ];

  const groupChats = []; // Her skal vi tilføje gruppechat-data senere

  const currentChats = activeTab === "private" ? privateChats : groupChats;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gray-100 pb-20"
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-white pt-6 pb-4 px-6"
      >
        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search"
            className="w-full px-6 py-3 rounded-full border-2 border-blue-200 focus:outline-none focus:border-blue-400 text-gray-600"
          />
          <svg
            className="absolute right-6 top-1/2 -translate-y-1/2 w-6 h-6 text-blue-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* Tab Buttons */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={() => setActiveTab("private")}
            className={`flex-1 py-2 px-6 rounded-full font-semibold transition-colors ${
              activeTab === "private"
                ? "bg-blue-500 text-white"
                : "bg-white text-blue-500 border-2 border-blue-500"
            }`}
          >
            Privat chat
          </button>
          <button
            onClick={() => setActiveTab("group")}
            className={`flex-1 py-2 px-6 rounded-full font-semibold transition-colors ${
              activeTab === "group"
                ? "bg-blue-500 text-white"
                : "bg-white text-blue-500 border-2 border-blue-500"
            }`}
          >
            Gruppe chat
          </button>
        </div>
      </motion.div>

      {/* Indbakke Liste */}
      <div className="px-4 mt-4">
        {currentChats.map((chat, index) => (
          <motion.div
            key={chat.id}
            onClick={() => navigate(`/Chats/${chat.id}`)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              duration: 0.6,
              delay: 0.3 + index * 0.15,
              ease: "easeInOut",
            }}
            className={`relative flex items-center border-1 border-[var(--secondary)] gap-4 mb-3 rounded-tl-4xl rounded-bl-4xl rounded-tr-2xl rounded-br-2xl cursor-pointer transition-all active:brightness-80 ${
              chat.id === 1
                ? "bg-blue-400 text-white"
                : "bg-white text-gray-800 hover:bg-gray-50"
            }`}
          >
            {/* Avatar med Online Status */}
            <div className="relative flex-shrink-0">
              <img
                src={chat.avatar}
                alt={chat.name}
                className="w-14 h-14 rounded-full object-cover"
              />
              {chat.online && (
                <div
                  className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 ${
                    chat.id === 1
                      ? "bg-blue-300 border-blue-400"
                      : "bg-green-400 border-white"
                  }`}
                ></div>
              )}
            </div>

            {/* Chat Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg">{chat.name}</h3>
              <p
                className={`text-sm truncate ${
                  chat.id === 1 ? "text-white/90" : "text-gray-500"
                }`}
              >
                {chat.message}
              </p>
            </div>

            {/* Tid og Unread Badge */}
            <div className="flex flex-col items-end gap-1">
              <span
                className={`text-sm mr-2 ${
                  chat.id === 1 ? "text-white" : "text-gray-500"
                }`}
              >
                {chat.time}
              </span>
              {chat.unread > 0 && <UnreadBadge count={chat.unread} />}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

export default Chats;
