import { useParams, useNavigate } from "react-router";
import { motion } from "framer-motion";

function AndresProfil() {
  const { userId } = useParams(); // Hent bruger ID fra URL
  const navigate = useNavigate();

  // Dummy data - senere erstattes med Firebase
  const userData = {
    1: {
      name: "Emma Sørensen",
      avatar:
        "https://img.freepik.com/free-photo/fair-haired-woman-looking-with-pleased-calm-expression_176420-15145.jpg",
      bio: "Elsker at lave mad og møde nye mennesker! 🍕",
      age: 24,
      location: "København",
    },
    2: {
      name: "Jesper Madsen",
      avatar:
        "https://media.istockphoto.com/id/1200677760/photo/portrait-of-handsome-smiling-young-man-with-crossed-arms.jpg",
      bio: "Interesseret i sport og friluftsliv 🏃‍♂️",
      age: 28,
      location: "Aarhus",
    },
    // Tilføj flere brugere...
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
      className="min-h-screen bg-gray-100 pb-20"
    >
      {/* Header med tilbage-knap */}
      <div className="bg-white p-4 flex items-center gap-4 shadow-sm">
        <button onClick={() => navigate(-1)} className="p-2">
          <svg
            className="w-6 h-6 text-blue-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <h2 className="font-semibold text-lg">Profil</h2>
      </div>

      {/* Profil indhold */}
      <div className="p-6 flex flex-col items-center">
        <img
          src={user.avatar}
          alt={user.name}
          className="w-32 h-32 rounded-full object-cover mb-4"
        />
        <h1 className="text-2xl font-bold text-gray-800 mb-2">{user.name}</h1>
        <p className="text-gray-600 mb-1">
          {user.age} år • {user.location}
        </p>
        <p className="text-gray-700 text-center mt-4 px-4">{user.bio}</p>

        {/* Send besked knap */}
        <button
          onClick={() => navigate(`/Chats/${userId}`)}
          className="mt-6 bg-blue-500 text-white px-6 py-3 rounded-full font-semibold"
        >
          Send besked
        </button>
      </div>
    </motion.div>
  );
}

export default AndresProfil;
