'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import Pusher, { Channel } from 'pusher-js';
import { getPusherClient, disconnectPusher } from '../notification/pusher-client';
import { useAppSelector } from '../store/hooks';

interface SocketContextType {
  pusher: Pusher | null;
  userChannel: Channel | null;
  adminChannel: Channel | null;
  connected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  pusher: null,
  userChannel: null,
  adminChannel: null,
  connected: false,
});

export function useSocket() {
  return useContext(SocketContext);
}

interface SocketProviderProps {
  children: React.ReactNode;
}

export function SocketProvider({ children }: SocketProviderProps) {
  const [pusher, setPusher] = useState<Pusher | null>(null);
  const [userChannel, setUserChannel] = useState<Channel | null>(null);
  const [adminChannel, setAdminChannel] = useState<Channel | null>(null);
  const [connected, setConnected] = useState(false);

  // Get user data from Redux store
  const userId = useAppSelector((state) => state.auth.userId);
  const user = useAppSelector((state) => state.auth.user);
  const isAuthenticated = useAppSelector((state) => !!state.auth.token);

  useEffect(() => {
    // Only connect if user is authenticated
    if (!isAuthenticated) {
      if (pusher) {
        disconnectPusher();
        setPusher(null);
        setUserChannel(null);
        setAdminChannel(null);
        setConnected(false);
      }
      return;
    }

    // Initialize Pusher client
    const pusherClient = getPusherClient();
    setPusher(pusherClient);

    // Connection event handlers
    pusherClient.connection.bind('connected', () => {
      console.log('✅ Pusher connected');
      setConnected(true);

      // Subscribe to user-specific channel
      if (userId) {
        const channel = pusherClient.subscribe(`user_${userId}`);
        setUserChannel(channel);
        console.log(`📍 Subscribed to user_${userId} channel`);
      }

      // Subscribe to admin channel if user is admin
      if (user?.role === 'admin') {
        const adminChan = pusherClient.subscribe('admin_room');
        setAdminChannel(adminChan);
        console.log('👨‍💼 Subscribed to admin_room channel');
      }
    });

    pusherClient.connection.bind('disconnected', () => {
      console.log('❌ Pusher disconnected');
      setConnected(false);
    });

    pusherClient.connection.bind('error', (err: any) => {
      console.error('❌ Pusher connection error:', err);
      setConnected(false);
    });

    pusherClient.connection.bind('state_change', (states: any) => {
      console.log(`🔄 Pusher state changed: ${states.previous} -> ${states.current}`);
    });

    // Cleanup on unmount or when authentication changes
    return () => {
      if (userChannel) {
        pusherClient.unsubscribe(`user_${userId}`);
      }
      if (adminChannel) {
        pusherClient.unsubscribe('admin_room');
      }
    };
  }, [isAuthenticated, userId, user?.role]);

  return (
    <SocketContext.Provider value={{ pusher, userChannel, adminChannel, connected }}>
      {children}
    </SocketContext.Provider>
  );
}
