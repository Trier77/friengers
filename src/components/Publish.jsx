import { useRef, useState } from "react";

export default function SlideToPublish({ handlePublish, isPublishing }) {
  const containerRef = useRef(null);
  const sliderRef = useRef(null);
  const dragXRef = useRef(0);
  const [dragging, setDragging] = useState(false);

  const handleDrag = (clientX) => {
    if (isPublishing) return; // Disable drag during publishing

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    let x = clientX - rect.left - 50;
    x = Math.max(0, Math.min(x, rect.width - 50));
    dragXRef.current = x;

    if (sliderRef.current) {
      sliderRef.current.style.transform = `translateX(${x}px)`;
    }
  };

  const handleRelease = async () => {
    if (isPublishing) return; // Disable release during publishing

    const container = containerRef.current;
    const threshold = container.offsetWidth - 80;

    if (dragXRef.current > threshold) {
      // Keep slider at end while publishing
      if (sliderRef.current) {
        sliderRef.current.style.transform = `translateX(${threshold}px)`;
      }

      // Call async publish function
      await handlePublish();
    }

    // Reset slider
    dragXRef.current = 0;
    if (sliderRef.current) {
      sliderRef.current.style.transition = "transform 0.2s";
      sliderRef.current.style.transform = `translateX(0px)`;
      setTimeout(() => {
        if (sliderRef.current) sliderRef.current.style.transition = "";
      }, 200);
    }

    setDragging(false);
  };

  return (
    <div
      ref={containerRef}
      className={`w-full h-20 bg-(--primary) rounded-full relative select-none justify-center flex items-center ${
        isPublishing ? "opacity-50 cursor-not-allowed" : ""
      }`}
      onMouseDown={() => !isPublishing && setDragging(true)}
      onMouseUp={handleRelease}
      onMouseMove={(e) => dragging && handleDrag(e.clientX)}
      onTouchStart={() => !isPublishing && setDragging(true)}
      onTouchEnd={handleRelease}
      onTouchMove={(e) => dragging && handleDrag(e.touches[0].clientX)}
    >
      <div
        ref={sliderRef}
        className="absolute w-14 h-14 bg-(--secondary) rounded-full flex items-center justify-center text-(--white) font-bold left-3"
      >
        {isPublishing ? "..." : "▶"}
      </div>
      <span className="absolute inset-0 flex items-center justify-center text-white font-semibold pointer-events-none">
        {isPublishing ? "Poster..." : "Post"}
      </span>
    </div>
  );
}
