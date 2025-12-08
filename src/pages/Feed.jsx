import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const postsCollection = collection(db, "posts");
        const postsSnapshot = await getDocs(postsCollection);
        const postsList = postsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        console.log(postsList);
        setPosts(postsList);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="text-2xl p-4">
      {posts.length === 0 ? (
        <p>No posts yet.</p>
      ) : (
        posts.map((posts) => (
          <div key={posts.id} className="mb-4 p-4 bg-(--primary) rounded-2xl">
            <div className="flex items-center gap-4">
              <h2 className="justify-start text-(--secondary) text-xl overskrift">
                {posts.title}
              </h2>
              <div className="bg-(--white) rounded-2xl p-2 flex gap-2">
                <p className="text-(--secondary) text-sm">
                  {posts.time?.toDate().toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                </p>
                <p className="text-(--secondary) text-sm">
                  {posts.time?.toDate().toLocaleTimeString(undefined, {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>

            <p className="w-60 justify-start text-(--white) text-sm">
              {posts.description}
            </p>
            <p className="justify-start text-(--secondary) text-sm">
              {posts.participants}
            </p>
          </div>
        ))
      )}
    </div>
  );
}
