// Load environment variables from server/.env regardless of current working dir
require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const jobRoutes = require('./routes/jobRoutes');
const authRoutes = require("./routes/authRoutes");
const targetRoutes = require('./routes/targetRoutes');
const connectsRoutes = require('./routes/connectsRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const { connectDB, sequelize } = require('./config/db');
const adminRoutes = require('./routes/adminRoutes')
const path = require('path');
const cookieParser = require('cookie-parser');
const developerRoutes = require('./routes/developerRoutes');
const profileRoutes = require('./routes/profileRoutes');
const portfolioRoutes = require('./routes/portfolioRoutes');
// Dev-time diagnostic: show which DB env vars were loaded (do not leak passwords)
if (process.env.NODE_ENV === 'development') {
    console.log('Loaded DB env:', {
        MYSQL_DB_NAME: process.env.MYSQL_DB_NAME,
        MYSQL_DB_USER: process.env.MYSQL_DB_USER,
        MYSQL_DB_HOST: process.env.MYSQL_DB_HOST,
        MYSQL_DB_PORT: process.env.MYSQL_DB_PORT,
        MYSQL_DB_PASSWORD_EMPTY: process.env.MYSQL_DB_PASSWORD === '' || process.env.MYSQL_DB_PASSWORD === undefined,
    });
}
// Using MySQL only: warn if env vars are missing but continue using sensible defaults
(() => {
    const required = ['MYSQL_DB_NAME', 'MYSQL_DB_USER', 'MYSQL_DB_HOST'];
    const missing = required.filter((k) => process.env[k] === undefined);
    if (missing.length > 0) {
        console.warn('⚠️  Missing MySQL environment variables:', missing.join(', '));
        console.warn('Using defaults for local development. For production, set these in server/.env.');
    }
})();
// Delay importing models until after DB connection is established
let Job, ScrapeLog, User, IgnoredJob, AppliedJob, Technologies, UserTechnologies, TechnologyJobCount, Developer, Profiles, Logs, ConnectsLog, Platform, WeeklyTargets, Notification, Portfolio;

const app = express();
const server = http.createServer(app);

// Socket.IO configuration
const io = new Server(server, {
    cors: {
        origin: [
            'http://ec2-51-20-84-250.eu-north-1.compute.amazonaws.com:3000',
            'chrome-extension://lfnmgjkpcbabmbdjjnknamjmpegcdjai',
            'http://localhost:3000',
            'http://localhost:3001',
            'https://kodion-bidding.vercel.app', // Add your Vercel domain
            process.env.FRONTEND_URL, // Can be set in Railway env vars
        ].filter(Boolean), // Remove undefined values
        methods: ['GET', 'POST'],
        credentials: true,
    },
});

// Make io accessible throughout the app
app.set('io', io);

// 🔥 IMPORTANT: Middleware must be configured BEFORE routes
app.use(cookieParser()); // Add this line BEFORE your routes

app.use(cors({
    // origin:'http://localhost:3000',
    origin: [
        'http://ec2-51-20-84-250.eu-north-1.compute.amazonaws.com:3000',
        'chrome-extension://lfnmgjkpcbabmbdjjnknamjmpegcdjai',
        'http://localhost:3000',
        'http://localhost:3001',
        'https://kodion-bidding.vercel.app', // Add your Vercel domain
        process.env.FRONTEND_URL, // Can be set in Railway env vars
    ].filter(Boolean), // Remove undefined values
    // methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}));

app.use((req, res, next) => {
    let size = parseInt(req.headers['content-length'] || '0');
    console.log(`Incoming payload size: ${size} bytes`);
    next();
});

// 🔥 Must come BEFORE any routes
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ✅ API ROUTES MUST COME FIRST - BEFORE the catch-all route
app.use('/api/admin', adminRoutes);
app.use('/api/jobs', jobRoutes);
app.use("/api/auth", authRoutes);
app.use('/api', developerRoutes);
app.use('/api', profileRoutes);
app.use('/api', connectsRoutes);
app.use('/api',targetRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api', portfolioRoutes);

// Health check endpoint (useful for CI/local debug)
app.get('/api/health', async (req, res) => {
    try {
        await sequelize.authenticate();
        return res.json({ status: 'ok', db: 'connected' });
    } catch (err) {
        return res.status(503).json({ status: 'error', db: 'unavailable', error: err.message });
    }
});
// ✅ Static files and catch-all route MUST COME AFTER API routes
const fs = require('fs');
let staticPath = path.join(__dirname, 'dist');
// If server/dist doesn't exist (we keep client build under client/dist),
// fall back to client/dist so the backend can serve the frontend build.
if (!fs.existsSync(staticPath)) {
    const clientDist = path.join(__dirname, '..', 'client', 'dist');
    if (fs.existsSync(clientDist)) {
        console.warn('⚠️  server/dist not found — serving static files from client/dist');
        staticPath = clientDist;
    }
}
console.log(`Serving static files from: ${staticPath}`);
app.use(express.static(staticPath));

// ✅ This catch-all route should be LAST
app.get('*', (req, res) => {
  if (req.path.startsWith('/api') || req.path.includes('.')) {
    return res.status(404).send('Not Found');
  }
  res.sendFile(path.join(staticPath, 'index.html'));
});

const syncModels = async () => {
    try {
        // Import models after DB initialization so they bind to the active sequelize instance
        const models = require('./models/index');
        ({ Job, IgnoredJob, User, AppliedJob, ScrapeLog, Technologies, UserTechnologies, TechnologyJobCount, Developer, Profiles, Logs, ConnectsLog, Platform, WeeklyTargets, Notification } = models);

        await Job.sync({ alter: false, force: false });
        await IgnoredJob.sync({ alter: false, force: false });
        await User.sync({ alter: false, force: false });
        await AppliedJob.sync({ alter: false, force: false });
        await ScrapeLog.sync({ alter: false, force: false });
        await Technologies.sync({ alter: false, force: false });
        await UserTechnologies.sync({ alter: false, force: false });
        await TechnologyJobCount.sync({ alter: false, force: false });
        await Developer.sync({ alter: false, force: false });
        await Profiles.sync({ alter: false, force: false });
        await Logs.sync({ alter: false, force: false });
        await ConnectsLog.sync({ alter: false, force: false });
        await Platform.sync({ alter: false, force: false });
        await WeeklyTargets.sync({ alter: false, force: false });
        await Notification.sync({ alter: false, force: false });
        console.log('✅ All models synced safely without affecting data!');
    } catch (error) {
        console.error('❌ Error syncing models:', error);
    }
};

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('🔌 User connected:', socket.id);

    // User joins their own room (for targeted notifications)
    socket.on('join', (userId) => {
        socket.join(`user_${userId}`);
        console.log(`👤 User ${userId} joined their room`);
    });

    // Admin joins admin room
    socket.on('join_admin', () => {
        socket.join('admin_room');
        console.log('👨‍💼 Admin joined admin room');
    });

    socket.on('disconnect', () => {
        console.log('🔌 User disconnected:', socket.id);
    });
});

// Start server only after DB connection and sync
const startServer = async () => {
    try {
        await connectDB();      // Connect to MySQL
        await syncModels();     // Sync tables
        const PORT = process.env.PORT || 5000;
        server.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📡 Socket.IO ready for connections`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
    }
};

startServer(); // 👈 Start everything

module.exports = { io };