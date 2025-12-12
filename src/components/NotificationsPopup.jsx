import {
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  getDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { useState } from "react";
import { useNavigate } from "react-router";
import GroupChatPrompt from "./GroupChatPrompt";

export default function NotificationsPopup({ notifications, closePopup }) {
  const [showGroupChatPrompt, setShowGroupChatPrompt] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const navigate = useNavigate();

  const handleResponse = async (postId, requesterUid, approve, postTitle) => {
    const postRef = doc(db, "posts", postId);

    if (approve) {
      const postSnap = await getDoc(postRef);
      const postData = postSnap.data();
      const currentParticipants = postData.participants || [];

      await updateDoc(postRef, {
        participants: arrayUnion(requesterUid),
        requests: arrayRemove(requesterUid),
      });

      if (currentParticipants.length === 0) {
        setSelectedPost({ id: postId, title: postTitle });
        setShowGroupChatPrompt(true);
      }
    } else {
      await updateDoc(postRef, {
        requests: arrayRemove(requesterUid),
      });
    }
  };

  const handleGroupChatClose = () => {
    setShowGroupChatPrompt(false);
    setSelectedPost(null);
  };

  return (
    <>
      {/* POPUP */}
      <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center sm:justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden">

          {/* Header */}
          <div className="bg-(--secondary) p-4 text-center">
            <h2 className="text-white font-bold text-lg">Notifikationer</h2>
          </div>

          {/* Content */}
          <div className="max-h-[70vh] overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="py-10 text-center text-gray-500">
                Ingen notifikationer endnu
              </p>
            ) : (
              notifications.map((n, index) => (
                <div
                    key={`${n.postId}-${n.requesterUid}`}
                    className={`p-4 ${index !== notifications.length - 1 ? "border-b" : ""} ${
                      n.status !== "pending" ? "opacity-50" : ""
                    }`}
                  >

                  <div className="mb-3">
                    <p className="text-gray-600 text-sm mb-1">Anmodning til:</p>
                    <p className="text-(--secondary) font-bold text-base">
                      {n.postTitle}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 mb-4">
                    <img
                      src={n.requesterImage || "https://via.placeholder.com/48"}
                      alt={n.requesterName}
                      className="w-12 h-12 rounded-full border-2 border-(--secondary) cursor-pointer object-cover"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/AndresProfil/${n.requesterUid}`);
                      }}
                    />
                    <div className="flex-1">
                      <p
                        className="text-(--secondary) font-semibold cursor-pointer hover:underline"
                        onClick={() =>
                          navigate(`/AndresProfil/${n.requesterUid}`)
                        }
                      >
                        {n.requesterName}
                      </p>
                      <p className="text-gray-500 text-sm">vil gerne hjælpe</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() =>
                        handleResponse(n.postId, n.requesterUid, false, n.postTitle)
                      }
                      className="flex-1 py-3 border-2 border-gray-300 rounded-full"
                    >
                      Afvis
                    </button>
                    <button
                      onClick={() =>
                        handleResponse(n.postId, n.requesterUid, true, n.postTitle)
                      }
                      className="flex-1 py-3 bg-(--secondary) text-white rounded-full"
                    >
                      Godkend
                    </button>
                  </div>
                  {n.status === "accepted" && (
                    <p className="text-green-600 mt-3 font-semibold">
                      Du accepterede denne anmodning
                    </p>
                  )}

                  {n.status === "rejected" && (
                    <p className="text-red-600 mt-3 font-semibold">
                      Du afviste denne anmodning
                    </p>
                  )}

                </div>
              ))
            )}
          </div>

          <button
            onClick={closePopup}
            className="w-full py-4 text-center bg-gray-100 text-gray-700 font-semibold"
          >
            Luk
          </button>
        </div>
      </div>

      {/* Popup til gruppechat */}
      {showGroupChatPrompt && selectedPost && (
        <GroupChatPrompt
          postId={selectedPost.id}
          postTitle={selectedPost.title}
          onClose={handleGroupChatClose}
        />
      )}
    </>
  );
}
