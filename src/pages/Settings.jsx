import { useNavigate } from "react-router";

export default function Settings() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="text-6xl flex flex-col items-left gap-5">
      <p>Settings</p>
      <button className="p-2 rounded text-2xl" onClick={handleLogout}>
        Log out
      </button>
    </div>
  );
}
