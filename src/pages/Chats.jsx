import { useState } from "react";
import { NavLink } from "react-router";

function Chats() {
  const [activeTab, setActiveTab] = useState("private"); // 'privat chat' eller 'gruppe chat'

  // Dette er bare noget dummy data, indtil at vi når til det
  const privateChats = [
    {
      id: 1,
      name: "Emma Sørensen",
      message: "Hvis det passer?",
      time: "9:33",
      avatar: "/path-to-avatar.jpg",
      unread: 2,
      online: true,
    },
    {
      id: 2,
      name: "Jesper Madsen",
      message: "Tak for hjælpen, endnu en gang!",
      time: "Tir.",
      avatar: "/path-to-avatar.jpg",
      unread: 0,
      online: true,
    },
    {
      id: 3,
      name: "Jens Andersen",
      message: "Dig: Super, så ses vi der!",
      time: "27/11",
      avatar: "/path-to-avatar.jpg",
      unread: 0,
      online: true,
    },
  ];

  const groupChats = []; // Her skal vi tilføje gruppechat-data senere

  const currentChats = activeTab === "private" ? privateChats : groupChats;

  return (
    <div className="min-h-screen bg-gray-100 pb-20">
      <div className="bg-white pt-6 pb-4 px-6">
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
      </div>

      {/* Chat List */}
      <div className="px-4 mt-4">
        {currentChats.map((chat) => (
          <div
            key={chat.id}
            className={`flex items-center gap-4 p-4 mb-3 rounded-2xl cursor-pointer transition-all ${
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
                className={`text-sm ${
                  chat.id === 1 ? "text-white" : "text-gray-500"
                }`}
              >
                {chat.time}
              </span>
              {chat.unread > 0 && (
                <div className="bg-blue-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                  {chat.unread}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Chats;
