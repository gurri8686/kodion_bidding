const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const express = require('express');
const { Server } = require('socket.io');
const cookieParser = require('cookie-parser');
const cors = require('cors');
require('dotenv').config({ path: '.env.local' });

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

// Initialize Next.js
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const expressApp = express();
  const server = createServer(expressApp);

  // Socket.io setup with CORS
  const io = new Server(server, {
    cors: {
      origin: process.env.NODE_ENV === 'production'
        ? process.env.NEXT_PUBLIC_APP_URL
        : ['http://localhost:3000', 'http://127.0.0.1:3000'],
      credentials: true,
      methods: ['GET', 'POST']
    },
    transports: ['websocket', 'polling']
  });

  // Socket.io connection handling
  io.on('connection', (socket) => {
    console.log('✓ User connected:', socket.id);

    // Join user-specific room
    socket.on('join', (userId) => {
      socket.join(`user_${userId}`);
      console.log(`✓ User ${userId} joined personal room`);
    });

    // Join admin room
    socket.on('join_admin', () => {
      socket.join('admin_room');
      console.log('✓ Admin joined admin room');
    });

    // Leave rooms
    socket.on('leave', (userId) => {
      socket.leave(`user_${userId}`);
      console.log(`✓ User ${userId} left personal room`);
    });

    socket.on('disconnect', () => {
      console.log('✗ User disconnected:', socket.id);
    });
  });

  // Make Socket.io instance globally available
  global.io = io;

  // Middleware
  expressApp.use(cors({
    origin: process.env.NODE_ENV === 'production'
      ? process.env.NEXT_PUBLIC_APP_URL
      : ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true
  }));
  expressApp.use(cookieParser());
  expressApp.use(express.json());
  expressApp.use(express.urlencoded({ extended: true }));

  // Serve uploaded files
  expressApp.use('/uploads', express.static('uploads'));

  // Handle all requests with Next.js
  expressApp.use((req, res) => {
    // Make io available in API routes via headers
    req.io = io;
    return handle(req, res);
  });

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`\n✓ Ready on http://${hostname}:${port}`);
    console.log(`✓ Socket.io server running`);
    console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}\n`);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
      console.log('HTTP server closed');
      process.exit(0);
    });
  });
});
