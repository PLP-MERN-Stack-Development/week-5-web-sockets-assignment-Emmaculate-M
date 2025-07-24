// socket.js - Updated Socket.io client setup

import { useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

// Create a socket instance in a function (to avoid stale/duplicate connections)
let socket;

const createSocket = () => {
  return io(process.env.REACT_APP_SOCKET_URL || 'https://my-chatapp-backend-aphc.onrender.com', {
    autoConnect: false,
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    withCredentials: true,
  });
};

socket = createSocket();

// Custom hook to use socket
export function useSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);

  const connect = useCallback((username, room) => {
    if (!username || !room) return;
    if (!socket.connected) socket.connect();
    socket.emit('user_join', { username, room });
  }, []);

  const disconnect = useCallback(() => {
    socket.disconnect();
    setMessages([]);
    setUsers([]);
    setTypingUsers([]);
  }, []);

  const sendMessage = useCallback((content) => {
    socket.emit('send_message', content);
  }, []);

  const sendPrivateMessage = useCallback((to, message) => {
    socket.emit('private_message', { to, message });
  }, []);

  const setTyping = useCallback((isTyping) => {
    socket.emit('typing', isTyping);
  }, []);

  useEffect(() => {
    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);
    const onReceiveMessage = (message) => {
      setLastMessage(message);
      setMessages((prev) => [...prev, message]);
    };
    const onPrivateMessage = (message) => {
      setLastMessage(message);
      setMessages((prev) => [...prev, message]);
    };
    const onMessageHistory = (history) => setMessages(history);
    const onUserList = (userList) => setUsers(userList);
    const onUserJoined = (user) => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          system: true,
          message: `${user.username} joined the chat`,
          timestamp: new Date().toISOString(),
        },
      ]);
    };
    const onUserLeft = (user) => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          system: true,
          message: `${user.username} left the chat`,
          timestamp: new Date().toISOString(),
        },
      ]);
    };
    const onTypingUsers = (typingUsersList) => setTypingUsers(typingUsersList);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('receive_message', onReceiveMessage);
    socket.on('private_message', onPrivateMessage);
    socket.on('message_history', onMessageHistory);
    socket.on('user_list', onUserList);
    socket.on('user_joined', onUserJoined);
    socket.on('user_left', onUserLeft);
    socket.on('typing_users', onTypingUsers);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('receive_message', onReceiveMessage);
      socket.off('private_message', onPrivateMessage);
      socket.off('message_history', onMessageHistory);
      socket.off('user_list', onUserList);
      socket.off('user_joined', onUserJoined);
      socket.off('user_left', onUserLeft);
      socket.off('typing_users', onTypingUsers);
    };
  }, []);

  return {
    socket,
    isConnected,
    lastMessage,
    messages,
    users,
    typingUsers,
    connect,
    disconnect,
    sendMessage,
    sendPrivateMessage,
    setTyping,
  };
}

export { socket };
