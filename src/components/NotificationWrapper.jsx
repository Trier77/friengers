import useNotifications from "./useNotifications";
import { useRef, useEffect, useState } from "react";
import NotificationIcon from "../../public/icons/NotificationIcon";
import NotificationsPopup from "./NotificationsPopup";

export default function NotificationWrapper() {
  const [isOpen, setIsOpen] = useState(false);
  const notifications = useNotifications();

  const wrapperRef = useRef();

  const toggleNotifications = () => setIsOpen((prev) => !prev);

  // Tæl kun pending notifications for badge
  const pendingCount = notifications.filter(
    (n) => !n.status || n.status === "pending"
  ).length;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className="absolute top-10 right-10">
      <button onClick={toggleNotifications} className="relative">
        <NotificationIcon color="--primary" size={20} />

        {pendingCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-(--secondary) text-white rounded-full w-4 h-4 font-bold text-xs flex items-center justify-center">
            {pendingCount}
          </span>
        )}
      </button>

      {isOpen && (
        <NotificationsPopup
          notifications={notifications}
          closePopup={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}