import { useState } from "react";
import CamIcon from "../../public/icons/CamIcon";

export default function ImagePicker({ onImagesSelect }) {
  const [previews, setPreviews] = useState([]);

  const handleFiles = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const newPreviews = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));

    setPreviews((prev) => [...prev, ...newPreviews]);
    onImagesSelect(files);
  };

  return (
    <div className="mb-4">
      <div className="flex gap-3 overflow-x-auto">
        {previews.map((img, i) => (
          <img
            key={i}
            src={img.url}
            alt="preview"
            className="h-24 w-auto rounded-xl object-cover"
          />
        ))}

        <label
          className={`flex h-24 w-24 items-center justify-center rounded-xl border-2 border-dashed cursor-pointer ${
            previews.length === 0 ? "border-(--white)" : "border-(--white)"
          }`}
        >
          <span className="text-(--white)">
            <CamIcon color="--white" size={30} />
          </span>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFiles}
            className="hidden"
          />
        </label>
      </div>
    </div>
  );
}
