import { useEffect, useState } from "react";
import { Routes, Route } from "react-router";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";

import Feed from "./pages/Feed";
import Profil from "./pages/Profil";
import Chats from "./pages/Chats";
import Navbar from "./components/Navbar";
import Logo from "./components/Logo";
import Login from "./pages/Login";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  if (loading) return null;

  // Not logged in → show login only
  if (!user) {
    return <Login />;
  }

  // Logged in → show app
  return (
    <>
      <Logo />
      <Navbar />
      <Routes>
        <Route path="/" element={<Feed />} />
        <Route path="/Chats" element={<Chats />} />
        <Route path="/Profil" element={<Profil />} />
      </Routes>
    </>
  );
}

export default App;
