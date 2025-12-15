import { useState, useEffect } from "react";
import ArrowIcon from "../../public/icons/ArrowIcon";

export default function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div
      className={`
        fixed bottom-20 -right-12 h-24 w-24 rounded-full
        bg-(--secondary) text-(--white) z-1000 flex items-center text-2xl
        transition-transform duration-300 ease-in-out
        ${isVisible ? "translate-x-0" : "translate-x-full"}
      `}
    >
      <button onClick={scrollToTop} className="pl-4">
        <ArrowIcon rotate={270} color="--white" size={20} />
      </button>
    </div>
  );
}
