export default function PreviewModal({ imageUrl, onClose }) {
  if (!imageUrl) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-(--white)/70 flex items-center justify-center cursor-pointer"
    >
      <img
        src={imageUrl}
        alt="Preview"
        className="max-h-full max-w-full px-4"
      />
    </div>
  );
}
