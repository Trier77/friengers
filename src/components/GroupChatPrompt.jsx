import { useState } from "react";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../firebase";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";

export default function GroupChatPrompt({ postId, postTitle, onClose }) {
  const {t} = useTranslation();
  const [isCreating, setIsCreating] = useState(false);

  console.log("🔵 GroupChatPrompt rendered:", { postId, postTitle });

  const handleCreateGroupChat = async () => {
    console.log("🟢 handleCreateGroupChat called");
    setIsCreating(true);
    const currentUserId = auth.currentUser?.uid;

    if (!currentUserId) {
      console.error("❌ User not logged in");
      setIsCreating(false);
      return;
    }

    console.log("👤 Current user:", currentUserId);

    try {
      const groupChatId = `group_${postId}`;
      const groupChatRef = doc(db, "chats", groupChatId);

      console.log("📝 Creating group chat:", groupChatId);

      await setDoc(groupChatRef, {
        postId: postId,
        chatName: postTitle, // ← Bare titlen, ingen præfix
        participants: [currentUserId],
        createdAt: serverTimestamp(),
        createdBy: currentUserId,
        isGroupChat: true,
        lastMessage: "Gruppechat oprettet",
        lastMessageTime: serverTimestamp(),
        lastMessageSenderId: currentUserId,
      });

      console.log("✅ Gruppechat oprettet:", groupChatId);
      onClose(true); // true = gruppechat blev oprettet
    } catch (error) {
      console.error("❌ Fejl ved oprettelse af gruppechat:", error);
      alert("Der opstod en fejl. Prøv igen.");
      setIsCreating(false);
      onClose(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-501 flex items-center justify-center p-4"
        onClick={() => !isCreating && onClose(false)}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl p-6 max-w-sm w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {t("group?")}
          </h2>
          <p className="text-gray-600 mb-6">
            {t("group-for?")}{" "}
            <span className="font-semibold text-blue-600">{postTitle}</span>?
          </p>

          <div className="flex gap-3">
            <button
              onClick={() => onClose(false)}
              disabled={isCreating}
              className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-full hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {t("no-thx")}
            </button>
            <button
              onClick={handleCreateGroupChat}
              disabled={isCreating}
              className="flex-1 px-4 py-3 bg-blue-500 text-white font-semibold rounded-full hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {isCreating ? "Opretter..." : "Ja, opret"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
