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
    <div className="absolute top-5 right-10">
      <button onClick={toggleNotifications} className="relative">
        <NotificationIcon color="--secondary" size={30} />

        {notifications.length > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center">
            {notifications.length}
          </span>
        )}
      </button>

      {isOpen && <NotificationsPopup />}
    </div>
  );
}
