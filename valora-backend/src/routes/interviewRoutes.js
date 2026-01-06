const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const interviewController = require('../controllers/interviewController');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'resume-' + uniqueSuffix + path.extname(file.originalname));
  }
});

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

// Routes
router.post('/init', upload.single('resume'), interviewController.initializeInterview);
router.post('/message', interviewController.sendMessage);
router.post('/end', interviewController.endInterview);
router.get('/status', interviewController.getSessionStatus);

module.exports = router;
