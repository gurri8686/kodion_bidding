/**
 * Socket.io server-side utilities for emitting events from API routes
 */

/**
 * Get the Socket.io instance
 * Available globally after server starts
 */
export function getSocketIO() {
  if (typeof global.io === 'undefined') {
    console.warn('Socket.io not initialized yet');
    return null;
  }
  return global.io;
}

/**
 * Emit notification to a specific user
 */
export function emitToUser(userId: number | string, event: string, data: any) {
  const io = getSocketIO();
  if (io) {
    io.to(`user_${userId}`).emit(event, data);
    console.log(`✓ Emitted ${event} to user ${userId}`);
  }
}

/**
 * Emit notification to all admins
 */
export function emitToAdmin(event: string, data: any) {
  const io = getSocketIO();
  if (io) {
    io.to('admin_room').emit(event, data);
    console.log(`✓ Emitted ${event} to admin room`);
  }
}

/**
 * Emit notification to all connected clients
 */
export function emitToAll(event: string, data: any) {
  const io = getSocketIO();
  if (io) {
    io.emit(event, data);
    console.log(`✓ Emitted ${event} to all clients`);
  }
}

/**
 * Check if Socket.io is initialized
 */
export function isSocketIOInitialized(): boolean {
  return typeof global.io !== 'undefined' && global.io !== null;
}
