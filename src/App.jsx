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
import GroupChat from "./pages/GroupChat";
import ScrollToTopButton from "./components/ScrollToTop";
import SwipeLayout from "./components/SwipeLayout";
import { SwipeProvider } from "./components/SwipeContext";

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-(--secondary)/30 border-t-(--secondary) rounded-full animate-spin" />
      </div>
    );
  }

  const hideNavbar =
    location.pathname.startsWith("/Chats/") ||
    location.pathname.startsWith("/GroupChat/");

  return (
    <SwipeProvider>
      <>
        {user && <Logo />}
        {user && !hideNavbar && <Navbar />}
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
            <Route element={<SwipeLayout />}>
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
                path="/Profil"
                element={
                  <AppRoute user={user}>
                    <Profil />
                  </AppRoute>
                }
              />
            </Route>
            <Route
              path="/Chats/:chatId"
              element={
                <AppRoute user={user}>
                  <IndividualChat />
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
            <Route
              path="/GroupChat/:chatId"
              element={
                <AppRoute user={user}>
                  <GroupChat />
                </AppRoute>
              }
            />
          </Routes>
        </div>
        <ScrollToTopButton />
      </>
    </SwipeProvider>
  );
}

export default App;
