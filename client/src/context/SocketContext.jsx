import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useSelector } from 'react-redux';

const SocketContext = createContext(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const userId = useSelector((state) => state.auth.userId);
  const user = useSelector((state) => state.auth.user);
  const role = user?.role; // Access role from user object
  const token = useSelector((state) => state.auth.token);
  const isAuthenticated = !!token; // Check if token exists

  useEffect(() => {
    if (!isAuthenticated) {
      // Disconnect socket if user is not authenticated
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setConnected(false);
      }
      return;
    }

    // Create socket connection
    const socketInstance = io(import.meta.env.VITE_API_BASE_URL || 'http://kodion-bidding.vercel.app', {
      transports: ['websocket', 'polling'],
      withCredentials: true,
    });

    socketInstance.on('connect', () => {
      console.log('✅ Socket connected:', socketInstance.id);
      console.log('👤 User ID:', userId);
      console.log('🔑 User Role:', role);
      setConnected(true);

      // Join user's personal room
      if (userId) {
        socketInstance.emit('join', userId);
        console.log('📍 Joined user room:', `user_${userId}`);
      }

      // If admin, join admin room
      if (role === 'admin') {
        socketInstance.emit('join_admin');
        console.log('👨‍💼 Admin joined admin room');
      }
    });

    socketInstance.on('disconnect', () => {
      console.log('❌ Socket disconnected');
      setConnected(false);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setConnected(false);
    });

    setSocket(socketInstance);

    // Cleanup on unmount
    return () => {
      socketInstance.disconnect();
    };
  }, [isAuthenticated, userId, role]);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
};
