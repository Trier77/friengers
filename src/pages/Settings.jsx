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

  console.log("Current language:", i18n.language);

  return (
    <div className="text-6xl flex flex-col items-left gap-5">
      <div className="flex flex-row justify-between m-4 mt-8">
        
        <button onClick={() => navigate(-1)} className="ml-4">
          <BackArrowIcon />
        </button>
        <svg
                  className="w-6 h-6 text-(--secondary)" // w-6/h-6 svarer nogenlunde til 24px
                  viewBox="0 0 21 20"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M7.3 20L6.9 16.8C6.68333 16.7167 6.47933 16.6167 6.288 16.5C6.09667 16.3833 5.909 16.2583 5.725 16.125L2.75 17.375L0 12.625L2.575 10.675C2.55833 10.5583 2.55 10.446 2.55 10.338V9.663C2.55 9.55433 2.55833 9.44167 2.575 9.325L0 7.375L2.75 2.625L5.725 3.875C5.90833 3.74167 6.1 3.61667 6.3 3.5C6.5 3.38333 6.7 3.28333 6.9 3.2L7.3 0H12.8L13.2 3.2C13.4167 3.28333 13.621 3.38333 13.813 3.5C14.005 3.61667 14.1923 3.74167 14.375 3.875L17.35 2.625L20.1 7.375L17.525 9.325C17.5417 9.44167 17.55 9.55433 17.55 9.663V10.337C17.55 10.4457 17.5333 10.5583 17.5 10.675L20.075 12.625L17.325 17.375L14.375 16.125C14.1917 16.2583 14 16.3833 13.8 16.5C13.6 16.6167 13.4 16.7167 13.2 16.8L12.8 20H7.3ZM10.1 13.5C11.0667 13.5 11.8917 13.1583 12.575 12.475C13.2583 11.7917 13.6 10.9667 13.6 10C13.6 9.03333 13.2583 8.20833 12.575 7.525C11.8917 6.84167 11.0667 6.5 10.1 6.5C9.11667 6.5 8.28733 6.84167 7.612 7.525C6.93667 8.20833 6.59933 9.03333 6.6 10C6.60067 10.9667 6.93833 11.7917 7.613 12.475C8.28767 13.1583 9.11667 13.5 10.1 13.5Z" />
                </svg>
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
      <img src="/img/dannebrog.png" alt="Dannebrog" className="rounded-3xl h-7 w-7" />
    </button>
    <button 
      className=" py-1 rounded text-2xl"
      onClick={() => changeLanguage("en")}
    >
      <img src="/img/union-jack.png" alt="Union Jack" className="rounded-3xl h-7 w-7" />
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
