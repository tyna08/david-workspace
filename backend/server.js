const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const connectDB = require('./config/database');

const app = express();
const PORT = process.env.PORT || 10000; // Render uses 10000 by default

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration for Render
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://david-workspace.onrender.com', // Your Render URL (update after first deploy)
    'https://*.onrender.com' // Allow all Render URLs during deployment
  ],
  credentials: true
}));

// Import routes
const assignmentRoutes = require('./routes/assignments');
const userRoutes = require('./routes/users');
const submissionRoutes = require('./routes/submissions');

// Import middleware
const errorHandler = require('./middleware/errorHandler');

// API Routes (MUST come before static serving)
app.use('/api/assignments', assignmentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/submissions', submissionRoutes);

// API test route
app.get('/api', (req, res) => {
  res.json({ 
    message: 'David Nwokoloh Workspace Backend API',
    status: 'Running on Render!',
    endpoints: {
      assignments: '/api/assignments',
      users: '/api/users',
      submissions: '/api/submissions'
    }
  });
});

// Health check endpoint for Render
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date(),
    environment: process.env.NODE_ENV 
  });
});

// SERVE FRONTEND IN PRODUCTION
if (process.env.NODE_ENV === 'production') {
  // Serve static files from React build
  const frontendPath = path.join(__dirname, '..', 'frontend', 'build');
  
  console.log('Serving frontend from:', frontendPath);
  
  app.use(express.static(frontendPath));
  
  // Handle React routing - this MUST be last
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
} else {
  // Development mode - just show API info
  app.get('/', (req, res) => {
    res.json({ 
      message: 'Backend API running in development mode',
      note: 'Frontend should be running separately on port 3000'
    });
  });
}

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API route not found' });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server - Bind to 0.0.0.0 for Render
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`
    🚀 Server running on port ${PORT}
    📝 Environment: ${process.env.NODE_ENV || 'development'}
    🔗 URL: ${process.env.NODE_ENV === 'production' ? 'https://david-workspace.onrender.com' : `http://localhost:${PORT}`}
  `);
});

// Graceful shutdown for Render
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});
