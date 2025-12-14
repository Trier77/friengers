import { useState } from "react";
import { useRef } from "react";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { auth, db } from "../firebase";

import Publish from "./Publish";

import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";
import useTags from "./Tags";
import { useTranslation } from "react-i18next";

export default function Notifikationshistorik({ open, onClose }) {
  const {t} =useTranslation();
  const { tags: allTags, loading: tagsLoading } = useTags();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [participantsCount, setParticipantsCount] = useState(1); // ← OMDØBT fra participants til participantsCount
  const [time, setTime] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [imageFile, setImageFile] = useState([]);
  const [isPublishing, setIsPublishing] = useState(false);

  const containerRef = useRef(null);

  const handleFocus = (e) => {
    e.target.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handlePublish = async () => {
    const user = auth.currentUser;

    if (!user) {
      console.error("User not logged in");
      return;
    }

    setIsPublishing(true);

    try {
      let imageUrls = [];

      for (const file of imageFile) {
        const imageRef = ref(
          storage,
          `posts/${user.uid}/${Date.now()}-${file.name}`
        );

        const snap = await uploadBytes(imageRef, file);
        const url = await getDownloadURL(snap.ref);
        imageUrls.push(url);
      }

      // ✅ VIGTIGT: participants skal være et TOMT ARRAY, ikke et nummer!
      await addDoc(collection(db, "posts"), {
        title,
        description,
        location,
        participants: [], // ← RETTET: Tom array i stedet for nummer
        maxParticipants: participantsCount, // ← NYT FELT: Gem det ønskede antal her
        tags: selectedTags,
        time: Timestamp.fromDate(new Date(time)),
        uid: user.uid,
        imageUrls,
        createdAt: Timestamp.now(),
      });

      console.log(
        "✅ Post created with participants: [] and maxParticipants:",
        participantsCount
      );

      // Reset form
      setTitle("");
      setDescription("");
      setLocation("");
      setParticipantsCount(1);
      setTime("");
      setSelectedTags([]);
      setImageFile([]);

      onClose();
    } catch (error) {
      console.error("Error creating post:", error);
      alert("Der opstod en fejl ved oprettelsen af opslaget");
    } finally {
      setIsPublishing(false);
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
            open
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
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
          max-h-[85vh] overflow-y-auto
          ${open ? "translate-y-0" : "translate-y-full"}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-(--white) rounded-2xl p-3 mb-3">
          <input
            className="w-full text-(--secondary) font-bold mb-2"
            placeholder={t("title")}
            onFocus={handleFocus}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            className="w-full text-(--secondary) text-lg"
            placeholder={t("description")}
            onFocus={handleFocus}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {!tagsLoading &&
            allTags.map((tag) => (
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
            <MapPinIcon color="--white" size={20} />
            <input
              className="w-full"
              onFocus={handleFocus}
              placeholder={t("where")}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div className="relative flex items-center gap-2">
            <CalendarIcon color="--white" size={20} />
            <input
              className="w-full no-spinner"
              onFocus={handleFocus}
              type="datetime-local"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>

          <div className="relative flex items-center w-20 text-[--white] gap-2">
            <GroupsIcon color="--white" size={20} />
            <input
              className="w-full"
              onFocus={handleFocus}
              type="number"
              min="1"
              value={participantsCount}
              onChange={(e) => setParticipantsCount(Number(e.target.value))}
            />
          </div>
        </div>

        <ImagePicker
          onImagesSelect={(files) =>
            setImageFile((prev) => [...prev, ...files])
          }
        />

        <Publish handlePublish={handlePublish} isPublishing={isPublishing} />
      </div>
    </>
  );
}
