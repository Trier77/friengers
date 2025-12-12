import { useEffect, useState } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router";
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
import PublicRoute from "./components/PublicRoutes";
import AppRoute from "./components/AppRoutes";

function App() {
  useOnlineStatus();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      // Når bruger logger ind → erstat login-siden i historikken med Feed
      if (currentUser && location.pathname === "/login") {
        navigate("/", { replace: true });
      }
    });

    return unsubscribe;
  }, [location.pathname, navigate]);

  // Forhindre navigation tilbage til /login når logget ind
  useEffect(() => {
    if (!user) return;

    const handlePopState = () => {
      // Hvis brugeren prøver at gå tilbage til login → stop dem på Feed
      if (window.location.pathname === "/login") {
        navigate("/", { replace: true });
      }
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [user, navigate]);

  if (loading) return null;

  return (
    <>
      {user && <Logo />}
      {user && <Navbar />}
      <div className={user ? "pb-36" : ""}>
        <Routes>
          <Route 
            path="/login" 
            element={
              <PublicRoute user={user}>
                <Login />
              </PublicRoute>
            } 
          />
          <Route
            path="/"
            element={
              <AppRoute user={user}>
                <Feed />
              </AppRoute>
            }
          />
          <Route
            path="/Chats"
            element={
              <AppRoute user={user}>
                <Chats />
              </AppRoute>
            }
          />
          <Route
            path="/Chats/:chatId"
            element={
              <AppRoute user={user}>
                <IndividualChat />
              </AppRoute>
            }
          />
          <Route
            path="/Profil"
            element={
              <AppRoute user={user}>
                <Profil />
              </AppRoute>
            }
          />
          <Route
            path="/AndresProfil/:userId"
            element={
              <AppRoute user={user}>
                <AndresProfil />
              </AppRoute>
            }
          />
          <Route
            path="/Settings"
            element={
              <AppRoute user={user}>
                <Settings />
              </AppRoute>
            }
          />
          <Route
            path="/test"
            element={
              <AppRoute user={user}>
                <FirebaseTest />
              </AppRoute>
            }
          />
        </Routes>
      </div>
    </>
  );
}

export default App;