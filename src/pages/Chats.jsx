import { useState, useEffect } from "react";
import UnreadBadge from "../components/UnreadBadge";
import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import {
  collection,
  query,
  onSnapshot,
  doc,
  getDoc,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore";
import { db, auth } from "../firebase";
import { isUserOnline } from "../hooks/Useonlinestatus";
import ColorCircle from "../components/ColorCircle";
import { useTranslation } from "react-i18next";

function Chats() {
  const {t} = useTranslation();
  const [activeTab, setActiveTab] = useState("private");
  const [privateChats, setPrivateChats] = useState([]);
  const [groupChats, setGroupChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const currentUserId = auth.currentUser?.uid;

  useEffect(() => {
    if (!currentUserId) return;

    console.log("🔄 Current User ID:", currentUserId);

    // Lyt til ALLE chats i real-time
    const chatsQuery = query(collection(db, "chats"));

    const unsubscribe = onSnapshot(
      chatsQuery,
      async (snapshot) => {
        console.log("📡 Chats updated! Total chats:", snapshot.docs.length);

        const privateChatList = [];
        const groupChatList = [];

        for (const chatDoc of snapshot.docs) {
          const chatId = chatDoc.id;
          const chatData = chatDoc.data();

          // Tjek om dette er en gruppechat
          if (chatData.isGroupChat) {
            // Gruppechat logik
            if (!chatData.participants?.includes(currentUserId)) continue;

            // Hent den sidste besked
            const messagesQuery = query(
              collection(db, "chats", chatId, "messages"),
              orderBy("timestamp", "desc"),
              limit(1)
            );

            const messagesSnapshot = await getDocs(messagesQuery);

            let lastMessage = "Ingen beskeder endnu";
            let lastMessageTime = null;
            let lastMessageSenderId = null;

            if (!messagesSnapshot.empty) {
              const lastMsg = messagesSnapshot.docs[0].data();
              lastMessage = lastMsg.text;
              lastMessageTime = lastMsg.timestamp;
              lastMessageSenderId = lastMsg.senderId;
            }

            // Hvis beskeden er fra den nuværende bruger, tilføj "Dig: " præfix
            if (lastMessageSenderId === currentUserId) {
              lastMessage = `Dig: ${lastMessage}`;
            }

            // Tæl ulæste beskeder
            let unreadCount = 0;

            if (lastMessageSenderId && lastMessageSenderId !== currentUserId) {
              const lastReadTime = chatData[`lastReadBy_${currentUserId}`];

              if (
                !lastReadTime ||
                (lastMessageTime &&
                  lastMessageTime.toMillis() > lastReadTime.toMillis())
              ) {
                const allMessagesQuery = query(
                  collection(db, "chats", chatId, "messages"),
                  orderBy("timestamp", "asc")
                );

                const allMessagesSnapshot = await getDocs(allMessagesQuery);

                allMessagesSnapshot.docs.forEach((msgDoc) => {
                  const msg = msgDoc.data();

                  if (msg.senderId !== currentUserId) {
                    if (!lastReadTime) {
                      unreadCount++;
                    } else if (
                      msg.timestamp &&
                      msg.timestamp.toMillis() > lastReadTime.toMillis()
                    ) {
                      unreadCount++;
                    }
                  }
                });

                console.log(
                  `📬 ${chatData.chatName}: ${unreadCount} ulæste beskeder`
                );
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

            // Hent deltager profilbilleder (max 3)
            // Den sidste afsender skal vises først/øverst
            const participantAvatars = [];
            const maxAvatars = 3;

            // Start med den sidste afsender (hvis det ikke er den nuværende bruger)
            const participantsToShow = [];
            if (lastMessageSenderId && lastMessageSenderId !== currentUserId) {
              participantsToShow.push(lastMessageSenderId);
            }

            // Tilføj resten af deltagerne
            for (const participantId of chatData.participants) {
              if (
                participantId !== lastMessageSenderId &&
                participantsToShow.length < maxAvatars
              ) {
                participantsToShow.push(participantId);
              }
            }

            // Hent deres data
            for (const participantId of participantsToShow) {
              try {
                const userDoc = await getDoc(doc(db, "users", participantId));
                if (userDoc.exists()) {
                  participantAvatars.push({
                    uid: participantId,
                    profileImage:
                      userDoc.data().profileImage ||
                      "https://via.placeholder.com/56",
                    name:
                      userDoc.data().kaldenavn ||
                      userDoc.data().fuldenavn ||
                      "Ukendt",
                  });
                }
              } catch (error) {
                console.error("Fejl ved hentning af deltager:", error);
              }
            }

            groupChatList.push({
              id: chatId,
              name: (chatData.chatName || "Gruppechat").replace(
                "Gruppechat: ",
                ""
              ), // ← Fjern præfix
              message: lastMessage,
              time: timeDisplay || "",
              participantAvatars: participantAvatars,
              unread: unreadCount,
              timestamp: lastMessageTime,
              participantCount: chatData.participants?.length || 0,
              isGroupChat: true,
            });
          } else {
            // Private chat logik (som før)
            if (!chatId.includes(currentUserId)) continue;

            const userIds = chatId.split("_");
            const otherUserId = userIds.find((id) => id !== currentUserId);
            if (!otherUserId) continue;

            const otherUserDoc = await getDoc(doc(db, "users", otherUserId));
            if (!otherUserDoc.exists()) continue;

            const otherUserData = otherUserDoc.data();

            const messagesQuery = query(
              collection(db, "chats", chatId, "messages"),
              orderBy("timestamp", "desc"),
              limit(1)
            );

            const messagesSnapshot = await getDocs(messagesQuery);

            let lastMessage = "Ingen beskeder endnu";
            let lastMessageTime = null;
            let lastMessageSenderId = null;

            if (!messagesSnapshot.empty) {
              const lastMsg = messagesSnapshot.docs[0].data();
              lastMessage = lastMsg.text;
              lastMessageTime = lastMsg.timestamp;
              lastMessageSenderId = lastMsg.senderId;
            }

            if (lastMessageSenderId === currentUserId) {
              lastMessage = `Dig: ${lastMessage}`;
            }

            let unreadCount = 0;

            if (lastMessageSenderId && lastMessageSenderId !== currentUserId) {
              const lastReadTime = chatData[`lastReadBy_${currentUserId}`];

              if (
                !lastReadTime ||
                (lastMessageTime &&
                  lastMessageTime.toMillis() > lastReadTime.toMillis())
              ) {
                const allMessagesQuery = query(
                  collection(db, "chats", chatId, "messages"),
                  orderBy("timestamp", "asc")
                );

                const allMessagesSnapshot = await getDocs(allMessagesQuery);

                allMessagesSnapshot.docs.forEach((msgDoc) => {
                  const msg = msgDoc.data();

                  if (msg.senderId === otherUserId) {
                    if (!lastReadTime) {
                      unreadCount++;
                    } else if (
                      msg.timestamp &&
                      msg.timestamp.toMillis() > lastReadTime.toMillis()
                    ) {
                      unreadCount++;
                    }
                  }
                });

                console.log(
                  `📬 ${otherUserData.kaldenavn}: ${unreadCount} ulæste beskeder`
                );
              }
            }

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

            privateChatList.push({
              id: otherUserId,
              name: otherUserData.kaldenavn || otherUserData.fuldenavn,
              fuldenavn: otherUserData.fuldenavn,
              message: lastMessage,
              time: timeDisplay || "",
              avatar: otherUserData.profileImage,
              unread: unreadCount,
              online: isUserOnline(
                otherUserData.isOnline,
                otherUserData.lastActive
              ),
              timestamp: lastMessageTime,
            });
          }
        }

        // Sortér chats efter tidsstempel (nyeste først)
        privateChatList.sort((a, b) => {
          if (!a.timestamp) return 1;
          if (!b.timestamp) return -1;
          return b.timestamp.toDate() - a.timestamp.toDate();
        });

        groupChatList.sort((a, b) => {
          if (!a.timestamp) return 1;
          if (!b.timestamp) return -1;
          return b.timestamp.toDate() - a.timestamp.toDate();
        });

        console.log("✅ Final private chat list:", privateChatList);
        console.log("✅ Final group chat list:", groupChatList);
        setPrivateChats(privateChatList);
        setGroupChats(groupChatList);
        setLoading(false);
      },
      (error) => {
        console.error("❌ Error listening to chats:", error);
        setLoading(false);
      }
    );

    return () => {
      console.log("🛑 Stopping chat listener");
      unsubscribe();
    };
  }, [currentUserId]);

  // Filtrer chats baseret på søgning
  const getFilteredChats = () => {
    const chats = activeTab === "private" ? privateChats : groupChats;

    if (!searchQuery.trim()) {
      return chats;
    }

    const lowerQuery = searchQuery.toLowerCase();

    return chats.filter((chat) => {
      const nameMatch = chat.name.toLowerCase().includes(lowerQuery);
      const fullNameMatch = chat.fuldenavn?.toLowerCase().includes(lowerQuery);

      return nameMatch || fullNameMatch;
    });
  };

  const currentChats = getFilteredChats();

  // Beregn totalt antal ulæste beskeder for hver tab
  const totalPrivateUnread = privateChats.reduce(
    (sum, chat) => sum + (chat.unread || 0),
    0
  );
  const totalGroupUnread = groupChats.reduce(
    (sum, chat) => sum + (chat.unread || 0),
    0
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500 pointer-events-none select-none">
          Henter chats...
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative p-4 overflow-hidden"
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className=" "
      >
        <ColorCircle />

        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Søg efter navn..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-6 py-2 rounded-full border-2 border-(--secondary)/40 focus:border-(--secondary) focus:outline-none text-(--primary)"
          />
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-6 top-1/2 -translate-y-1/2"
            >
              <svg
                className="w-6 h-6 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          ) : (
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
          )}
        </div>

        {/* Tab Buttons */}
        <div className="flex gap-3 mt-10 px-10 ">
          <button
            onClick={() => setActiveTab("private")}
            className={`relative flex-1 p-2 rounded-full font-semibold transition-colors ${
              activeTab === "private"
                ? "bg-(--secondary) text-white border-2 border-(--secondary)"
                : " text-(--secondary) border-2 border-(--secondary)"
            }`}
          >
            {t("private")}
            {totalPrivateUnread > 0 && (
              <UnreadBadge count={totalPrivateUnread} />
            )}
          </button>
          <button
            onClick={() => setActiveTab("group")}
            className={`relative flex-1 p-2 rounded-full font-semibold transition-colors ${
              activeTab === "group"
                ? "bg-(--secondary) text-white border-2 border-(--secondary)"
                : " text-(--secondary) border-2 border-(--secondary)"
            }`}
          >
            {t("group")}
            {totalGroupUnread > 0 && <UnreadBadge count={totalGroupUnread} />}
          </button>
        </div>
      </motion.div>

      {/* Chat Liste */}
      <div className="mt-4">
        {currentChats.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            {searchQuery ? (
              <>
                <p>{t("no-results")} "{searchQuery}"</p>
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-blue-500 text-sm mt-2 underline"
                >
                  {t("clear")}
                </button>
              </>
            ) : (
              <>
                <p>
                  {t("none")} {activeTab === "private" ? "private" : "gruppe"} {t("chats-yet")}
                  
                </p>
                <p className="text-sm mt-2">
                  {activeTab === "private"
                    ? "Start en samtale ved at besøge en profil"
                    : "Gruppechats oprettes automatisk når du godkender deltagere"}
                </p>
              </>
            )}
          </div>
        ) : (
          <>
            {searchQuery && (
              <p className="text-sm text-gray-500 mb-3">
                Viser {currentChats.length} {t("result")}
                {currentChats.length !== 1 ? "er" : ""} {t("for")} "{searchQuery}"
              </p>
            )}
            {currentChats.map((chat, index) => (
              <motion.div
                key={chat.id}
                onClick={() =>
                  navigate(
                    chat.isGroupChat
                      ? `/GroupChat/${chat.id}`
                      : `/Chats/${chat.id}`
                  )
                }
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                  duration: 0.6,
                  delay: 0.3 + index * 0.15,
                  ease: "easeInOut",
                }}
                className={`relative flex items-center border-2 border-(--secondary) gap-4 mb-3 rounded-full cursor-pointer transition-all active:brightness-80 ${
                  chat.unread > 0
                    ? "bg-blue-400 text-(--white)"
                    : "bg-(--white) text-gray-800 hover:bg-gray-50"
                }`}
              >
                {/* UnreadBadge */}
                {chat.unread > 0 && <UnreadBadge count={chat.unread} />}

                {/* Avatar eller Gruppe Avatars */}
                <div className="relative shrink-0">
                  {chat.isGroupChat ? (
                    // Overlappende profilbilleder for gruppechat
                    <div
                      className="relative flex items-center"
                      style={{ width: "70px", height: "56px" }}
                    >
                      {chat.participantAvatars &&
                      chat.participantAvatars.length > 0 ? (
                        <>
                          {chat.participantAvatars
                            .slice(0, 3)
                            .map((participant, idx) => (
                              <img
                                key={participant.uid}
                                src={participant.profileImage}
                                alt={participant.name}
                                className="absolute w-14 h-14 rounded-full object-cover border-2 border-(--white)"
                                style={{
                                  left: `${idx * 16}px`,
                                  zIndex: 3 - idx,
                                }}
                              />
                            ))}
                          {/* Hvis flere end 3 deltagere, vis +X */}
                          {chat.participantCount > 3 && (
                            <div
                              className="absolute w-14 h-14 rounded-full bg-blue-500 border-2 border-(--white) flex items-center justify-center"
                              style={{
                                left: "48px",
                                zIndex: 0,
                              }}
                            >
                              <span className="text-white text-xs font-bold">
                                +{chat.participantCount - 3}
                              </span>
                            </div>
                          )}
                        </>
                      ) : (
                        // Fallback hvis ingen avatars kunne hentes
                        <div className="w-14 h-14 rounded-full bg-blue-500 flex items-center justify-center">
                          <svg
                            className="w-8 h-8 text-white"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                          </svg>
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      <img
                        src={chat.avatar || "https://via.placeholder.com/56"}
                        alt={chat.name}
                        className="w-14 h-14 rounded-full object-cover border-2 border-(--white)"
                      />
                      <div
                        className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-(--white) ${
                          chat.online
                            ? chat.unread > 0
                              ? "bg-blue-300"
                              : "bg-green-400"
                            : "bg-gray-400"
                        }`}
                      ></div>
                    </>
                  )}
                </div>

                {/* Chat Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg truncate text-(--secondary)">
                    {chat.name}
                  </h3>
                  <p
                    className={`text-sm truncate ${
                      chat.unread > 0 ? "text-white/90" : "text-(--primary)"
                    }`}
                  >
                    {chat.message}
                  </p>
                </div>

                {/* Tid */}
                <div className="flex flex-col items-end gap-1 mr-4">
                  <span
                    className={`text-sm ${
                      chat.unread > 0
                        ? "text-(--white)"
                        : "text-(--secondary)/80"
                    }`}
                  >
                    {chat.time}
                  </span>
                </div>
              </motion.div>
            ))}
          </>
        )}
      </div>
    </motion.div>
  );
}

export default Chats;
