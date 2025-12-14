import { useParams, useNavigate } from "react-router";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import {
  collection,
  query,
  onSnapshot,
  addDoc,
  orderBy,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { db, auth } from "../firebase";
import { useTranslation } from "react-i18next";

function GroupChat() {
  const {t} = useTranslation();
  const { chatId } = useParams();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [chatInfo, setChatInfo] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentUserId = auth.currentUser?.uid;

  // Hent chat info og deltagere
  useEffect(() => {
    const fetchChatInfo = async () => {
      try {
        const chatDoc = await getDoc(doc(db, "chats", chatId));
        if (chatDoc.exists()) {
          const chatData = chatDoc.data();
          setChatInfo(chatData);

          // Hent deltagernes info
          const participantPromises = chatData.participants.map(async (uid) => {
            const userDoc = await getDoc(doc(db, "users", uid));
            return {
              uid,
              ...userDoc.data(),
            };
          });

          const participantData = await Promise.all(participantPromises);
          setParticipants(participantData);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching chat info:", error);
        setLoading(false);
      }
    };

    fetchChatInfo();
  }, [chatId]);

  // Markér chat som læst
  useEffect(() => {
    const markAsRead = async () => {
      if (!currentUserId || !chatId) return;

      const chatDocRef = doc(db, "chats", chatId);

      try {
        await setDoc(
          chatDocRef,
          {
            [`lastReadBy_${currentUserId}`]: serverTimestamp(),
          },
          { merge: true }
        );
        console.log("✅ Gruppechat marked as read");
      } catch (error) {
        console.error("Error marking chat as read:", error);
      }
    };

    markAsRead();
  }, [currentUserId, chatId]);

  // Lyt til beskeder
  useEffect(() => {
    if (!chatId) return;

    console.log("👂 Listening to group chat:", chatId);

    const messagesQuery = query(
      collection(db, "chats", chatId, "messages"),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log("📨 Group messages received:", msgs.length);
      setMessages(msgs);
    });

    return unsubscribe;
  }, [chatId]);

  // Initial scroll
  useEffect(() => {
    if (!loading && messages.length > 0) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "instant" });
        console.log("📜 Initial scroll to bottom");
      }, 100);
    }
  }, [loading]);

  // Auto scroll ved nye beskeder
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 50);
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (newMessage.trim() === "" || !currentUserId) return;

    try {
      console.log("📤 Sending message to group chat:", chatId);

      const chatDocRef = doc(db, "chats", chatId);
      await setDoc(
        chatDocRef,
        {
          lastMessage: newMessage,
          lastMessageTime: serverTimestamp(),
          lastMessageSenderId: currentUserId,
          [`lastReadBy_${currentUserId}`]: serverTimestamp(),
        },
        { merge: true }
      );

      await addDoc(collection(db, "chats", chatId, "messages"), {
        text: newMessage,
        senderId: currentUserId,
        timestamp: serverTimestamp(),
      });

      console.log("✅ Group message sent successfully!");
      setNewMessage("");
    } catch (error) {
      console.error("❌ Error sending message:", error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const getSenderName = (senderId) => {
    const participant = participants.find((p) => p.uid === senderId);
    return participant
      ? participant.kaldenavn || participant.fuldenavn
      : "Ukendt";
  };

  const getSenderAvatar = (senderId) => {
    const participant = participants.find((p) => p.uid === senderId);
    return participant?.profileImage || "https://via.placeholder.com/32";
  };
//LOADING ANIMATION SKAL DEN VÆRE HER?
  if (loading) {
    return (
      <div className="p-4 text-center pointer-events-none select-none">
        Henter gruppechat...
      </div>
    );
  }

  if (!chatInfo) {
    return (
      <div className="p-4 text-center pointer-events-none select-none">
        {t("no-chat")}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 flex flex-col bg-white"
    >
      {/* Header */}
      <div className="bg-white p-4 flex items-center gap-4 shadow-sm z-10 flex-shrink-0">
        <button onClick={() => navigate(-1)} className="p-2">
          <svg
            className="w-6 h-6 text-blue-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
          <svg
            className="w-6 h-6 text-white"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
          </svg>
        </div>
        <div className="flex-1">
          <h2 className="font-semibold text-lg text-gray-800">
            {chatInfo.chatName}
          </h2>
          <p className="text-xs text-gray-500">
            {participants.length} {t("participants")}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 mt-8">
            <p>{t("no-message")}</p>
            <p className="text-sm">{t("first-message")} 💬</p>
          </div>
        )}
        {messages.map((message) => {
          const isOwnMessage = message.senderId === currentUserId;
          return (
            <div
              key={message.id}
              className={`flex ${
                isOwnMessage ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`flex items-end gap-2 max-w-[70%] ${
                  isOwnMessage ? "flex-row-reverse" : "flex-row"
                }`}
              >
                {/* Avatar - kun vis for andre */}
                {!isOwnMessage && (
                  <img
                    src={getSenderAvatar(message.senderId)}
                    alt={getSenderName(message.senderId)}
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() =>
                      navigate(`/AndresProfil/${message.senderId}`)
                    }
                  />
                )}

                <div>
                  {/* Afsenders navn - kun vis for andre */}
                  {!isOwnMessage && (
                    <p className="text-xs text-gray-500 mb-1 ml-1">
                      {getSenderName(message.senderId)}
                    </p>
                  )}

                  {/* Besked */}
                  <div
                    className={`p-3 rounded-2xl break-words ${
                      isOwnMessage
                        ? "bg-blue-500 text-white rounded-br-sm"
                        : "bg-gray-200 text-gray-800 rounded-bl-sm"
                    }`}
                  >
                    <p className="break-words whitespace-pre-wrap">
                      {message.text}
                    </p>
                    {message.timestamp && (
                      <span
                        className={`text-xs mt-1 block ${
                          isOwnMessage ? "text-blue-100" : "text-gray-400"
                        }`}
                      >
                        {message.timestamp
                          ?.toDate()
                          .toLocaleTimeString("da-DK", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Field */}
      <div
        className={`bg-white p-4 border-t border-gray-200 flex-shrink-0 ${
          isInputFocused ? "mb-0" : "mb-20"
        }`}
      >
        <div className="flex gap-2 items-center">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Skriv en besked..."
            onFocus={() => {
              setIsInputFocused(true);
              const nav = document.querySelector("nav");
              if (nav) nav.style.display = "none";
              messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
            }}
            onBlur={() => {
              setTimeout(() => {
                setIsInputFocused(false);
                const nav = document.querySelector("nav");
                if (nav) nav.style.display = "flex";
              }, 100);
            }}
            className="flex-1 px-4 py-3 rounded-full border-2 border-gray-200 focus:outline-none focus:border-blue-400"
          />
          <button
            onClick={handleSendMessage}
            className="bg-blue-500 text-white p-3 rounded-full hover:bg-blue-600 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default GroupChat;
