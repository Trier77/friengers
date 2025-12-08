import { useState } from "react";

export default function Tilmeld({ className = "" }) {
  const [clicked, setClicked] = useState(false);

  const handleClick = () => {
    setClicked(!clicked);
  };

  return (
    <button
      onClick={handleClick}
      className={`w-20 h-20 rounded-tl-full transition-colors duration-300 
        ${clicked ? "bg-(--secondary)" : "bg-(--white)"} ${className}`}
    />
  );
}
