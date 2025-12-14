import NewPostIcon from "../../public/icons/NewPostIcon";
import CreatePost from "./CreatePost";
import { useState, useEffect } from "react";
import { useSwipe } from "../components/SwipeContext"; // import context

export default function Create({ allTags, onPostCreated }) {
  const [open, setOpen] = useState(false);
  const { setSwipeEnabled } = useSwipe(); // get setter from context

  // Disable swipe when modal is open
  useEffect(() => {
    if (open) {
      setSwipeEnabled(false);
    } else {
      setSwipeEnabled(true);
    }
  }, [open, setSwipeEnabled]);

  const handleClose = async (wasCreated) => {
    console.log("🚪 CreatePost closed, wasCreated:", wasCreated);
    setOpen(false);
    if (wasCreated && onPostCreated) {
      console.log("✅ Calling onPostCreated");
      await onPostCreated();
    }
  };

  return (
    <>
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50">
        <button onClick={() => setOpen(true)}>
          <NewPostIcon />
        </button>
      </div>
      <CreatePost open={open} onClose={handleClose} allTags={allTags} />
    </>
  );
}
