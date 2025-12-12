import { useNavigate } from "react-router";
import BackArrowIcon from "../../public/icons/BackArrowIcon";
import GearIcon from "../../public/icons/GearIcon";
import ProfileIcon from "../../public/icons/ProfileIcon";
import NotificationIcon from "../../public/icons/NotificationIcon";
import DarkModeIcon from "../../public/icons/DarkModeIcon";
import InfoIcon from "../../public/icons/InfoIcon";
import HelpIcon from "../../public/icons/HelpIcon";
import LogOutIcon from "../../public/icons/LogOutIcon";
import LangIcon from "../../public/icons/Lang";
import Toggle from "../components/Toggle";
import { useState, useEffect } from "react";
import { useContext } from "react";
import { SettingsContext } from "../context/SettingsContext";
import { logout } from "../auth";
import { useTranslation } from "react-i18next";



export default function Settings() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const changeLanguage = (lang) => {
  i18n.changeLanguage(lang);
};

  const { darkMode, setDarkMode, notifications, setNotifications } =
    useContext(SettingsContext);

   const handleLogout = async () => {
    try {
      await logout(); // Firebase logout  
      localStorage.removeItem("user"); // Hvis du selv gemmer noget
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="text-6xl flex flex-col items-left gap-5">
      <div className="flex flex-row justify-between m-4 mt-16">
        <BackArrowIcon />
        <GearIcon />
      </div>

      <div className="flex flex-col items-center gap-5 m-4">
        <h1 className="text-(--primary) text-5xl">{t("settings")}</h1>

        <div>
          <div className="flex gap-4 items-center mb-4">
            <ProfileIcon />
            <h2 className="text-(--primary) text-3xl ">{t("account")}</h2>
          </div>

          <div className="flex gap-4 items-center mb-4">
  <LangIcon />
  <h2 className="text-(--primary) text-3xl ">{t("language")}</h2>

  <div className="flex gap-2 ml-auto">
    <button 
      className=" py-1 rounded text-2xl"
      onClick={() => changeLanguage("da")}
    >
      <img src="img/dannebrog.png" alt="Dannebrog" className="rounded-3xl h-7 w-7" />
    </button>
    <button 
      className=" py-1 rounded text-2xl"
      onClick={() => changeLanguage("en")}
    >
      <img src="img/union-jack.png" alt="Union Jack" className="rounded-3xl h-7 w-7" />
    </button>
  </div>
</div>


          {/* Notifications */}
          <div className="flex justify-between items-center mb-4 gap-4">
            <div className="flex gap-4 items-center">
              <NotificationIcon color="--primary" size={20} />
              <h2 className="text-(--primary) text-3xl">{t("notifications")}</h2>
            </div>

            <Toggle enabled={notifications} setEnabled={setNotifications} />
          </div>

          {/* Dark mode */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-4 items-center">
              <DarkModeIcon />
              <h2 className="text-(--primary) text-3xl">{t("darkmode")}</h2>
            </div>

            <Toggle enabled={darkMode} setEnabled={setDarkMode} />
          </div>
        

        <div className="flex gap-4 items-center mb-4">
          <InfoIcon />
          <h2 className="text-(--primary) text-3xl">{t("about")}</h2>
        </div>

        <div className="flex gap-4 items-center mb-4">
          <HelpIcon />
          <h2 className="text-(--primary) text-3xl">{t("help")}</h2>
        </div>

        <div className="flex gap-4 items-center mb-4">
          <LogOutIcon />
          <button
            className="rounded text-(--primary) text-3xl"
            onClick={handleLogout}
          >
            {t("logout")}
          </button>
          </div>
        </div>
      </div>
    </div>
  );
}
