// server/server.js

const express = require('express');
const mongoose = require("mongoose");
const http = require('http');
const cors = require('cors');
const dotenv = require('dotenv');
const { Server } = require('socket.io');
const path = require('path');

dotenv.config();

const app = express();
// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB Atlas'))
.catch((err) => console.error('MongoDB connection error:', err));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000', // <-- fix here
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const users = {};
const messages = {}; // room: [messages]
const typing = {};
const readReceipts = {}; // userId: messageIds

// Utility to send messages paginated
function getPaginatedMessages(room, offset = 0, limit = 20) {
  const roomMessages = messages[room] || [];
  return roomMessages.slice(-offset - limit, -offset || undefined);
}

function getUsersInRoom(room) {
  return Object.values(users).filter((u) => u.room === room);
}

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join user to global room or custom room
  socket.on('user_join', ({ username, room }) => {
    if (!username) return;
    socket.username = username;
    socket.room = room || 'global';
    users[socket.id] = { id: socket.id, username, room: socket.room };
    socket.join(socket.room);

    // Notify others
    socket.to(socket.room).emit('user_joined', users[socket.id]);
    io.to(socket.room).emit('user_list', getUsersInRoom(socket.room));

    // Send chat history
    socket.emit('message_history', getPaginatedMessages(socket.room));
  });

  // Handle messages - content is an object { message, file? }
  socket.on('send_message', (data, ack) => {
    if (!messages[socket.room]) messages[socket.room] = [];

    const message = {
      id: Date.now(),
      sender: socket.username,
      senderId: socket.id,
      content: data.content || '', // message text
      room: socket.room,
      timestamp: new Date().toISOString(),
      reactions: [],
      readBy: [socket.id],
      file: data.file || null,  // optional file info
    };

    messages[socket.room].push(message);

    io.to(socket.room).emit('receive_message', message);

    if (ack) ack({ status: 'delivered', messageId: message.id });
  });

  // Read receipt
  socket.on('read_message', (messageId) => {
    for (const room in messages) {
      messages[room].forEach((m) => {
        if (m.id === messageId && !m.readBy.includes(socket.id)) {
          m.readBy.push(socket.id);
        }
      });
    }
    io.to(socket.room).emit('read_receipt', { messageId, userId: socket.id });
  });

  // Typing indicator
  socket.on('typing', (isTyping) => {
    typing[socket.room] = typing[socket.room] || {};
    if (isTyping) {
      typing[socket.room][socket.id] = socket.username;
    } else {
      delete typing[socket.room][socket.id];
    }
    io.to(socket.room).emit('typing_users', Object.values(typing[socket.room]));
  });

  // File sharing
  socket.on('share_file', (fileInfo) => {
    if (!messages[socket.room]) messages[socket.room] = [];

    const message = {
      ...fileInfo,
      id: Date.now(),
      sender: socket.username,
      timestamp: new Date().toISOString(),
      isFile: true,
    };
    messages[socket.room].push(message);
    io.to(socket.room).emit('receive_message', message);
  });

  // Reactions
    socket.on('add_reaction', ({ messageId, reaction }) => {
      const roomMessages = messages[socket.room] || [];
      for (const msg of roomMessages) {
        if (msg.id === messageId) {
          // Check if user already reacted
      const existingReactionIndex = msg.reactions.findIndex(r => r.user === socket.username);
      if (existingReactionIndex !== -1) {
        // Update existing reaction
        msg.reactions[existingReactionIndex].reaction = reaction;
      } else {
        msg.reactions.push({ user: socket.username, reaction });
      }
      io.to(socket.room).emit('reaction_added', { messageId, reactions: msg.reactions });
      break;
    }
    }
  });

  // Disconnect
  socket.on('disconnect', () => {
    const user = users[socket.id];
    if (!user) return;
    delete users[socket.id];
    delete typing[socket.room]?.[socket.id];
    socket.to(socket.room).emit('user_left', { username: user.username, id: socket.id });
    io.to(socket.room).emit('user_list', getUsersInRoom(socket.room));
  });
});

// API for message history
app.get('/api/messages/:room', (req, res) => {
  const room = req.params.room || 'global';
  const offset = parseInt(req.query.offset || 0);
  const limit = parseInt(req.query.limit || 20);
  const paginated = getPaginatedMessages(room, offset, limit);
  res.json(paginated);
});

const PORT = process.env.PORT;
server.listen(PORT, () => console.log(`Server listening on ${PORT}`));
