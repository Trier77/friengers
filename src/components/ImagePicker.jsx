import { useState } from "react";

export default function ImagePicker({ onImagesSelect }) {
  const [previews, setPreviews] = useState([]);

  const handleFiles = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    // Lav previews
    const newPreviews = files.map((file) => ({
      file,
      url: URL.createObjectURL(file)
    }));

    setPreviews((prev) => [...prev, ...newPreviews]);

    // Send ALLE filer tilbage til CreatePost
    onImagesSelect(files);
  };

  return (
    <div className="mb-4">
      <label className="block text-white font-semibold mb-2">
        Add images
      </label>

      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleFiles}
        className="text-white"
      />

      {/* PREVIEW GALLERY */}
      {previews.length > 0 && (
        <div className="flex gap-3 mt-3 overflow-x-auto">
          {previews.map((img, i) => (
            <img
              key={i}
              src={img.url}
              alt="preview"
              className="h-24 w-auto rounded-xl object-cover"
            />
          ))}
        </div>
      )}
    </div>
  );
}
