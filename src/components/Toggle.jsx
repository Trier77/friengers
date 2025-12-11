export default function Toggle({ enabled, setEnabled }) {
  return (
    <button
      onClick={() => setEnabled(!enabled)}
      className={`w-16 h-8 flex items-center rounded-full p-1 transition ${
        enabled ? "bg-green-500" : "bg-gray-400"
      }`}
    >
      <div
        className={`w-6 h-6 bg-white rounded-full transition ${
          enabled ? "translate-x-8" : ""
        }`}
      ></div>
    </button>
  );
}
