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


## Project Structure

- `/server/server.js`: Express + Socket.io backend server code
Manages users, rooms, messages, reactions, and read receipts in-memory.
- `/src/components/Chat.js`: Main chat component, handles input and displays UI
- `/src/components/MessageList.js`: Renders chat messages and reactions
- `/src/components/UserList.js`: Shows users in the room
- `/src/components/TypingIndicator.js`: Shows who is typing
- `/src/socket.js`: Custom hook for socket connection, events, and state &
Socket.io client setup
- `.env`: Config file for server URL and ports


## Usage Guide
- Open the app in your browser.

- Enter a username and a room name (or select from existing rooms).

- Send text messages or upload files using the chat interface.

- React to any message by clicking on emoji buttons shown below each message (only one reaction per user per message).

- Watch typing indicators when others are typing.

- See which users are currently in the room.

- Read receipts update to show who has read each message.

- Switch rooms anytime to chat with different groups.

## Known Limitations & Future Work
*Persistence:* Messages, reactions, and read receipts are stored only in memory — they will reset when the server restarts. Adding a database would fix this.

*Reactions UI:* Current emoji buttons are basic; an emoji picker and clearer user reaction indicators are planned.

*File previews:* Currently files can be downloaded but previews could be improved.

*User Authentication:* No login or persistent identity, which can be added later for privacy and security.

*Performance:* Large rooms and message histories might need pagination and optimization.

This is still work in progress. We'll keep improving as learn afresh.