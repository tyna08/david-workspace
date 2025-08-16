const express = require('express');
const cors = require('cors');
const path = require('path');  // ADD THIS
require('dotenv').config();
const connectDB = require('./config/database');

const app = express();
const PORT = process.env.PORT || 5001;

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://david-workspace-production.up.railway.app', // UPDATE with your actual URL
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
    endpoints: {
      assignments: '/api/assignments',
      users: '/api/users',
      submissions: '/api/submissions'
    }
  });
});

// SERVE FRONTEND IN PRODUCTION - ADD THIS SECTION
if (process.env.NODE_ENV === 'production') {
  // Assuming your frontend build is in a 'frontend/build' folder
  // Adjust the path based on your folder structure
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  
  // Handle React routing, return all requests to React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
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

// Start server - IMPORTANT: Bind to 0.0.0.0 for Railway
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  if (process.env.NODE_ENV === 'production') {
    console.log('Running in PRODUCTION mode - serving frontend');
  } else {
    console.log('Running in DEVELOPMENT mode');
  }
});
