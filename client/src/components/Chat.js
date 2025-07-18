// components/Chat.js
import React, { useEffect, useState, useRef } from "react";
import { useSocket } from "../socket";
import MessageList from "../components/MessageList";
import TypingIndicator from "../components/TypingIndicator";
import UserList from "../components/UserList";

function Chat() {
  const [room, setRoom] = useState(localStorage.getItem("room") || "general");
  const username = localStorage.getItem("username");
  const [message, setMessage] = useState("");
  const [file, setFile] = useState(null);
  const fileInput = useRef();

  const {   
    messages,
    users,
    typingUsers,
    isConnected,
    connect,
    disconnect,
    sendMessage,
    setTyping,
  } = useSocket();

  // Connect to socket server when component mounts
  useEffect(() => {
    console.log('Connecting socket:', username, room);
    if (!username || !room) return;
    connect(username, room);

    return () => {
      console.log('Disconnecting socket');
      disconnect();
    };
  }, [username, room, connect, disconnect]);

  // Handle regular message sending
  const handleSend = () => {
    if (!message.trim()) return;

    const messageData = {
      content: message,
    };

    sendMessage(messageData);
    setMessage("");
  };

  // Handle sending file
  const handleFileSend = () => {
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      sendMessage({
        content: message || "📎 File attached",
        file: {
          name: file.name,
          type: file.type,
          data: reader.result,
        },
      });
      setFile(null);
      setMessage("");
    };
    reader.readAsDataURL(file);
  };

  const handleTyping = (e) => {
    const val = e.target.value;
    setMessage(val);
    setTyping(val.length > 0);
  };

  // Handle room switching
  const handleRoomSwitch = (newRoom) => {
  if (newRoom === room) return;

  // Leave current room
  disconnect();

  // Set new room
  setRoom(newRoom);
  localStorage.setItem("room", newRoom); // Optional: store for later use

  // Reconnect to new room
  connect(username, newRoom);
};

  return (
    <div className="w-full max-w-4xl bg-white rounded-lg shadow-md p-4 flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Room: {room}</h2>
        <div className="flex items-center gap-2">
            <span className="font-semibold">Switch room:</span>
            {["General", "Tech", "Random", "Gaming"].map((r) => (
    <button
      key={r}
      onClick={() => handleRoomSwitch(r)}
      className={`px-3 py-1 rounded ${
        room === r ? "bg-blue-600 text-white" : "bg-gray-200"
      }`}
    >
      {r}
    </button>
  ))}
</div>

        <UserList users={users} />
      </div>

      <div className="flex-1 overflow-y-auto border p-2 rounded h-[300px]">
        <MessageList messages={messages} currentUser={username} />
      </div>

      <TypingIndicator users={typingUsers} />

      <div className="flex gap-2 items-center">
        <input
          type="text"
          placeholder="Type your message..."
          value={message}
          onChange={handleTyping}
          className="border p-2 rounded w-full"
        />
        <input
          type="file"
          hidden
          ref={fileInput}
          onChange={(e) => {
            setFile(e.target.files[0]);
            handleFileSend(); // Automatically send file once selected
          }}
        />
        <button
          onClick={() => fileInput.current.click()}
          className="bg-gray-300 px-2 py-1 rounded hover:bg-gray-400"
        >
          Attach File
        </button>
        <button
          onClick={file ? handleFileSend : handleSend}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Send
        </button>
      </div>

      {!isConnected && (
        <div className="text-red-500 text-sm mt-2">
          Disconnected from server. Attempting to reconnect...
        </div>
      )}
    </div>
  );
}

export default Chat;
