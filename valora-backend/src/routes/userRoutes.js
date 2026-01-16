const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const firestoreService = require('../services/firestoreService');

// Get all user interviews
router.get('/interviews', verifyToken, async (req, res) => {
    try {
        console.log(`\n📊 Fetching interviews for user: ${req.user.uid}`);
        
        const interviews = await firestoreService.getUserInterviews(req.user.uid);
        
        res.status(200).json({
            success: true,
            count: interviews.length,
            interviews
        });
    } catch (error) {
        console.error('❌ Error fetching interviews:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching interviews',
            error: error.message
        });
    }
});

// Get specific interview
router.get('/interviews/:interviewId', verifyToken, async (req, res) => {
    try {
        const { interviewId } = req.params;
        console.log(`\n📄 Fetching interview: ${interviewId}`);
        
        const interview = await firestoreService.getInterviewById(interviewId, req.user.uid);
        
        if (!interview) {
            return res.status(404).json({
                success: false,
                message: 'Interview not found'
            });
        }
        
        res.status(200).json({
            success: true,
            interview
        });
    } catch (error) {
        console.error('❌ Error fetching interview:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching interview',
            error: error.message
        });
    }
});

// Get user analytics
router.get('/analytics', verifyToken, async (req, res) => {
    try {
        console.log(`\n📈 Generating analytics for user: ${req.user.uid}`);
        
        const analytics = await firestoreService.getUserAnalytics(req.user.uid);
        
        res.status(200).json({
            success: true,
            analytics
        });
    } catch (error) {
        console.error('❌ Error generating analytics:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating analytics',
            error: error.message
        });
    }
});

// Save interview (called after interview completion)
router.post('/interviews', verifyToken, async (req, res) => {
    try {
        const { sessionId, report, transcript, jobPosition, interviewType, difficulty, timeLimit, duration } = req.body;
        
        console.log(`\n💾 Saving interview for user: ${req.user.uid}`);
        
        const result = await firestoreService.saveInterview(req.user.uid, {
            sessionId,
            jobPosition,
            interviewType,
            difficulty,
            timeLimit,
            report,
            transcript,
            duration
        });
        
        res.status(200).json({
            success: true,
            ...result
        });
    } catch (error) {
        console.error('❌ Error saving interview:', error);
        res.status(500).json({
            success: false,
            message: 'Error saving interview',
            error: error.message
        });
    }
});

// Update user profile
router.post('/profile', verifyToken, async (req, res) => {
    try {
        const { name, email } = req.body;
        
        await firestoreService.createOrUpdateUser(req.user.uid, {
            name: name || req.user.name,
            email: email || req.user.email
        });
        
        res.status(200).json({
            success: true,
            message: 'Profile updated successfully'
        });
    } catch (error) {
        console.error('❌ Error updating profile:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating profile',
            error: error.message
        });
    }
});

module.exports = router;
