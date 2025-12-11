import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

export default function useTags() {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const docRef = doc(db, "tags", "tags");

    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const tagArray = docSnap.data().tags || [];
          console.log("Fetched tags:", tagArray);
          setTags(tagArray);
        } else {
          console.log("No tags document found");
          setTags([]);
        }
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching tags:", err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { tags, loading, error };
}
