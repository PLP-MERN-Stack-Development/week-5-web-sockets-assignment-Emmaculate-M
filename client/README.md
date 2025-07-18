# Real-time Chat Application

A fully functional real-time chat app built with React and Socket.io featuring rooms, file sharing, typing indicators, reactions (one reaction per user per message), and read receipts. This README guides you step-by-step through how it works and how to set it up.

# Real-Time Chat Application

A fully functional real-time chat app built with React and Socket.io featuring rooms, file sharing, typing indicators, reactions (one reaction per user per message), and read receipts.

---

## Table of Contents

- [Features](#features)  
- [Setup Instructions](#setup-instructions)  
- [How It Works](#how-it-works)  
- [Socket Events Explained](#socket-events-explained)  
- [Project Structure](#project-structure)  
- [Usage Guide](#usage-guide)  
- [Known Limitations & Future Work](#known-limitations--future-work)  

---

## Features

- **Multi-room chat:** Join or create chat rooms to talk with others.  
- **Real-time messaging:** Messages update instantly for all users in the room.  
- **File sharing:** Send and download file attachments securely.  
- **Typing indicators:** See when other users are typing.  
- **Message reactions:** React to messages with emojis. Each user can only react once per message; subsequent reactions replace the previous one.  
- **Read receipts:** Know who has read your messages in real-time.  
- **User presence:** See who’s online in each room.  
- **Automatic reconnection:** Handles disconnects and reconnects smoothly.  

---

## Setup Instructions

### Backend (Server)

1. Open terminal, navigate to the `server` folder:
    cd server

2. Install dependencies:
    pnpm install

3. Create a .env file in server root with the following:
    CLIENT_URL=http://localhost:3000
    PORT=5000

4. Start the server:
    pnpm dev

The server listens on port 5000 by default and handles Socket.io connections and message storage in-memory.

The server listens on port 5000 by default and handles Socket.io connections and message storage in-memory.

### Frontend (Client)

1. Open a new terminal, navigate to the client folder:
    cd client

2. Install dependencies:
    pnpm install

3. Start the React development server:
    pnpm start

4. Open your browser at http://localhost:3000  

# How It Works
On page load, the user enters a *username* and selects or creates a room.

The app connects to the server via Socket.io with the user and room info.

Messages sent include optional text or files, and the server broadcasts these to all users in the room.

Typing indicators are updated as users type.

Reactions allow users to click emojis below each message — only one reaction per user per message is allowed, updating previous reactions if they react again.

When a user reads a message, a read receipt is sent and displayed for all in the room.

User lists update in real-time showing all participants in the room.

All state is managed with React hooks, and socket events sync the real-time state between clients and server.

# Socket Events Explained

| Event             | Direction       | Purpose                                   |
| ----------------- | --------------- | ----------------------------------------- |
| `user_join`       | Client → Server | Join a room with username                 |
| `user_joined`     | Server → Client | Notify others a user joined               |
| `user_left`       | Server → Client | Notify others a user left                 |
| `send_message`    | Client → Server | Send message or file info                 |
| `receive_message` | Server → Client | Receive message with metadata             |
| `typing`          | Client → Server | Notify typing start/stop                  |
| `typing_users`    | Server → Client | List of users currently typing            |
| `react_message`   | Client → Server | Send reaction to a message                |
| `message_reacted` | Server → Client | Broadcast updated reactions for a message |
| `read_message`    | Client → Server | Notify server a message was read          |
| `read_receipt`    | Server → Client | Broadcast read receipt updates            |


## Features

- User join with username and room selection
- Real-time messaging with timestamps and sender info
- File attachment support
- Typing indicators showing who is typing
- Reactions on messages (one reaction per user per message)
- Read receipts to show who read which message
- Multiple rooms support with room switching
- Persistent message history loading

---

## Setup and Running

### Backend (Server)

1. Install dependencies:
   ```bash
   npm install express socket.io cors dotenv
   ```

2. Run the server:
   ```bash
   node server/server.js
   ```
   Server runs on port 5000 by default or as configured in `.env`.

### Frontend (Client)

1. Install dependencies:
   ```bash
   npm install react react-dom socket.io-client
   ```

2. Start the React app:
   ```bash
   npm start
   ```
   Runs on port 3000 by default.

---

## How it Works

### Socket Connection

- On component mount, the client connects to the socket server, joining a room with a username.
- Server tracks users, rooms, and messages in-memory.
- Messages are emitted and broadcast to room members.

### Sending Messages

- Messages can be text or include files.
- On send, client emits `send_message` with the message content.
- Server timestamps and stores messages, then broadcasts with sender info.

### Typing Indicator

- When a user types, client emits `typing` with true/false.
- Server tracks who is typing per room and broadcasts typing users.

### Reactions

- Users can react to messages with emojis.
- Each user can only react once per message.
- Reactions are stored on the message and broadcast to the room.

### Read Receipts

- When a message is read, client emits `read_message` with message ID.
- Server updates read status and broadcasts read receipts.

### Room Switching

- Users can select different rooms.
- On room change, client disconnects and reconnects to new room.
- Message history and users are loaded for the new room.

---

## File Structure Overview

- `/server/server.js`: Express + Socket.io backend server code
- `/src/components/Chat.js`: Main chat component, handles input and displays UI
- `/src/components/MessageList.js`: Renders chat messages and reactions
- `/src/components/UserList.js`: Shows users in the room
- `/src/components/TypingIndicator.js`: Shows who is typing
- `/src/hooks/useSocket.js`: Custom hook for socket connection, events, and state
- `/src/socket.js`: Socket.io client setup
- `.env`: Config file for server URL and ports

---

## ESLint Warnings Fixes

- Added missing dependencies in React useEffect hooks.
- Removed unused variables.
- Used `useCallback` to memoize handlers.

---

## Notes

- The app currently stores messages in server memory; for production use, integrate with a database.
- File sharing uses base64 encoding; consider optimizing for larger files.
- Reaction UX can be enhanced with animations or better UI.

---

Feel free to open issues or contribute improvements!