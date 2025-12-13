import { useState, useEffect } from "react";
import { useRef } from "react";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  Timestamp,
} from "firebase/firestore";
import { auth, db } from "../firebase";
import CalendarIcon from "../../public/icons/CalenderIcon";
import GroupsIcon from "../../public/icons/GroupsIcon";
import MapPinIcon from "../../public/icons/MapPinIcon";
import Publish from "./Publish";
import ImagePicker from "./ImagePicker";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";
import useTags from "./Tags";
import Edit from "./Edit";

export default function CreatePost({ open, onClose, post = null }) {
  const { tags: allTags, loading: tagsLoading } = useTags();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [participantsCount, setParticipantsCount] = useState("");
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
    if (!user) return;

    setIsPublishing(true);

    try {
      let imageUrls = post?.imageUrls || [];

      for (const file of imageFile) {
        const imageRef = ref(
          storage,
          `posts/${user.uid}/${Date.now()}-${file.name}`
        );
        const snap = await uploadBytes(imageRef, file);
        const url = await getDownloadURL(snap.ref);
        imageUrls.push(url);
      }

      if (post) {
        // ✏️ EDIT
        await updateDoc(doc(db, "posts", post.id), {
          title,
          description,
          location,
          maxParticipants: participantsCount,
          tags: selectedTags,
          time: Timestamp.fromDate(new Date(time)),
          imageUrls,
        });
      } else {
        // ➕ CREATE
        await addDoc(collection(db, "posts"), {
          title,
          description,
          location,
          participants: [],
          maxParticipants: participantsCount,
          tags: selectedTags,
          time: Timestamp.fromDate(new Date(time)),
          uid: user.uid,
          imageUrls,
          createdAt: Timestamp.now(),
        });
      }

      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsPublishing(false);
    }
  };

  useEffect(() => {
    if (post) {
      setTitle(post.title || "");
      setDescription(post.description || "");
      setLocation(post.location || "");
      setParticipantsCount(post.maxParticipants || "");
      setSelectedTags(post.tags || []);
      setTime(post.time ? post.time.toDate().toISOString().slice(0, 16) : "");
    }
  }, [post]);

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
          fixed inset-x-0 bottom-0
          bg-(--secondary) px-4 pt-8 z-50 pb-20
          transition-transform duration-300
          rounded-t-2xl overflow-y-auto overflow-hidden
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
        <div className="flex justify-between text-[--white] text-sm pb-5 border-t border-[--white] pt-3">
          <div className="flex flex-col gap-4 min-w-0">
            <div className="relative flex items-center gap-2 min-w-0 flex-1 text-(--white)">
              <MapPinIcon color="--white" size={20} />
              <input
                className="bg-transparent appearance-none border-none focus:outline-none text-[--white] flex-1 min-w-0 "
                placeholder="Hvor foregår det..."
                onFocus={handleFocus}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div
              className="relative flex items-center gap-2 min-w-0 flex-1 "
              style={{ color: "var(--white)" }}
            >
              <CalendarIcon color="--white" size={20} />
              {!time && (
                <span
                  className="text-[--white] pointer-events-none absolute left-7 opacity-50"
                  style={{ color: "var(--white)" }}
                >
                  Hvornår?
                </span>
              )}
              <input
                type="datetime-local"
                className="bg-transparent appearance-none border-none focus:outline-none text-[--white] flex-1 min-w-0 relative z-10"
                onFocus={handleFocus}
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>

            <div className="relative flex items-center gap-2 min-w-0 flex-1 text-[--white]">
              <GroupsIcon color="--white" size={20} />
              <select
                className={`bg-transparent appearance-none border-none focus:outline-none flex-1 min-w-0 
      ${
        !participantsCount
          ? "text-[--white] opacity-50"
          : "text-[--white] opacity-100"
      }`}
                style={{ color: "var(--white)" }}
                value={participantsCount || ""}
                onChange={(e) => setParticipantsCount(Number(e.target.value))}
              >
                <option value="" disabled>
                  Deltagere
                </option>
                {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                  <option key={num} value={num}>
                    {num}
                  </option>
                ))}
              </select>
            </div>
          </div>{" "}
          <div className="flex min-w-0">
            <ImagePicker
              onImagesSelect={(files) =>
                setImageFile((prev) => [...prev, ...files])
              }
            />
          </div>
        </div>

        <div className="flex justify-end">
          {post ? (
            <Edit handlePublish={handlePublish} isPublishing={isPublishing} />
          ) : (
            <Publish
              handlePublish={handlePublish}
              isPublishing={isPublishing}
            />
          )}
        </div>
      </div>
    </>
  );
}
