const geminiService = require('../services/geminiService');
const resumeService = require('../services/resumeService');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');

class InterviewController {
    async initializeInterview(req, res) {
        try {
            console.log('\n🚀 ========== INTERVIEW INITIALIZATION ==========');
            console.log('📥 Request received');
            
            // Check if file was uploaded
            if (!req.file) {
                console.log('❌ No resume file uploaded');
                return res.status(400).json({
                    success: false,
                    message: 'Resume PDF is required'
                });
            }

            console.log(`✅ Resume file received: ${req.file.originalname}`);

            // Extract form data
            const { jobDescription, jobPosition, interviewType } = req.body;

            console.log(`   Job Position: ${jobPosition || 'junior'}`);
            console.log(`   Interview Type: ${interviewType || 'technical'}`);
            console.log(`   Job Description length: ${jobDescription?.length || 0} chars`);

            if (!jobDescription) {
                console.log('❌ No job description provided');
                return res.status(400).json({
                    success: false,
                    message: 'Job description is required'
                });
            }

            // Generate unique session ID
            const sessionId = uuidv4();
            console.log(`🔑 Generated session ID: ${sessionId}`);

            // Extract text from resume
            console.log('📄 Extracting text from resume...');
            const pdfBuffer = await fs.readFile(req.file.path);
            const resumeText = await resumeService.extractTextFromPDF(pdfBuffer);
            console.log(`✅ Resume text extracted: ${resumeText.length} characters`);

            // Initialize Gemini chat session
            console.log('🤖 Initializing Gemini session...');
            const firstQuestion = await geminiService.initializeSession(
                sessionId,
                jobDescription,
                jobPosition || 'junior',
                interviewType || 'technical',
                resumeText
            );

            console.log('✅ Session initialized successfully');
            console.log('📤 Sending response to frontend...');

            res.status(200).json({
                success: true,
                sessionId,
                message: firstQuestion,
                resumeInfo: resumeService.extractKeyInformation(resumeText)
            });

            console.log('✅ ========== INITIALIZATION COMPLETE ==========\n');

        } catch (error) {
            console.error('❌ ========== ERROR IN INITIALIZATION ==========');
            console.error('Error initializing interview:', error.message);
            console.error('Stack trace:', error.stack);
            console.error('====================================\n');
            res.status(500).json({
                success: false,
                message: 'Error initializing interview',
                error: error.message
            });
        }
    }

    async sendMessage(req, res) {
        try {
            console.log('\n💬 ========== MESSAGE EXCHANGE ==========');
            const { sessionId, message, context } = req.body;

            console.log(`📥 Received from frontend:`);
            console.log(`   Session ID: ${sessionId}`);
            console.log(`   User Message: "${message?.substring(0, 100)}${message?.length > 100 ? '...' : ''}"`);
            console.log(`   Context: Position=${context?.jobPosition}, Type=${context?.interviewType}`);

            if (!sessionId || !message) {
                console.log('❌ Missing session ID or message');
                return res.status(400).json({
                    success: false,
                    message: 'Session ID and message are required'
                });
            }

            console.log('🤖 Forwarding message to Gemini...');
            // Send message to Gemini and get response
            const response = await geminiService.sendMessage(sessionId, message);

            console.log('✅ Response received from Gemini');
            console.log('📤 Sending response to frontend...');

            res.status(200).json({
                success: true,
                message: response
            });

            console.log('✅ ========== MESSAGE EXCHANGE COMPLETE ==========\n');

        } catch (error) {
            console.error('❌ ========== ERROR IN MESSAGE EXCHANGE ==========');
            console.error('Error sending message:', error.message);
            console.error('Stack trace:', error.stack);
            console.error('====================================\n');
            res.status(500).json({
                success: false,
                message: 'Error processing message',
                error: error.message
            });
        }
    }

    async endInterview(req, res) {
        try {
            const { sessionId } = req.body;

            if (!sessionId) {
                return res.status(400).json({
                    success: false,
                    message: 'Session ID is required'
                });
            }

            const result = await geminiService.endSession(sessionId);

            res.status(200).json({
                success: true,
                message: 'Interview session ended',
                ...result
            });

        } catch (error) {
            console.error('Error ending interview:', error);
            res.status(500).json({
                success: false,
                message: 'Error ending interview',
                error: error.message
            });
        }
    }

    async getSessionStatus(req, res) {
        try {
            const activeCount = geminiService.getActiveSessionCount();
            
            res.status(200).json({
                success: true,
                activeSessions: activeCount
            });

        } catch (error) {
            console.error('Error getting session status:', error);
            res.status(500).json({
                success: false,
                message: 'Error getting session status',
                error: error.message
            });
        }
    }
}

module.exports = new InterviewController();
