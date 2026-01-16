const geminiService = require('../services/geminiService');
const resumeService = require('../services/resumeService');
const reportService = require('../services/reportService');
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
            const { jobDescription, jobPosition, interviewType, timeLimit, difficulty } = req.body;

            console.log(`   Job Position: ${jobPosition || 'junior'}`);
            console.log(`   Interview Type: ${interviewType || 'technical'}`);
            console.log(`   Time Limit: ${timeLimit || '15'} minutes`);
            console.log(`   Difficulty: ${difficulty || 'medium'}`);
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
            // With memoryStorage, file buffer is available directly in req.file.buffer
            const pdfBuffer = req.file.buffer;
            const resumeText = await resumeService.extractTextFromPDF(pdfBuffer);
            console.log(`✅ Resume text extracted: ${resumeText.length} characters`);

            // Initialize Gemini chat session
            console.log('🤖 Initializing Gemini session...');
            const firstQuestion = await geminiService.initializeSession(
                sessionId,
                jobDescription,
                jobPosition || 'junior',
                interviewType || 'technical',
                resumeText,
                timeLimit || '15',
                difficulty || 'medium'
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
            console.log(`   Time Remaining: ${context?.timeRemaining} seconds`);

            if (!sessionId || !message) {
                console.log('❌ Missing session ID or message');
                return res.status(400).json({
                    success: false,
                    message: 'Session ID and message are required'
                });
            }

            // Set a longer timeout for this request (2 minutes)
            req.setTimeout(120000);

            console.log('🤖 Forwarding message to Gemini...');
            console.log('⏳ Waiting for complete response (no timeout)...');
            
            // Send message to Gemini with context - let it take all the time it needs
            const response = await geminiService.sendMessage(
                sessionId, 
                message, 
                context?.timeRemaining
            );

            console.log('✅ Response received from Gemini');
            console.log(`📊 Response length: ${response.message?.length || response.length} characters`);
            console.log(`⏰ Should end interview: ${response.shouldEndInterview || false}`);
            console.log('📤 Sending response to frontend...');

            res.status(200).json({
                success: true,
                message: response.message || response,
                shouldEndInterview: response.shouldEndInterview || false
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

    async generateReport(req, res) {
        try {
            console.log('\n📊 ========== GENERATE REPORT REQUEST ==========');
            const { sessionId } = req.params;

            console.log(`   Session ID: ${sessionId}`);

            if (!sessionId) {
                console.log('❌ No session ID provided');
                return res.status(400).json({
                    success: false,
                    message: 'Session ID is required'
                });
            }

            // Get session data including transcript
            const sessionData = geminiService.getSessionData(sessionId);

            if (!sessionData) {
                console.log('❌ Session not found');
                return res.status(404).json({
                    success: false,
                    message: 'Session not found or has expired'
                });
            }

            if (!sessionData.transcript || sessionData.transcript.length === 0) {
                console.log('❌ No transcript data available');
                return res.status(400).json({
                    success: false,
                    message: 'No transcript data available for this session'
                });
            }

            console.log(`   Transcript length: ${sessionData.transcript.length} messages`);
            
            let report;
            
            // Check if report was already generated during outro
            if (sessionData.report) {
                console.log('   ✅ Using pre-generated report from interview outro');
                report = sessionData.report;
            } else {
                console.log('   Generating report with AI...');
                // Generate report using AI (fallback if not generated during outro)
                report = await reportService.generateReport(sessionData, sessionData.transcript);
                console.log('✅ Report generated successfully');
            }
            console.log(`   Overall Score: ${report.overallScore}/10`);
            console.log('📤 Sending report to frontend...');

            res.status(200).json({
                success: true,
                report: report
            });

            console.log('✅ ========== REPORT GENERATION COMPLETE ==========\n');

        } catch (error) {
            console.error('❌ Error generating report:', error);
            res.status(500).json({
                success: false,
                message: 'Error generating report',
                error: error.message
            });
        }
    }
}

module.exports = new InterviewController();
