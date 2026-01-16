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
        // Define interview focus based on type
        let interviewFocus = '';
        if (interviewType === 'technical') {
            interviewFocus = 'Focus on technical skills, problem-solving, coding concepts, system design, and technical expertise.';
        } else if (interviewType === 'hr') {
            interviewFocus = 'Focus on behavioral questions, team fit, communication skills, career goals, and soft skills.';
        } else if (interviewType === 'hybrid') {
            interviewFocus = 'Balance between technical and HR questions. Cover both technical skills AND behavioral/soft skills aspects.';
        }

        // Define difficulty expectations
        let difficultyGuidance = '';
        if (difficulty === 'easy') {
            difficultyGuidance = 'Keep questions straightforward and fundamental. Focus on basic concepts and understanding.';
        } else if (difficulty === 'medium') {
            difficultyGuidance = 'Ask moderately challenging questions that require practical knowledge and some analytical thinking.';
        } else if (difficulty === 'hard') {
            difficultyGuidance = 'Ask advanced, complex questions that test deep understanding, problem-solving, and critical thinking.';
        }

        const basePrompt = `You are Valora, an AI interviewer conducting a ${interviewType} interview for a ${jobPosition} position.

Interview Configuration:
- Time Limit: ${timeLimit} minutes
- Difficulty Level: ${difficulty}
- Interview Type: ${interviewType}

Job Description:
${jobDescription}

Candidate's Resume:
${resumeText || 'Resume information will be analyzed separately'}

Your role:
${interviewFocus}
${difficultyGuidance}
- Ask relevant interview questions based on the job description and position level
- Be conversational and professional
- Ask follow-up questions based on candidate responses
- Adjust pacing to fit within the ${timeLimit}-minute time frame

CRITICAL RULES:
1. EVERY response MUST end with a clear, direct question
2. Keep responses concise (2-3 sentences maximum, including the question)
3. Never repeat questions already asked
4. Format: [Brief acknowledgment/comment] + [Clear Question]
5. Example: "That's great experience with React. How would you handle state management in a large-scale application?"

Remember: ALWAYS end your response with a question mark (?). Your response is incomplete without a question.`;

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
                        parts: [{ text: 'Understood. I am ready to conduct the interview. Every response will end with a clear question.' }]
                    }
                ],
                generationConfig: {
                    maxOutputTokens: 500,
                    temperature: 0.7,
                }
            });

            this.activeSessions.set(sessionId, {
                chat,
                jobDescription,
                jobPosition,
                interviewType,
                timeLimit,
                difficulty,
                startTime: new Date(),
                messageCount: 0
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

    async sendMessage(sessionId, message, timeRemaining = null, snapshot = null) {
        try {
            console.log(`\n💬 User message received for session: ${sessionId}`);
            console.log(`   Message: "${message.substring(0, 100)}${message.length > 100 ? '...' : ''}"`);
            console.log(`   Time Remaining: ${timeRemaining !== null ? `${timeRemaining} seconds` : 'Not provided'}`);
            console.log(`   Snapshot: ${snapshot ? 'Provided for analysis' : 'Not provided'}`);
            
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
                enhancedMessage += `\n\n[INTERVIEWER NOTE: Time remaining in interview: ${minutes}m ${seconds}s`;
                
                // If less than 1 minute remaining, instruct AI to wrap up
                if (timeRemaining < 60) {
                    enhancedMessage += `. CRITICAL: Less than 1 minute remaining! You MUST conclude the interview now. Provide a brief, warm closing statement thanking the candidate and wishing them well. Do NOT ask any more questions. Keep it under 2 sentences.]`;
                } else {
                    enhancedMessage += `]`;
                }
                
                // If less than 1 minute remaining, instruct AI to wrap up
                if (timeRemaining < 60) {
                    enhancedMessage += `. CRITICAL: Less than 1 minute remaining! You MUST conclude the interview now. Provide a brief, warm closing statement thanking the candidate and wishing them well. Do NOT ask any more questions. Keep it under 2 sentences.]`;
                } else {
                    enhancedMessage += `]`;
                }
            }

            // Prepare message parts
            const messageParts = [{ text: enhancedMessage }];

            // Add snapshot for visual analysis if provided
            if (snapshot) {
                try {
                    // Remove data URL prefix if present
                    const base64Data = snapshot.replace(/^data:image\/\w+;base64,/, '');
                    
                    messageParts.push({
                        inlineData: {
                            mimeType: 'image/jpeg',
                            data: base64Data
                        }
                    });
                    
                    // Add instruction for AI to analyze the image
                    messageParts.push({
                        text: '\n\n[INTERVIEWER NOTE: Analyze the candidate\'s visual cues from the provided image. Consider their body language, facial expressions, confidence level, nervousness indicators, eye contact, and overall presentation. Subtly adjust your questioning or provide encouragement if needed based on their demeanor.]'
                    });
                    
                    console.log('   📸 Snapshot added to message for visual analysis');
                } catch (snapshotError) {
                    console.error('   ⚠️ Error processing snapshot:', snapshotError.message);
                    // Continue without snapshot if there's an error
                }
            }

            console.log(`   📤 Sending to Gemini...`);
            const result = await session.chat.sendMessage(messageParts);
            const response = result.response.text();
            
            session.messageCount++;

            console.log(`   ✅ Got response from Gemini: "${response.substring(0, 100)}${response.length > 100 ? '...' : ''}"`);
            console.log(`   Message count: ${session.messageCount}`);
            
            // Check if interview should end (less than 1 minute remaining)
            const shouldEndInterview = timeRemaining !== null && timeRemaining < 60;
            
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

            this.activeSessions.delete(sessionId);

            return { success: true, sessionInfo };
        } catch (error) {
            console.error('Error ending session:', error);
            throw error;
        }
    }

    getActiveSessionCount() {
        return this.activeSessions.size;
    }
}

module.exports = new GeminiService();
