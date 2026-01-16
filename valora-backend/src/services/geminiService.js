const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiService {
    constructor() {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY is not set in environment variables');
        }
        
        console.log('🔧 Initializing Gemini Service...');
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        this.activeSessions = new Map();
        console.log('✅ Gemini Service initialized with model: gemini-2.5-flash');
    }

    createInterviewPrompt(jobDescription, jobPosition, interviewType, resumeText, timeLimit, difficulty) {
        // Concise interview focus
        const focusMap = {
            'technical': 'Technical skills, problem-solving, coding, system design.',
            'hr': 'Behavioral, teamwork, communication, career goals.',
            'hybrid': 'Balance technical AND behavioral questions.'
        };

        // Concise difficulty guidance
        const difficultyMap = {
            'easy': 'Ask straightforward, fundamental questions.',
            'medium': 'Ask moderately challenging practical questions.',
            'hard': 'Ask advanced questions requiring deep analysis.'
        };

        const basePrompt = `You are Valora, AI interviewer for ${jobPosition} (${interviewType}, ${timeLimit}min, ${difficulty}).

Job: ${jobDescription}

Resume: ${resumeText || 'Will analyze separately'}

Role: ${focusMap[interviewType] || focusMap['technical']} ${difficultyMap[difficulty] || difficultyMap['medium']}

RULES:
1. End EVERY response with a question (?)
2. Max 2-3 sentences per response
3. No repeated questions
4. Format: [Brief comment] + [Question]

Example: "Good React experience. How would you handle state in large apps?"`;

        return basePrompt;
    }

    async initializeSession(sessionId, jobDescription, jobPosition, interviewType, resumeText = '', timeLimit = '15', difficulty = 'medium') {
        try {
            console.log(`\n📝 Initializing session: ${sessionId}`);
            console.log(`   Position: ${jobPosition}`);
            console.log(`   Type: ${interviewType}`);
            console.log(`   Time Limit: ${timeLimit} minutes`);
            console.log(`   Difficulty: ${difficulty}`);
            
            const systemPrompt = this.createInterviewPrompt(
                jobDescription,
                jobPosition,
                interviewType,
                resumeText,
                timeLimit,
                difficulty
            );

            console.log(`   System prompt length: ${systemPrompt.length} characters`);

            const chat = this.model.startChat({
                history: [
                    {
                        role: 'user',
                        parts: [{ text: systemPrompt }]
                    },
                    {
                        role: 'model',
                        parts: [{ text: 'Ready to interview. Will end every response with a question.' }]
                    }
                ],
                generationConfig: {
                    maxOutputTokens: 250, // Reduced from 500
                    temperature: 0.7,
                }
            });

            this.activeSessions.set(sessionId, {
                chat, // The chat object maintains FULL conversation history automatically via Gemini SDK
                jobDescription,
                jobPosition,
                interviewType,
                timeLimit,
                difficulty,
                startTime: new Date(),
                messageCount: 0,
                transcript: [] // Store full conversation for report generation
                // IMPORTANT: The Gemini SDK's chat.sendMessage() automatically includes ALL previous
                // messages in each request. The AI maintains full context throughout the interview.
                // Token optimization is achieved through: compressed prompts, reduced maxOutputTokens,
                // and embedded report generation to avoid re-sending transcript separately.
            });

            console.log(`   📤 Sending initial message to Gemini...`);
            // Get first question
            const result = await chat.sendMessage("Please start the interview with an opening question.");
            const response = result.response.text();

            console.log(`   ✅ Got first question from Gemini: "${response.substring(0, 100)}..."`);
            return response;
        } catch (error) {
            console.error('❌ Error initializing session:', error.message);
            console.error('   Full error:', error);
            throw error;
        }
    }

    async sendMessage(sessionId, message, timeRemaining = null) {
        try {
            console.log(`\n💬 User message received for session: ${sessionId}`);
            console.log(`   Message: "${message.substring(0, 100)}${message.length > 100 ? '...' : ''}"`);
            console.log(`   Time Remaining: ${timeRemaining !== null ? `${timeRemaining} seconds` : 'Not provided'}`);
            
            const session = this.activeSessions.get(sessionId);
            
            if (!session) {
                console.error(`❌ Session not found: ${sessionId}`);
                throw new Error('Session not found');
            }

            // Build enhanced message with context
            let enhancedMessage = message;
            
            // Add time remaining context
            if (timeRemaining !== null) {
                const minutes = Math.floor(timeRemaining / 60);
                const seconds = timeRemaining % 60;
                enhancedMessage += `\n\n[INTERVIEWER NOTE: Time remaining: ${minutes}m ${seconds}s`;
                
                // If less than 60 seconds remaining, instruct AI to wrap up and generate report
                if (timeRemaining < 60) {
                    enhancedMessage += `. CRITICAL: <60s left! End interview after this. Give brief closing (1-2 sentences).\n\nThen add "\n\n---REPORT---\n" followed by JSON report:{"overallScore":<0-10>,"scoringBreakdown":{"technicalAccuracy":<0-10>,"communicationClarity":<0-10>,"confidenceIndex":<0-10>},"questionAnalysis":[{"question":"<q>","answer":"<a>","feedback":"<feedback>"}],"topMistakes":["<m1>","<m2>","<m3>","<m4>","<m5>"],"strengths":["<s1>","<s2>","<s3>","<s4>","<s5>"],"summary":"<2-3 sentences>"}.Reference actual answers.]`;
                } else {
                    enhancedMessage += `]`;
                }
            }

            console.log(`   📤 Sending to Gemini...`);
            const result = await session.chat.sendMessage(enhancedMessage);
            const response = result.response.text();
            
            session.messageCount++;

            // Store in transcript
            session.transcript.push(
                { speaker: 'user', text: message },
                { speaker: 'bot', text: response }
            );

            console.log(`   ✅ Got response from Gemini: "${response.substring(0, 100)}${response.length > 100 ? '...' : ''}"`);
            console.log(`   Message count: ${session.messageCount}`);
            
            // Check if interview should end (less than 60 seconds remaining - matches the outro threshold)
            const shouldEndInterview = timeRemaining !== null && timeRemaining < 60;
            
            // Extract report if present in the outro response
            let extractedReport = null;
            if (shouldEndInterview && response.includes('---REPORT---')) {
                const reportStart = response.indexOf('---REPORT---');
                const reportJson = response.substring(reportStart + 12).trim();
                try {
                    extractedReport = JSON.parse(reportJson);
                    session.report = extractedReport; // Store report in session
                    console.log('   📊 Report extracted and stored in session');
                } catch (error) {
                    console.error('   ⚠️ Failed to parse embedded report:', error.message);
                }
            }
            
            return {
                message: response,
                shouldEndInterview,
                timeRemaining
            };
        } catch (error) {
            console.error(`❌ Error sending message:`, error.message);
            console.error('   Full error:', error);
            throw error;
        }
    }

    async endSession(sessionId) {
        try {
            const session = this.activeSessions.get(sessionId);
            
            if (!session) {
                return { success: false, message: 'Session not found' };
            }

            const sessionInfo = {
                duration: new Date() - session.startTime,
                messageCount: session.messageCount,
                jobPosition: session.jobPosition,
                interviewType: session.interviewType
            };

            // Mark session as ended but keep it for report generation
            session.ended = true;
            session.endTime = new Date();
            
            // Auto-cleanup after 1 hour to prevent memory leaks
            setTimeout(() => {
                this.activeSessions.delete(sessionId);
                console.log(`🗑️ Session ${sessionId} auto-cleaned up after 1 hour`);
            }, 3600000); // 1 hour

            return { success: true, sessionInfo };
        } catch (error) {
            console.error('Error ending session:', error);
            throw error;
        }
    }

    getActiveSessionCount() {
        return this.activeSessions.size;
    }

    getSessionData(sessionId) {
        const session = this.activeSessions.get(sessionId);
        if (!session) {
            return null;
        }

        return {
            sessionId,
            jobDescription: session.jobDescription,
            jobPosition: session.jobPosition,
            interviewType: session.interviewType,
            timeLimit: session.timeLimit,
            difficulty: session.difficulty,
            transcript: session.transcript,
            messageCount: session.messageCount,
            startTime: session.startTime,
            report: session.report || null // Include pre-generated report if available
        };
    }
}

module.exports = new GeminiService();
