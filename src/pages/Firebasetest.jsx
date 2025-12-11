import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db, auth } from "../firebase";

function FirebaseTest() {
  const [testResults, setTestResults] = useState({
    loading: true,
    currentUser: null,
    allChats: [],
    allUsers: [],
    error: null,
  });

  useEffect(() => {
    const runTests = async () => {
      try {
        const currentUserId = auth.currentUser?.uid;
        console.log("🔐 Current user ID:", currentUserId);

        // Test 1: Hent alle chats
        const chatsSnapshot = await getDocs(collection(db, "chats"));
        const allChats = [];

        for (const doc of chatsSnapshot.docs) {
          const chatId = doc.id;
          const messagesSnapshot = await getDocs(
            collection(db, "chats", chatId, "messages")
          );

          allChats.push({
            chatId: chatId,
            messageCount: messagesSnapshot.docs.length,
            messages: messagesSnapshot.docs.map((msgDoc) => ({
              id: msgDoc.id,
              ...msgDoc.data(),
            })),
          });
        }

        console.log("💬 All chats:", allChats);

        // Test 2: Hent alle users
        const usersSnapshot = await getDocs(collection(db, "users"));
        const allUsers = usersSnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().fuldenavn,
          kaldenavn: doc.data().kaldenavn,
        }));

        console.log("👥 All users:", allUsers);

        setTestResults({
          loading: false,
          currentUser: currentUserId,
          allChats: allChats,
          allUsers: allUsers,
          error: null,
        });
      } catch (error) {
        console.error("❌ Error:", error);
        setTestResults((prev) => ({
          ...prev,
          loading: false,
          error: error.message,
        }));
      }
    };

    runTests();
  }, []);

  if (testResults.loading) {
    return <div className="p-4">Loading test results...</div>;
  }

  return (
    <div className="p-4 bg-white min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Firebase Test Results</h1>

      {testResults.error && (
        <div className="bg-red-100 p-4 rounded mb-4">
          <p className="text-red-800 font-bold">Error:</p>
          <p className="text-red-600">{testResults.error}</p>
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-xl font-bold mb-2">Current User:</h2>
        <div className="bg-blue-100 p-3 rounded">
          <p className="font-mono text-sm">
            {testResults.currentUser || "Not logged in"}
          </p>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-bold mb-2">
          All Users ({testResults.allUsers.length}):
        </h2>
        <div className="space-y-2">
          {testResults.allUsers.map((user) => (
            <div key={user.id} className="bg-green-100 p-3 rounded">
              <p className="font-mono text-xs text-gray-600">{user.id}</p>
              <p className="font-semibold">{user.name}</p>
              <p className="text-sm">{user.kaldenavn}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-bold mb-2">
          All Chats ({testResults.allChats.length}):
        </h2>
        {testResults.allChats.length === 0 ? (
          <div className="bg-yellow-100 p-4 rounded">
            <p className="text-yellow-800">No chats found in database!</p>
            <p className="text-sm mt-2">
              Try sending a message to create a chat.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {testResults.allChats.map((chat) => (
              <div key={chat.chatId} className="bg-purple-100 p-4 rounded">
                <p className="font-bold">
                  Chat ID:{" "}
                  <span className="font-mono text-sm">{chat.chatId}</span>
                </p>
                <p className="text-sm">Messages: {chat.messageCount}</p>

                {chat.messages.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <p className="text-xs font-semibold">Messages:</p>
                    {chat.messages.map((msg) => (
                      <div
                        key={msg.id}
                        className="bg-white p-2 rounded text-xs"
                      >
                        <p>
                          <strong>From:</strong> {msg.senderId}
                        </p>
                        <p>
                          <strong>Text:</strong> {msg.text}
                        </p>
                        <p>
                          <strong>Time:</strong>{" "}
                          {msg.timestamp?.toDate().toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8 p-4 bg-gray-100 rounded">
        <h3 className="font-bold mb-2">Next Steps:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>
            Check if your current user ID matches any user ID in the "All Users"
            section
          </li>
          <li>Check if any chat IDs contain your user ID</li>
          <li>
            If there are no chats, try sending a message from IndividualChat
          </li>
          <li>Look at the browser console for more detailed logs</li>
        </ol>
      </div>
    </div>
  );
}

export default FirebaseTest;
