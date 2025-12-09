import { useParams, useNavigate } from "react-router";
import { motion } from "framer-motion";

function AndresProfil() {
  const { userId } = useParams();
  const navigate = useNavigate();

  // Dummy data - senere erstattes med Firebase
  const userData = {
    1: {
      name: "Emma Sørensen",
      avatar:
        "https://img.freepik.com/free-photo/fair-haired-woman-looking-with-pleased-calm-expression_176420-15145.jpg",
      bio: "Born and raised i Aarhus og læser biologi. Elsker fitness og programmering i min fritid. Altid villig til at give en hånd.",
      study: "Molekylær Biologi",
      tasksCompleted: 14,
      memberSince: "12/09-2022",
      activePosts: [
        {
          id: 1,
          title: "Skab flyttes - hvem kan?",
          tags: ["Praktisk", "Flytning"],
          description:
            "Hej! Jeg sidder og mangler en ekstra hånd til at flytte et skab fra min lejlighed på Christian X's vej ned til...",
          participants: "0/2",
          date: "9. Maj",
          time: "Kl. 14:00",
        },
      ],
    },
    2: {
      name: "Jesper Madsen",
      avatar:
        "https://media.istockphoto.com/id/1200677760/photo/portrait-of-handsome-smiling-young-man-with-crossed-arms.jpg",
      bio: "Interesseret i sport og friluftsliv 🏃‍♂️",
      study: "Idræt",
      tasksCompleted: 8,
      memberSince: "15/03-2023",
      activePosts: [],
    },
  };

  const user = userData[userId];

  if (!user) {
    return <div className="p-4">Bruger ikke fundet</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-white pb-20"
    >
      {/* Header Section */}
      <div className="bg-white pt-8 pb-6 px-6 relative">
        {/* Flag Icon - top right */}
        <button className="absolute top-4 right-4">
          <svg
            className="w-6 h-6 text-blue-500 opacity-40"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2z"
            />
          </svg>
        </button>
        {/* Profile Info */}
        <div className="flex items-center gap-4 mb-4">
          {/* Avatar with border */}
          <div className="relative">
            <div className="w-15 h-15 rounded-full border-4 border-blue-500 p-1">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-full h-full rounded-full object-cover"
              />
            </div>
            {/* Online status dot */}
            <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
          </div>

          {/* Name and Study */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 whitespace-nowrap">
              {user.name}
            </h1>
            <p className="text-blue-500 font-bold text-sm">{user.study}</p>
            <p className="text-sm text-blue-500/50">She/Her</p>
          </div>
        </div>

        {/* Bio */}
        <p className="text-gray-700 text-sm mb-4">{user.bio}</p>

        {/* Tasks Completed */}
        <div className="text-center">
          <p className="text-sm text-gray-600 font-semibold mb-2">
            Opgaver løst
          </p>
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-500 rounded-full">
            <span className="text-white font-bold text-lg">
              {user.tasksCompleted}
            </span>
          </div>
        </div>
      </div>

      {/* Active Posts Section */}
      <div className="px-6 mt-6">
        <h2 className="text-center font-bold text-gray-900 mb-4">
          Aktive opgaver
        </h2>

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

      {/* Member Since */}
      <div className="text-center mt-8 mb-4">
        <p className="text-gray-400 text-sm">Oprettet</p>
        <p className="text-gray-500 text-sm">{user.memberSince}</p>
      </div>
    </motion.div>
  );
}

export default AndresProfil;
