'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  connected: false
});

export function useSocket() {
  return useContext(SocketContext);
}

interface SocketProviderProps {
  children: React.ReactNode;
}

export function SocketProvider({ children }: SocketProviderProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Get Socket.io URL from environment or default to current host
    const socketUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;

    // Initialize Socket.io client
    const socketInstance = io(socketUrl, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    // Connection handlers
    socketInstance.on('connect', () => {
      console.log('✓ Socket.io connected:', socketInstance.id);
      setConnected(true);
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('✗ Socket.io disconnected:', reason);
      setConnected(false);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('✗ Socket.io connection error:', error.message);
      setConnected(false);
    });

    socketInstance.on('reconnect', (attemptNumber) => {
      console.log(`✓ Socket.io reconnected after ${attemptNumber} attempts`);
      setConnected(true);
    });

    socketInstance.on('reconnect_error', (error) => {
      console.error('✗ Socket.io reconnection error:', error.message);
    });

    socketInstance.on('reconnect_failed', () => {
      console.error('✗ Socket.io reconnection failed');
    });

    setSocket(socketInstance);

    // Cleanup on unmount
    return () => {
      console.log('✓ Disconnecting Socket.io');
      socketInstance.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
}
