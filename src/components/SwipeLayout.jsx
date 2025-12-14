import { Outlet, useLocation, useNavigate } from "react-router";
import { useSwipeable } from "react-swipeable";
import { useSwipe } from "./SwipeContext";

const tabs = ["/Chats", "/", "/Profil"];

export default function SwipeLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const index = tabs.indexOf(location.pathname);
  const { swipeEnabled } = useSwipe(); // <--- read flag

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      if (!swipeEnabled) return; // <--- block if disabled
      if (index < tabs.length - 1) navigate(tabs[index + 1]);
    },
    onSwipedRight: () => {
      if (!swipeEnabled) return; // <--- block if disabled
      if (index > 0) navigate(tabs[index - 1]);
    },
    trackTouch: true,
    preventScrollOnSwipe: true,
  });

  return (
    <div {...handlers} className="h-full w-full">
      <Outlet />
    </div>
  );
}
