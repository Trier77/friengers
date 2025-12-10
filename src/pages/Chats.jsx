import { useState, useEffect } from "react";
import UnreadBadge from "../components/UnreadBadge";
import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import {
  collection,
  query,
  getDocs,
  doc,
  getDoc,
  orderBy,
  limit,
} from "firebase/firestore";
import { db, auth } from "../firebase";

function Chats() {
  const [activeTab, setActiveTab] = useState("private");
  const [privateChats, setPrivateChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState(null);
  const navigate = useNavigate();
  const currentUserId = auth.currentUser?.uid;

  useEffect(() => {
    const fetchChats = async () => {
      if (!currentUserId) return;

      try {
        console.log("🔍 Current User ID:", currentUserId);

        // Hent alle chats
        const chatsSnapshot = await getDocs(collection(db, "chats"));
        console.log("📦 Total chats in database:", chatsSnapshot.docs.length);

        const allChatIds = chatsSnapshot.docs.map((doc) => doc.id);
        console.log("💬 All chat IDs:", allChatIds);

        setDebugInfo({
          totalChats: chatsSnapshot.docs.length,
          allChatIds: allChatIds,
          currentUserId: currentUserId,
        });

        const chatList = [];

        for (const chatDoc of chatsSnapshot.docs) {
          const chatId = chatDoc.id;
          console.log("🔎 Checking chat:", chatId);

          // Tjek om den nuværende bruger er en del af denne chat
          if (!chatId.includes(currentUserId)) {
            console.log("❌ User not in this chat");
            continue;
          }

          console.log("✅ User IS in this chat!");

          // Find den anden brugers ID
          const userIds = chatId.split("_");
          console.log("👥 User IDs in chat:", userIds);

          const otherUserId = userIds.find((id) => id !== currentUserId);
          console.log("👤 Other user ID:", otherUserId);

          if (!otherUserId) continue;

          // Hent den anden brugers data
          const otherUserDoc = await getDoc(doc(db, "users", otherUserId));
          if (!otherUserDoc.exists()) {
            console.log("⚠️ Other user not found in database");
            continue;
          }

          const otherUserData = otherUserDoc.data();
          console.log("👤 Other user data:", otherUserData);

          // Hent den sidste besked fra denne chat
          const messagesQuery = query(
            collection(db, "chats", chatId, "messages"),
            orderBy("timestamp", "desc"),
            limit(1)
          );
          const messagesSnapshot = await getDocs(messagesQuery);
          console.log("💌 Messages found:", messagesSnapshot.docs.length);

          let lastMessage = "Ingen beskeder endnu";
          let lastMessageTime = null;
          let unreadCount = 0;

          if (!messagesSnapshot.empty) {
            const lastMsg = messagesSnapshot.docs[0].data();
            console.log("📝 Last message:", lastMsg);
            lastMessage = lastMsg.text;
            lastMessageTime = lastMsg.timestamp;

            if (lastMsg.senderId !== currentUserId) {
              unreadCount = 1;
            }

            if (lastMsg.senderId === currentUserId) {
              lastMessage = `Dig: ${lastMessage}`;
            }
          }

          // Formatér tid
          let timeDisplay = "";
          if (lastMessageTime) {
            const messageDate = lastMessageTime.toDate();
            const now = new Date();
            const diffInDays = Math.floor(
              (now - messageDate) / (1000 * 60 * 60 * 24)
            );

            if (diffInDays === 0) {
              timeDisplay = messageDate.toLocaleTimeString("da-DK", {
                hour: "2-digit",
                minute: "2-digit",
              });
            } else if (diffInDays === 1) {
              timeDisplay = "I går";
            } else if (diffInDays < 7) {
              timeDisplay = messageDate.toLocaleDateString("da-DK", {
                weekday: "short",
              });
            } else {
              timeDisplay = messageDate.toLocaleDateString("da-DK", {
                day: "2-digit",
                month: "2-digit",
              });
            }
          }

          chatList.push({
            id: otherUserId,
            name: otherUserData.kaldenavn || otherUserData.fuldenavn,
            message: lastMessage,
            time: timeDisplay || "",
            avatar: otherUserData.profileImage,
            unread: unreadCount,
            online: true,
            timestamp: lastMessageTime,
          });
        }

        console.log("✅ Final chat list:", chatList);

        // Sortér chats efter tidsstempel (nyeste først)
        chatList.sort((a, b) => {
          if (!a.timestamp) return 1;
          if (!b.timestamp) return -1;
          return b.timestamp.toDate() - a.timestamp.toDate();
        });

        setPrivateChats(chatList);
        setLoading(false);
      } catch (error) {
        console.error("❌ Error fetching chats:", error);
        setLoading(false);
      }
    };

    fetchChats();
  }, [currentUserId]);

  const groupChats = [];
  const currentChats = activeTab === "private" ? privateChats : groupChats;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">Henter chats...</p>
      </div>
    );
  }

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

      {/* Debug Info */}
      {debugInfo && (
        <div className="px-4 mt-4 mb-4 bg-yellow-100 p-4 rounded text-xs">
          <p>
            <strong>Debug Info:</strong>
          </p>
          <p>Total chats: {debugInfo.totalChats}</p>
          <p>Your ID: {debugInfo.currentUserId}</p>
          <p>Chat IDs: {debugInfo.allChatIds.join(", ") || "None"}</p>
          <p>Chats shown: {currentChats.length}</p>
        </div>
      )}

      {/* Chat Liste */}
      <div className="px-4 mt-4">
        {currentChats.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <p>Ingen chats endnu</p>
            <p className="text-sm mt-2">
              Start en samtale ved at besøge en profil
            </p>
          </div>
        ) : (
          currentChats.map((chat, index) => (
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
                index === 0 && chat.unread > 0
                  ? "bg-blue-400 text-white"
                  : "bg-white text-gray-800 hover:bg-gray-50"
              }`}
            >
              {/* Avatar med Online Status */}
              <div className="relative flex-shrink-0">
                <img
                  src={chat.avatar || "https://via.placeholder.com/56"}
                  alt={chat.name}
                  className="w-14 h-14 rounded-full object-cover"
                />
                {chat.online && (
                  <div
                    className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 ${
                      index === 0 && chat.unread > 0
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
                    index === 0 && chat.unread > 0
                      ? "text-white/90"
                      : "text-gray-500"
                  }`}
                >
                  {chat.message}
                </p>
              </div>

              {/* Tid og Unread Badge */}
              <div className="flex flex-col items-end gap-1">
                <span
                  className={`text-sm mr-2 ${
                    index === 0 && chat.unread > 0
                      ? "text-white"
                      : "text-gray-500"
                  }`}
                >
                  {chat.time}
                </span>
                {chat.unread > 0 && <UnreadBadge count={chat.unread} />}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
}

export default Chats;
