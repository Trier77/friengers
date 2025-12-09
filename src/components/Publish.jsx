import { useRef, useState } from "react";

export default function SlideToPublish({ handlePublish }) {
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const containerRef = useRef(null);

  const handleDrag = (clientX) => {
    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    let x = clientX - rect.left - 50;
    x = Math.max(0, Math.min(x, rect.width - 50)); // 50 = knob width
    setDragX(x);
  };

  const handleRelease = () => {
    const container = containerRef.current;
    if (dragX > container.offsetWidth - 60) {
      handlePublish(); // Trigger når slider næsten er i enden
    }
    setDragX(0);
    setDragging(false);
  };

  return (
    <div
      ref={containerRef}
      className={
        "w-full h-20 bg-(--primary) rounded-full relative select-none justify-center flex items-center px-5"
      }
      onMouseDown={() => setDragging(true)}
      onMouseUp={handleRelease}
      onMouseMove={(e) => dragging && handleDrag(e.clientX)}
      onTouchStart={() => setDragging(true)}
      onTouchEnd={handleRelease}
      onTouchMove={(e) => dragging && handleDrag(e.touches[0].clientX)}
    >
      <div
        className="absolute w-15 h-15 bg-(--secondary) rounded-full flex items-center justify-center text-(--white) font-bold transition-transform duration-150 left-0"
        style={{ transform: `translateX(${dragX}px)` }}
      >
        ▶
      </div>
      <span className="absolute inset-0 flex items-center justify-center text-white font-semibold pointer-events-none">
        Post
      </span>
    </div>
  );
}
