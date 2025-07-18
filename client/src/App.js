// App.js
import React, { useState } from "react";
import Chat from "./components/Chat";

function App() {
  const [username, setUsername] = useState("");
  const [room] = useState("global");
  const [hasJoined, setHasJoined] = useState(!!localStorage.getItem("username"));

  const handleJoin = () => {
    if (!username) return;
    localStorage.setItem("username", username);
    setHasJoined(true);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4">
      {!hasJoined ? (
        <div className="bg-white p-6 rounded shadow-md w-full max-w-md mt-32">
          <h2 className="text-2xl font-bold mb-4">Join Chat</h2>
          <input
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="border p-2 w-full mb-4 rounded"
          />
          <button
            onClick={handleJoin}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Join Chat
          </button>
        </div>
      ) : (
        <Chat room={room} />
      )}
    </div>
  );
}

export default App;
