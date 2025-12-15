import { useTranslation } from "react-i18next";

export default function EditPost({ handlePublish, isPublishing }) {
  const {t} = useTranslation();

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
      {isPublishing ? t(`edit.saving`) : t(`edit.save`)}
    </button>
  );
}
