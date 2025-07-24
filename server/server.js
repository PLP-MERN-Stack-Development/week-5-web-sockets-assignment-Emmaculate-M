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

// Setup server and socket
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      process.env.CLIENT_URL,
      'http://localhost:3000',
      'https://my-chatapp01-frontend.vercel.app/'
    ],
    methods: ['GET', 'POST'],
    credentials: true,
  },
   pingInterval: 25000,  
  pingTimeout: 60000
});

// Enable CORS for API routes
app.use(cors({
  origin: [
    process.env.CLIENT_URL,
    'http://localhost:3000',
    'https://my-chatapp01-frontend.vercel.app/'
  ],
  credentials: true,
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// In-memory storage
const users = {};
const messages = {};
const typing = {};
const readReceipts = {};

function getPaginatedMessages(room, offset = 0, limit = 20) {
  const roomMessages = messages[room] || [];
  return roomMessages.slice(-offset - limit, -offset || undefined);
}

function getUsersInRoom(room) {
  return Object.values(users).filter(u => u.room === room);
}

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('user_join', ({ username, room }) => {
    if (!username) return;

    socket.username = username;
    socket.room = room || 'global';
    users[socket.id] = { id: socket.id, username, room: socket.room };
    socket.join(socket.room);

    socket.to(socket.room).emit('user_joined', users[socket.id]);
    io.to(socket.room).emit('user_list', getUsersInRoom(socket.room));
    socket.emit('message_history', getPaginatedMessages(socket.room));
  });

  socket.on('send_message', (data, ack) => {
    if (!messages[socket.room]) messages[socket.room] = [];

    const message = {
      id: Date.now(),
      sender: socket.username,
      senderId: socket.id,
      content: data.content || '',
      room: socket.room,
      timestamp: new Date().toISOString(),
      reactions: [],
      readBy: [socket.id],
      file: data.file || null,
    };

    messages[socket.room].push(message);
    io.to(socket.room).emit('receive_message', message);
    if (ack) ack({ status: 'delivered', messageId: message.id });
  });

  socket.on('read_message', (messageId) => {
    for (const room in messages) {
      messages[room].forEach(m => {
        if (m.id === messageId && !m.readBy.includes(socket.id)) {
          m.readBy.push(socket.id);
        }
      });
    }
    io.to(socket.room).emit('read_receipt', { messageId, userId: socket.id });
  });

  socket.on('typing', (isTyping) => {
    typing[socket.room] = typing[socket.room] || {};
    if (isTyping) {
      typing[socket.room][socket.id] = socket.username;
    } else {
      delete typing[socket.room][socket.id];
    }
    io.to(socket.room).emit('typing_users', Object.values(typing[socket.room]));
  });

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

  socket.on('add_reaction', ({ messageId, reaction }) => {
    const roomMessages = messages[socket.room] || [];
    for (const msg of roomMessages) {
      if (msg.id === messageId) {
        const existing = msg.reactions.findIndex(r => r.user === socket.username);
        if (existing !== -1) {
          msg.reactions[existing].reaction = reaction;
        } else {
          msg.reactions.push({ user: socket.username, reaction });
        }
        io.to(socket.room).emit('reaction_added', { messageId, reactions: msg.reactions });
        break;
      }
    }
  });

  socket.on('disconnect', () => {
    const user = users[socket.id];
    if (!user) return;
    delete users[socket.id];
    delete typing[socket.room]?.[socket.id];
    socket.to(socket.room).emit('user_left', { username: user.username, id: socket.id });
    io.to(socket.room).emit('user_list', getUsersInRoom(socket.room));
  });
});

// REST endpoint
app.get('/api/messages/:room', (req, res) => {
  const room = req.params.room || 'global';
  const offset = parseInt(req.query.offset || 0);
  const limit = parseInt(req.query.limit || 20);
  const paginated = getPaginatedMessages(room, offset, limit);
  res.json(paginated);
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`CORS allowed for:`, process.env.CLIENT_URL);
});
