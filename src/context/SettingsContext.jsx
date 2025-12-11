import { createContext, useState, useEffect } from "react";

export const SettingsContext = createContext();

export function SettingsProvider({ children }) {
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );

  const [notifications, setNotifications] = useState(
    localStorage.getItem("notifications") === "true"
  );

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
    if (darkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem("notifications", notifications);
  }, [notifications]);

  return (
    <SettingsContext.Provider
      value={{ darkMode, setDarkMode, notifications, setNotifications }}
    >
      {children}
    </SettingsContext.Provider>
  );
}
