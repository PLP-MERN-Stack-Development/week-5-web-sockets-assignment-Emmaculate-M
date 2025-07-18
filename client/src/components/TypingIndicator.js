// components/TypingIndicator.js
import React from "react";

function TypingIndicator({ users }) {
  if (!users.length) return null;
  return (
    <div className="text-sm text-gray-500 italic">
      {users.map((u) => u.username).join(", ")} {users.length > 1 ? "are" : "is"} typing...
    </div>
  );
}

export default TypingIndicator;
