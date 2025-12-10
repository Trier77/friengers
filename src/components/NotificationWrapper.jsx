import useNotifications from "./useNotifications";
import { useRef, useEffect } from "react";
import { useState } from "react";
import NotificationIcon from "../../public/icons/NotificationIcon";
import NotificationsPopup from "./NotificationsPopup";

export default function NotificationWrapper() {
  const [isOpen, setIsOpen] = useState(false);
  const notifications = useNotifications();

  const toggleNotifications = () => setIsOpen(!isOpen);

  const wrapperRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="absolute top-10 right-10">
      <button onClick={toggleNotifications} className="relative">
        <NotificationIcon color="--primary" size={20} />

        {notifications.length > 0 && (
          <span className="absolute -top-2 -right-2 bg-(--secondary) text-white rounded-full w-4 h-4 font-bold text-xs flex items-center justify-center">
            {notifications.length}
          </span>
        )}
      </button>

      {isOpen && <NotificationsPopup />}
    </div>
  );
}
