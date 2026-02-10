/**
 * Pusher Client SDK - Client-side real-time connection
 *
 * This module provides client-side Pusher connection for receiving
 * real-time notifications in the browser.
 */

'use client';

import Pusher from 'pusher-js';

// Singleton pattern for Pusher client instance
let pusherClientInstance: Pusher | null = null;

/**
 * Get or create Pusher client instance
 * This ensures we only have one connection per browser session
 */
export function getPusherClient(): Pusher {
  if (!pusherClientInstance) {
    pusherClientInstance = new Pusher(
      process.env.NEXT_PUBLIC_PUSHER_KEY!,
      {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'us2',
        authEndpoint: '/api/pusher/auth', // For private channels (if needed later)
      }
    );

    // Log connection events for debugging
    if (process.env.NODE_ENV === 'development') {
      pusherClientInstance.connection.bind('connected', () => {
        console.log('✅ Pusher client connected');
      });

      pusherClientInstance.connection.bind('disconnected', () => {
        console.log('❌ Pusher client disconnected');
      });

      pusherClientInstance.connection.bind('error', (err: any) => {
        console.error('❌ Pusher connection error:', err);
      });
    }
  }

  return pusherClientInstance;
}

/**
 * Disconnect Pusher client
 * Useful for cleanup when user logs out
 */
export function disconnectPusher(): void {
  if (pusherClientInstance) {
    pusherClientInstance.disconnect();
    pusherClientInstance = null;
    console.log('🔌 Pusher client disconnected and cleaned up');
  }
}

export default getPusherClient;
