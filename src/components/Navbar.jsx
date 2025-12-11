import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { NavLink } from "react-router";

export default function Navbar() {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const docRef = doc(db, "users", user.uid);
      const snap = await getDoc(docRef);

      if (snap.exists()) {
        setUserData(snap.data());
      }
    };

    fetchProfile();
  }, []);

  if (!userData) return null;

  return (
    <div className="z-1000">
      <div
        className="pointer-events-none fixed bottom-24 left-0 w-full h-24 z-40 bg-gradient-to-t from-(--white) to-transparent
        "
      />
      <nav className="fixed  bottom-0 left-0 w-full  z-50 flex justify-around p-7 bg-(--white)">
        {/* Chat Icon */}
        <NavLink to="/Chats">
          {({ isActive }) => (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 20.23"
              className={`h-10 ${
                isActive ? "fill-(--secondary)" : "fill-(--primary)"
              }`}
            >
              <path d="M24,16.09c-.61.37-1.34.57-2.11.57-1.19,0-2.26-.48-3.03-1.27-.89.35-1.87.54-2.89.54h-.13c.74-1.3,1.16-2.8,1.16-4.4,0-4.29-3.03-7.89-7.07-8.76,1.46-1.7,3.62-2.77,6.04-2.77,4.39,0,7.96,3.57,7.96,7.96,0,2.01-.74,3.85-1.97,5.25.22,1.23.99,2.28,2.04,2.88Z" />
              <path d="M16,11.53c0,4.4-3.57,7.97-7.97,7.97-1.02,0-2-.19-2.9-.54-.77.79-1.84,1.28-3.03,1.28-.77,0-1.49-.21-2.11-.57,1.05-.6,1.82-1.65,2.04-2.89C.81,15.38.07,13.54.07,11.53.07,7.14,3.64,3.57,8.03,3.57s7.97,3.57,7.97,7.97Z" />
            </svg>
          )}
        </NavLink>

        {/* Home Icon */}
        <NavLink to="/">
          {({ isActive }) => (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 20.23"
              className={`h-10 ${
                isActive ? "fill-(--secondary)" : "fill-(--primary)"
              }`}
            >
              <path d="M11.31.39c-.12-.12-.27-.22-.43-.29-.16-.07-.33-.1-.51-.1s-.35.03-.51.1c-.16.07-.31.17-.43.29L.36,9.67c-.18.18-.29.4-.34.65-.05.24-.02.49.08.72.1.23.27.42.48.56.21.14.46.21.71.21h2.16v6.74c0,.45.18.88.51,1.19s.76.49,1.22.49h1.73c.46,0,.9-.18,1.22-.49s.51-.75.51-1.19v-1.69c0-.45.18-.88.51-1.19.32-.32.76-.49,1.22-.49s.9.18,1.22.49c.32.32.51.75.51,1.19v1.69c0,.45.18.88.51,1.19.32.32.76.49,1.22.49h1.73c.46,0,.9-.18,1.22-.49.32-.32.51-.75.51-1.19v-6.74h2.16c.25,0,.5-.07.71-.21.21-.14.38-.33.48-.56.1-.23.13-.48.08-.72-.05-.24-.16-.47-.34-.65L11.31.39Z" />
            </svg>
          )}
        </NavLink>

        {/* Profile Icon (circle) */}
        <NavLink to="/Profil">
          {({ isActive }) => (
            <img
              src={userData.profileImage}
              alt={userData.fuldenavnname}
              className={`w-10 h-10 rounded-full object-cover ${
                isActive ? "outline-5 outline-(--secondary)" : "outline-0"
              }`}
            />
          )}
        </NavLink>
      </nav>
    </div>
  );
}
