import { useParams, useNavigate } from "react-router";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

function IndividualChat() {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isInputFocused, setIsInputFocused] = useState(false);

  // Dummy data
  const chatData = {
    1: {
      name: "Emma Sørensen",
      avatar:
        "https://img.freepik.com/free-photo/fair-haired-woman-looking-with-pleased-calm-expression_176420-15145.jpg",
      messages: [
        { id: 1, text: "Hej! Hvordan går det?", sender: "them", time: "9:30" },
        { id: 2, text: "Godt! Og dig?", sender: "me", time: "9:31" },
        { id: 3, text: "Hvis det passer?", sender: "them", time: "9:33" },
      ],
    },
    2: {
      name: "Jesper Madsen",
      avatar:
        "https://media.istockphoto.com/id/1200677760/photo/portrait-of-handsome-smiling-young-man-with-crossed-arms.jpg?s=612x612&w=0&k=20&c=g_ZmKDpK9VEEzWw4vJ6O577ENGLTOcrvYeiLxi8mVuo=",

      messages: [
        {
          id: 1,
          text: "Tak for hjælpen, endnu en gang!",
          sender: "them",
          time: "Tir.",
        },
      ],
    },
    3: {
      name: "Jens Andersen",
      avatar:
        "https://t3.ftcdn.net/jpg/00/77/71/12/360_F_77711294_BA5QTjtgGPmLKCXGdtbAgZciL4kEwCnx.jpg",
      messages: [
        {
          id: 1,
          text: "Hey! Mega fedt du gider hjælpe mig. Det har været lidt uoverskueligtxD",
          sender: "them",
          time: "27/11",
        },
        {
          id: 2,
          text: "Jeg kender det så godt, jeg hader også bare når falaflerne ikke bliver ordentlig runde! Men du må gerne låne mit æbleskive-jern",
          sender: "me",
          time: "27/11",
        },
        {
          id: 3,
          text: "Tak! Jeg er hjemme om ca. 40 minutter vil jeg tro",
          sender: "them",
          time: "27/11",
        },
        { id: 4, text: "Super, så ses vi der!", sender: "me", time: "27/11" },
      ],
    },
  };

  const chat = chatData[chatId];

  // Initialize messages from dummy data
  useEffect(() => {
    if (chat) {
      setMessages(chat.messages);
    }
  }, [chatId]);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim() === "") return;

    const newMsg = {
      id: messages.length + 1,
      text: newMessage,
      sender: "me",
      time: new Date().toLocaleTimeString("da-DK", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages([...messages, newMsg]);
    setNewMessage("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  if (!chat) {
    return <div>Chat ikke fundet</div>;
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
          src={chat.avatar}
          alt={chat.name}
          className="w-10 h-10 rounded-full object-cover"
        />
        <h2 className="font-semibold text-lg text-gray-800">{chat.name}</h2>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.sender === "me" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[70%] p-3 rounded-2xl ${
                message.sender === "me"
                  ? "bg-blue-500 text-white rounded-br-sm"
                  : "bg-gray-200 text-gray-800 rounded-bl-sm"
              }`}
            >
              <p>{message.text}</p>
              <span
                className={`text-xs mt-1 block ${
                  message.sender === "me" ? "text-blue-100" : "text-gray-400"
                }`}
              >
                {message.time}
              </span>
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
              document.querySelector("nav").style.display = "none";
              messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
            }}
            onBlur={() => {
              setIsInputFocused(false);
              document.querySelector("nav").style.display = "flex";
            }}
            className="flex-1 px-4 py-3 rounded-full border-2 border-gray-200 focus:outline-none focus:border-blue-400"
          />
          <button
            onMouseDown={handleSendMessage}
            className="bg-blue-500 text-white p-3 rounded-full"
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
