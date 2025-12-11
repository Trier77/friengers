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
  const [loginTimestamp, setLoginTimestamp] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      const wasLoggedOut = user === null;
      const isNowLoggedIn = currentUser !== null;

      setUser(currentUser);
      setLoading(false);

      // Når bruger logger ind første gang → sæt timestamp og clear history
      if (wasLoggedOut && isNowLoggedIn) {
        setLoginTimestamp(Date.now());
        // Push Feed til history stack så der er noget at "gå tilbage til"
        window.history.pushState(null, "", "/");
      }

      // Når bruger logger ud → clear timestamp
      if (!currentUser) {
        setLoginTimestamp(null);
      }
    });

    return unsubscribe;
  }, [user]);

  // Bloker browser tilbage-knap når logget ind
  useEffect(() => {
    if (!user || !loginTimestamp) return;

    const blockBackNavigation = (e) => {
      // Push state igen for at "fange" tilbage-knappen
      window.history.pushState(null, "", window.location.pathname);
      
      // Hvis bruger ikke er på Feed, send dem dertil
      if (location.pathname !== "/") {
        navigate("/", { replace: false });
      }
    };

    // Tilføj en initial state så vi kan fange tilbage-knappen
    window.history.pushState(null, "", window.location.pathname);
    
    window.addEventListener("popstate", blockBackNavigation);

    return () => {
      window.removeEventListener("popstate", blockBackNavigation);
    };
  }, [user, loginTimestamp, location.pathname, navigate]);

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