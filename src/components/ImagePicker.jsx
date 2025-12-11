import { useState } from "react";

export default function ImagePicker({ onImageSelect }) {
  const [preview, setPreview] = useState(null);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file));
    onImageSelect(file);  // send filen tilbage til CreatePost
  };

  return (
    <div className="mb-4">
      {/* File input */}
      <label className="block text-white font-semibold mb-2">Add Image</label>

      <input
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFile}
        className="text-white"
      />

      {/* Preview */}
      {preview && (
        <img
          src={preview}
          alt="preview"
          className="mt-3 w-full h-auto rounded-xl"
        />
      )}
    </div>
  );
}
