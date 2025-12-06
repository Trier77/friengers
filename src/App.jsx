import Feed from "./pages/Feed";
import { Routes, Route } from "react-router";
import Navbar from "./components/Navbar";
import Profil from "./pages/Profil";
import Chats from "./pages/Chats";

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/Chats" element={<Chats />} />
        <Route path="/" element={<Feed />} />
        <Route path="/Profil" element={<Profil />} />
      </Routes>
    </>
  );
}

export default App;
