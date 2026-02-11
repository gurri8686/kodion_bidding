/**
 * Pusher Server SDK - Replaces Socket.IO for Vercel serverless deployment
 *
 * This module provides server-side real-time notification functionality
 * using Pusher instead of Socket.IO (which doesn't work on Vercel).
 */

import Pusher from 'pusher';

// Initialize Pusher instance (singleton pattern)
let pusherInstance: Pusher | null = null;

/**
 * Get or create Pusher server instance
 */
export function getPusherServer(): Pusher {
  if (!pusherInstance) {
    pusherInstance = new Pusher({
      appId: process.env.PUSHER_APP_ID!,
      key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
      secret: process.env.PUSHER_SECRET!,
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'us2',
      useTLS: true,
    });
  }
  return pusherInstance;
}

/**
 * Send notification to a specific user's channel
 * Replaces: io.to(`user_${userId}`).emit('notification', data)
 */
export async function notifyUser(
  userId: number,
  event: string,
  data: any
): Promise<void> {
  const pusher = getPusherServer();

  try {
    await pusher.trigger(`user_${userId}`, event, data);
    console.log(`✅ Pusher: Sent ${event} to user_${userId}`);
  } catch (error) {
    console.error(`❌ Pusher error sending to user_${userId}:`, error);
    throw error;
  }
}

/**
 * Send notification to admin room
 * Replaces: io.to('admin_room').emit('admin_notification', data)
 */
export async function notifyAdmin(
  event: string,
  data: any
): Promise<void> {
  const pusher = getPusherServer();

  try {
    await pusher.trigger('admin_room', event, data);
    console.log(`✅ Pusher: Sent ${event} to admin_room`);
  } catch (error) {
    console.error(`❌ Pusher error sending to admin_room:`, error);
    throw error;
  }
}

/**
 * Send notification to multiple channels at once
 */
export async function notifyMultiple(
  channels: string[],
  event: string,
  data: any
): Promise<void> {
  const pusher = getPusherServer();

  try {
    await pusher.trigger(channels, event, data);
    console.log(`✅ Pusher: Sent ${event} to channels:`, channels);
  } catch (error) {
    console.error(`❌ Pusher error sending to multiple channels:`, error);
    throw error;
  }
}

export default getPusherServer;
