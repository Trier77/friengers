export default function EditPost({ handlePublish, isPublishing }) {
  return (
    <button
      onClick={handlePublish}
      disabled={isPublishing}
      className={`
        py-4 px-8 rounded-full font-bold text-white
        flex items-center justify-center
        transition-opacity
        ${
          isPublishing
            ? "bg-gray-400 cursor-not-allowed opacity-60"
            : "bg-(--primary)"
        }
      `}
    >
      {isPublishing ? "Saving..." : "Gem ændring"}
    </button>
  );
}
