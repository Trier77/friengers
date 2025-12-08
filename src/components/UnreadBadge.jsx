function UnreadBadge({ count }) {
  return (
    <div className="absolute -top-3 -right-3 bg-blue-500 text-white text-sm font-bold rounded-full w-8 h-8 flex items-center justify-center border-white animate-ripple">
      {count}
    </div>
  );
}
export default UnreadBadge;
