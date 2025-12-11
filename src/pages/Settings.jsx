import { useNavigate } from "react-router";
import BackArrowIcon from "../../public/icons/BackArrowIcon";
import GearIcon from "../../public/icons/GearIcon";
import ProfileIcon from "../../public/icons/ProfileIcon";
import NotificationIcon from "../../public/icons/NotificationIcon";
import DarkModeIcon from "../../public/icons/DarkModeIcon";
import InfoIcon from "../../public/icons/InfoIcon";
import HelpIcon from "../../public/icons/HelpIcon";
import LogOutIcon from "../../public/icons/LogOutIcon";
import Toggle from "../components/Toggle";
import { useState, useEffect } from "react";
import { useContext } from "react";
import { SettingsContext } from "../context/SettingsContext";


export default function Settings() {
  const navigate = useNavigate();

  const { darkMode, setDarkMode, notifications, setNotifications } =
    useContext(SettingsContext);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="text-6xl flex flex-col items-left gap-5">
      <div className="flex flex-row justify-between m-4 mt-16">
        <BackArrowIcon />
        <GearIcon />
      </div>

      <div className="flex flex-col items-center gap-5 m-4">
        <h1 className="text-(--primary) text-5xl">Indstillinger</h1>

        <div>
          <div className="flex gap-4 items-center mb-4">
            <ProfileIcon />
            <h2 className="text-(--primary) text-3xl ">Konto</h2>
          </div>

          {/* Notifications */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-4 items-center">
              <NotificationIcon color="--primary" size={20} />
              <h2 className="text-(--primary) text-3xl">Notifikation</h2>
            </div>

            <Toggle enabled={notifications} setEnabled={setNotifications} />
          </div>

          {/* Dark mode */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-4 items-center">
              <DarkModeIcon />
              <h2 className="text-(--primary) text-3xl">Dark mode</h2>
            </div>

            <Toggle enabled={darkMode} setEnabled={setDarkMode} />
          </div>
        </div>

        <div className="flex gap-4 items-center mb-4">
          <InfoIcon />
          <h2 className="text-(--primary) text-3xl">Om os</h2>
        </div>

        <div className="flex gap-4 items-center mb-4">
          <HelpIcon />
          <h2 className="text-(--primary) text-3xl">Hjælp og support</h2>
        </div>

        <div className="flex gap-4 items-center mb-4">
          <LogOutIcon />
          <button
            className="rounded text-(--primary) text-3xl"
            onClick={handleLogout}
          >
            Log out
          </button>
        </div>
      </div>
    </div>
  );
}
