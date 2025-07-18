import React, {useEffect} from "react";
import { socket } from "../socket";


function MessageList({ messages, currentUser }) {
  useEffect(() => {
    messages.forEach((msg) => {
      if (msg.sender !== currentUser && !msg.readBy?.includes(socket.id)) {
        socket.emit("read_message", msg.id);
      }
    });
  }, [messages, currentUser]);

  const handleReaction = (messageId, reaction) => {
    socket.emit("add_reaction", { messageId, reaction });
  };

  return (
    <div className="flex flex-col gap-2">
      {messages.map((msg) => {
        const isOwnMessage = msg.sender === currentUser;
        const isSystem = msg.system;

        return (
          <div
            key={msg.id}
            className={`p-2 rounded max-w-[70%] ${
              isSystem
                ? "text-center text-sm text-gray-500 mx-auto"
                : isOwnMessage
                ? "bg-blue-100 self-end"
                : "bg-gray-100 self-start"
            }`}
          >
            {!isSystem && (
              <div className="text-xs text-gray-500 mb-1">
                {msg.sender} — {new Date(msg.timestamp).toLocaleTimeString()}
              </div>
            )}

            {/* File Message */}
            {msg.file ? (
              <div>
                <div className="text-sm mb-1">{msg.content}</div>
                <a
                  href={msg.file.data}
                  download={msg.file.name}
                  className="text-blue-600 underline text-sm"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  📎 {msg.file.name}
                </a>
              </div>
            ) : (
              // Regular Message
              <div className="text-base">{msg.content || msg.message || msg.text}</div>
            )}

            {/* Reaction Buttons */}
            <div className="mt-2 flex gap-2 text-xl">
              {["❤️", "😂", "👍", "🔥", "😮", "😢", "😡"].map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleReaction(msg.id, emoji)}
                  className="text-lg hover:scale-110 transition"
                >
                  {emoji}
                </button>
              ))}
            </div>

            {/* Display Reactions */}
            {msg.reactions && msg.reactions.length > 0 && (
              <div className="text-sm mt-1">
                {msg.reactions.map((r, i) => (
                  <span key={i} className="mr-2">
                    {r.reaction} ({r.user})
                  </span>
                ))}
              </div>
            )}

            {/* [UPDATED] Read Receipts */}
            {isOwnMessage && msg.readBy && msg.readBy.length > 1 && (
              <div className="text-xs text-gray-400 mt-1">
                Seen by {msg.readBy.length - 1} other{msg.readBy.length - 1 > 1 ? "s" : ""}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default MessageList;
