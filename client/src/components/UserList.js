// components/UserList.js
import React from "react";

function UserList({ users }) {
  return (
    <div className="text-sm">
      <strong>Users:</strong>{users.map((u) => u.username).join(", ")}
    </div>
  );
}

export default UserList;
