import { useState } from "react";
import { useRef } from "react";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "../firebase";
import CalendarIcon from "../../public/icons/CalenderIcon";
import GroupsIcon from "../../public/icons/GroupsIcon";
import MapPinIcon from "../../public/icons/MapPinIcon";
import Publish from "./Publish";

export default function CreatePost({ open, onClose, allTags }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [participants, setParticipants] = useState(1);
  const [time, setTime] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);

  const containerRef = useRef(null);
  const handleFocus = (e) => {
    // Scroll the focused input into view
    e.target.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handlePublish = async () => {
    try {
      await addDoc(collection(db, "posts"), {
        title,
        description,
        location,
        participants,
        tags: selectedTags,
        time: Timestamp.fromDate(new Date(time)),
        uid: "GG9tgK9dxjUMMpq48OrhnihCsn22", // midlertidig
        createdAt: Timestamp.now(),
      });

      onClose();

      // reset form
      setTitle("");
      setDescription("");
      setLocation("");
      setParticipants(1);
      setTime("");
      setSelectedTags([]);
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };

  return (
    <>
      <div
        ref={containerRef}
        className={`
    fixed inset-0 bg-(--white)/80 z-40
    transition-opacity duration-300
    ${
      open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
    }
  `}
        onClick={onClose}
      />

      <div
        className={`
          fixed inset-x-0 bottom-0 w-screen
          bg-(--secondary) px-4 pt-8 z-50 pb-20
          transition-transform duration-300
          rounded-t-2xl
          ${open ? "translate-y-0" : "translate-y-full"}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-(--white) rounded-2xl p-3 mb-3">
          <input
            className="w-full text-(--secondary) font-bold mb-2"
            placeholder="Title"
            onFocus={handleFocus}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            className="w-full text-(--secondary) text-lg"
            placeholder="Description"
            onFocus={handleFocus}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`px-3 py-1 rounded-2xl text-xs font-bold ${
                selectedTags.includes(tag)
                  ? "bg-(--white) text-(--secondary)"
                  : "border border-(--white) text-(--white)"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        <div className="flex flex-column justify-between text-(--white) text-sm pb-5 gap-10">
          <div className="relative flex items-center gap-2">
            <MapPinIcon color={time ? "--white" : "--white"} size={20} />
            <input
              className="w-full"
              onFocus={handleFocus}
              placeholder="Hvor foregår det..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div className="relative flex items-center gap-2">
            <CalendarIcon color={time ? "--white" : "--white"} size={20} />
            <input
              className="w-full no-spinner"
              onFocus={handleFocus}
              type="datetime-local"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>
          <div className="relative flex items-center w-20 text-[--white] gap-2">
            <GroupsIcon color={time ? "--white" : "--white"} size={20} />
            <input
              className="w-full"
              onFocus={handleFocus}
              type="number"
              min="1"
              value={participants}
              onChange={(e) => setParticipants(Number(e.target.value))}
            />
          </div>
        </div>

        <Publish handlePublish={handlePublish} />
      </div>
    </>
  );
}
