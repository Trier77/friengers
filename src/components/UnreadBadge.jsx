function UnreadBadge({ count }) {
  return (
    <div className="absolute -top-2 -right-2 outline-2 outline-(--white) bg-blue-500 text-white text-sm font-bold rounded-full w-6 h-6 flex items-center justify-center border-white animate-ripple">
      {count}
    </div>
  );
}
export default UnreadBadge;
