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
          <div key={posts.id} className="mb-4 p-4 bg-[var(--primary)]">
            <h2 className="text-xl text-[var(--white)] font-[var(--overskrift)]">
              {posts.title}
            </h2>
            <p>{posts.description}</p>
          </div>
        ))
      )}
    </div>
  );
}
