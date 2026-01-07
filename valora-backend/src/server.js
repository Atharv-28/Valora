require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const interviewRoutes = require('./routes/interviewRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Increase server timeout for long-running Gemini requests
app.use((req, res, next) => {
  req.setTimeout(120000); // 2 minutes
  res.setTimeout(120000); // 2 minutes
  next();
});

// Routes
app.use('/api/interview', interviewRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Server is running',
    geminiConfigured: !!process.env.GEMINI_API_KEY
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      message: 'File upload error',
      error: err.message
    });
  }
  
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
  console.log(`✅ Gemini API configured: ${!!process.env.GEMINI_API_KEY}`);
  console.log(`✅ Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
