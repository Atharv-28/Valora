const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const interviewController = require('../controllers/interviewController');
const { optionalAuth } = require('../middleware/optionalAuth');

// Configure multer for memory storage (better for cloud deployment like Render)
// Files are stored in memory as Buffer objects, not saved to disk
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed!'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Routes - optionalAuth allows both authenticated and guest users
router.post('/init', optionalAuth, upload.single('resume'), interviewController.initializeInterview);
router.post('/message', optionalAuth, interviewController.sendMessage);
router.post('/end', optionalAuth, interviewController.endInterview);
router.get('/status', interviewController.getSessionStatus);
router.get('/report/:sessionId', optionalAuth, interviewController.generateReport);

module.exports = router;
