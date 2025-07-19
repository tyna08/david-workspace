const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/database');  // <-- ADD THIS LINE

const app = express();
const PORT = process.env.PORT || 5001;

// Connect to MongoDB
connectDB();  // <-- ADD THIS LINE

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://YOUR-RAILWAY-DOMAIN.up.railway.app', // Add your actual Railway URL here
    'https://*.up.railway.app' // This allows all Railway URLs
  ],
  credentials: true
}));


// Import routes
const assignmentRoutes = require('./routes/assignments');
const userRoutes = require('./routes/users');
const submissionRoutes = require('./routes/submissions');

// Import middleware
const errorHandler = require('./middleware/errorHandler');

// Basic route
app.get('/', (req, res) => {
  res.json({ 
    message: 'David Nwokoloh Workspace Backend API',
    endpoints: {
      assignments: '/api/assignments',
      users: '/api/users',
      submissions: '/api/submissions'
    }
  });
});

// Use routes
app.use('/api/assignments', assignmentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/submissions', submissionRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Test the API at:`);
  console.log(`  http://localhost:${PORT}/`);
  console.log(`  http://localhost:${PORT}/api/assignments`);
  console.log(`  http://localhost:${PORT}/api/assignments/subject/maths`);
});

