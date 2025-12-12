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

function IndividualChat() {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [otherUser, setOtherUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const currentUserId = auth.currentUser?.uid;

  // Hent den anden brugers info
  useEffect(() => {
    const fetchOtherUser = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", chatId));
        if (userDoc.exists()) {
          setOtherUser(userDoc.data());
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user:", error);
        setLoading(false);
      }
    };

    fetchOtherUser();
  }, [chatId]);

  // Markér chat som læst når du åbner den
  useEffect(() => {
    const markAsRead = async () => {
      if (!currentUserId || !chatId) return;

      const chatDocId = [currentUserId, chatId].sort().join("_");
      const chatDocRef = doc(db, "chats", chatDocId);

      try {
        await setDoc(
          chatDocRef,
          {
            participants: [currentUserId, chatId],
            [`lastReadBy_${currentUserId}`]: serverTimestamp(),
          },
          { merge: true }
        );
        console.log("✅ Chat marked as read");
      } catch (error) {
        console.error("Error marking chat as read:", error);
      }
    };

    markAsRead();
  }, [currentUserId, chatId]);

  // Lyt til beskeder i real-time
  useEffect(() => {
    if (!currentUserId || !chatId) return;

    const chatDocId = [currentUserId, chatId].sort().join("_");
    console.log("👂 Listening to chat:", chatDocId);

    const messagesQuery = query(
      collection(db, "chats", chatDocId, "messages"),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log("📨 Messages received:", msgs.length);
      setMessages(msgs);
    });

    return unsubscribe;
  }, [currentUserId, chatId]);

  // ✅ Initial scroll når chatten åbnes (instant)
  useEffect(() => {
    if (!loading && messages.length > 0) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "instant" });
        console.log("📜 Initial scroll to bottom");
      }, 100);
    }
  }, [loading]);

  // ✅ Auto scroll når nye beskeder kommer (smooth)
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
      const chatDocId = [currentUserId, chatId].sort().join("_");
      console.log("📤 Sending message to chat:", chatDocId);

      const chatDocRef = doc(db, "chats", chatDocId);
      await setDoc(
        chatDocRef,
        {
          participants: [currentUserId, chatId],
          createdAt: serverTimestamp(),
          lastMessage: newMessage,
          lastMessageTime: serverTimestamp(),
          lastMessageSenderId: currentUserId,
          [`lastReadBy_${currentUserId}`]: serverTimestamp(),
        },
        { merge: true }
      );

      console.log("✅ Chat document created/updated");

      await addDoc(collection(db, "chats", chatDocId, "messages"), {
        text: newMessage,
        senderId: currentUserId,
        timestamp: serverTimestamp(),
      });

      console.log("✅ Message sent successfully!");
      setNewMessage("");
    } catch (error) {
      console.error("❌ Error sending message:", error);
      console.error("Error details:", error.code, error.message);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  if (loading) {
    return <div className="p-4 text-center">Henter chat...</div>;
  }

  if (!otherUser) {
    return <div className="p-4 text-center">Bruger ikke fundet</div>;
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
        <img
          src={otherUser.profileImage}
          alt={otherUser.fuldenavn}
          className="w-10 h-10 rounded-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => navigate(`/AndresProfil/${chatId}`)}
        />
        <h2
          className="font-semibold text-lg text-gray-800 cursor-pointer hover:underline"
          onClick={() => navigate(`/AndresProfil/${chatId}`)}
        >
          {otherUser.kaldenavn || otherUser.fuldenavn}
        </h2>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 mt-8">
            <p>Ingen beskeder endnu</p>
            <p className="text-sm">Send den første besked! 💬</p>
          </div>
        )}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.senderId === currentUserId
                ? "justify-end"
                : "justify-start"
            }`}
          >
            <div
              className={`max-w-[70%] p-3 rounded-2xl break-words ${
                message.senderId === currentUserId
                  ? "bg-blue-500 text-white rounded-br-sm"
                  : "bg-gray-200 text-gray-800 rounded-bl-sm"
              }`}
            >
              <p className="break-words whitespace-pre-wrap">{message.text}</p>
              {message.timestamp && (
                <span
                  className={`text-xs mt-1 block ${
                    message.senderId === currentUserId
                      ? "text-blue-100"
                      : "text-gray-400"
                  }`}
                >
                  {message.timestamp?.toDate().toLocaleTimeString("da-DK", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              )}
            </div>
          </div>
        ))}
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

export default IndividualChat;
