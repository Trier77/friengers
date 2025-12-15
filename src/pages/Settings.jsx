import { useNavigate } from "react-router";
import BackArrowIcon from "../../public/icons/BackArrowIcon";
import ProfileIcon from "../../public/icons/ProfileIcon";
import NotificationIcon from "../../public/icons/NotificationIcon";
import DarkModeIcon from "../../public/icons/DarkModeIcon";
import InfoIcon from "../../public/icons/InfoIcon";
import HelpIcon from "../../public/icons/HelpIcon";
import LogOutIcon from "../../public/icons/LogOutIcon";
import LangIcon from "../../public/icons/Lang";
import Toggle from "../components/Toggle";

import { useContext } from "react";
import { SettingsContext } from "../context/SettingsContext";
import { logout } from "../auth";
import { useTranslation } from "react-i18next";

export default function Settings() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const { darkMode, setDarkMode, notifications, setNotifications } =
    useContext(SettingsContext);

  const changeLanguage = (lang) => i18n.changeLanguage(lang);

  const handleLogout = async () => {
    try {
      await logout();
      localStorage.removeItem("user");
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="text-6xl flex flex-col gap-5">
      
      {/* Back button */}
      <div className="flex flex-row justify-between items-center m-4 mt-8 pr-4">
        <button onClick={() => navigate(-1)} className="ml-4">
          <BackArrowIcon />
        </button>
      </div>

      {/* Page title */}
      <div className="flex flex-col items-center gap-5 m-4">
        <h1 className="text-(--primary) text-5xl whitespace-nowrap">
          {t("settings")}
        </h1>

        {/* Content */}
        <div className="w-full px-6 flex flex-col gap-6">

          {/* ------ ACCOUNT ------ */}
          <div className="flex items-center gap-4">
            <div>
              <ProfileIcon />
            </div>
            <h2 className="text-(--primary) text-3xl">{t("account")}</h2>
          </div>

          {/* ------ LANGUAGE ------ */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 w-[200px]">
              <div>
                <LangIcon />
              </div>
              <h2 className="text-(--primary) text-3xl whitespace-nowrap">
                {t("language")}
              </h2>
            </div>

            <div className="flex gap-3">
              {/* Danish */}
              <button
                className={`h-12 w-12 flex items-center justify-center rounded-full border-2 transition-all ${
                  i18n.language === "da"
                    ? "border-(--secondary) scale-110"
                    : "border-transparent"
                }`}
                onClick={() => changeLanguage("da")}
              >
                <img
                  src="/img/dannebrog.png"
                  className="h-8 w-8 rounded-full"
                />
              </button>

              {/* English */}
              <button
                className={`h-12 w-12 flex items-center justify-center rounded-full border-2 transition-all ${
                  i18n.language === "en"
                    ? "border-(--secondary) scale-110"
                    : "border-transparent"
                }`}
                onClick={() => changeLanguage("en")}
              >
                <img
                  src="/img/union-jack.png"
                  className="h-8 w-8 rounded-full"
                />
              </button>
            </div>
          </div>

          {/* ------ NOTIFICATIONS ------ */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 w-[200px]">
              <div>
                <NotificationIcon color="--primary" size={20} />
              </div>
              <h2 className="text-(--primary) text-3xl whitespace-nowrap">
                {t("notifications")}
              </h2>
            </div>

            <Toggle enabled={notifications} setEnabled={setNotifications} />
          </div>

          {/* ------ DARK MODE ------ */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 w-[200px]">
              <div>
                 <DarkModeIcon />
              </div>
              <h2 className="text-(--primary) text-3xl whitespace-nowrap">
                {t("darkmode")}
              </h2>
            </div>

           <Toggle  /> 
          </div>

          {/* ------ ABOUT ------ */}
          <div className="flex items-center gap-4 w-[200px]">
            <div>
               <InfoIcon />
            </div>
            <h2 className="text-(--primary) text-2xl whitespace-nowrap">
              {t("about")}
            </h2>
          </div>

          {/* ------ HELP ------ */}
          <div className="flex items-center gap-4 w-[200px]">
            <div>
            <HelpIcon />
            </div>
            <h2 className="text-(--primary) text-2xl whitespace-nowrap">
              {t("help")}
            </h2>
          </div>

          {/* ------ LOGOUT ------ */}
          <div className="flex items-center gap-4 w-[200px]">
            <div>
              <LogOutIcon />
            </div>
            <button
              className="text-(--primary) text-2xl whitespace-nowrap"
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
