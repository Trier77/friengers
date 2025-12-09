import NewPostIcon from "../../public/icons/NewPostIcon";
import CreatePost from "./CreatePost";
import { useState } from "react";

export default function Create({ allTags }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50">
        <button onClick={() => setOpen(true)}>
          <NewPostIcon />
        </button>
      </div>

      <CreatePost
        open={open}
        onClose={() => setOpen(false)}
        allTags={allTags}
      />
    </>
  );
}
