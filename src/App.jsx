import { useEffect, useState } from "react";
import { Routes, Route } from "react-router";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import IndividualChat from "./pages/IndividualChat";

import Feed from "./pages/Feed";
import Profil from "./pages/Profil";
import Chats from "./pages/Chats";
import Navbar from "./components/Navbar";
import Logo from "./components/Logo";
import Login from "./pages/Login";
import Settings from "./pages/Settings";
import AndresProfil from "./pages/AndresProfil";
import FirebaseTest from "./pages/Firebasetest";
import { useOnlineStatus } from "./hooks/Useonlinestatus";

function App() {
  useOnlineStatus();
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
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Feed />} />
        <Route path="/Chats" element={<Chats />} />
        <Route path="/AndresProfil/:userId" element={<AndresProfil />} />
        <Route path="/Profil" element={<Profil />} />
        <Route path="/Chats/:chatId" element={<IndividualChat />} />
        <Route path="/Settings" element={<Settings />} />
        <Route path="/test" element={<FirebaseTest />} />
      </Routes>
    </>
  );
}

export default App;
