

export default function OwnPost({ user, className = "" }) {
  if (!user) return null;

  return (
    <div className={className}>
      {user.activePosts.length === 0 ? (
        <p className="text-center text-gray-500">Ingen aktive opgaver</p>
      ) : (
        user.activePosts.map((post) => (
          <div
            key={post.id}
            className="bg-blue-900 rounded-3xl p-4 mb-4 text-white"
          >
            {/* Post Header */}
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-bold flex-1">{post.title}</h3>

              <div className="flex gap-2 text-xs">
                <span className="bg-white text-blue-900 px-3 py-1 rounded-full font-semibold">
                  {post.date}
                </span>
                <span className="bg-white text-blue-900 px-3 py-1 rounded-full font-semibold">
                  {post.time}
                </span>
              </div>
            </div>

            {/* Tags */}
            <div className="flex gap-2 mb-3">
              {post.tags.map((tag, index) => (
                <span
                  key={index}
                  className="text-xs border border-white px-3 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Description */}
            <p className="text-sm mb-4">{post.description}</p>

            {/* Footer */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-6 h-6 rounded-full"
                />
                <span className="text-sm">{user.name}</span>
              </div>

              <div className="flex items-center gap-2">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
                <span className="text-sm">{post.participants}</span>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
