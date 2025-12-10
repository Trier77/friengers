import { useRef, useState } from "react";

export default function SlideToPublish({ handlePublish }) {
  const containerRef = useRef(null);
  const sliderRef = useRef(null);
  const dragXRef = useRef(0); // Brug ref til live drag position
  const [dragging, setDragging] = useState(false);

  const handleDrag = (clientX) => {
    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    let x = clientX - rect.left - 50;
    x = Math.max(0, Math.min(x, rect.width - 50));
    dragXRef.current = x;

    // Opdater transform direkte
    if (sliderRef.current) {
      sliderRef.current.style.transform = `translateX(${x}px)`;
    }
  };

  const handleRelease = () => {
    const container = containerRef.current;
    if (dragXRef.current > container.offsetWidth - 80) {
      handlePublish();
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
      className="w-full h-20 bg-(--primary) rounded-full relative select-none justify-center flex items-center"
      onMouseDown={() => setDragging(true)}
      onMouseUp={handleRelease}
      onMouseMove={(e) => dragging && handleDrag(e.clientX)}
      onTouchStart={() => setDragging(true)}
      onTouchEnd={handleRelease}
      onTouchMove={(e) => dragging && handleDrag(e.touches[0].clientX)}
    >
      <div
        ref={sliderRef}
        className="absolute w-14 h-14 bg-(--secondary) rounded-full flex items-center justify-center text-(--white) font-bold left-3"
      >
        ▶
      </div>
      <span className="absolute inset-0 flex items-center justify-center text-white font-semibold pointer-events-none">
        Post
      </span>
    </div>
  );
}
