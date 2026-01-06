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

    createInterviewPrompt(jobDescription, jobPosition, interviewType, resumeText) {
        const basePrompt = `You are Valora, an AI interviewer conducting a ${interviewType} interview for a ${jobPosition} position.

Job Description:
${jobDescription}

Candidate's Resume:
${resumeText || 'Resume information will be analyzed separately'}

Your role:
- Ask relevant interview questions based on the job description and position level
- For technical interviews: Focus on technical skills, problem-solving, coding concepts, and system design
- For HR interviews: Focus on behavioral questions, team fit, communication skills, and career goals
- Be conversational and professional
- Ask follow-up questions based on candidate responses

CRITICAL RULES:
1. EVERY response MUST end with a clear, direct question
2. Keep responses concise (2-3 sentences maximum, including the question)
3. Never repeat questions already asked
4. Format: [Brief acknowledgment/comment] + [Clear Question]
5. Example: "That's great experience with React. How would you handle state management in a large-scale application?"

Remember: ALWAYS end your response with a question mark (?). Your response is incomplete without a question.`;

        return basePrompt;
    }

    async initializeSession(sessionId, jobDescription, jobPosition, interviewType, resumeText = '') {
        try {
            console.log(`\n📝 Initializing session: ${sessionId}`);
            console.log(`   Position: ${jobPosition}`);
            console.log(`   Type: ${interviewType}`);
            
            const systemPrompt = this.createInterviewPrompt(
                jobDescription,
                jobPosition,
                interviewType,
                resumeText
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

    async sendMessage(sessionId, message) {
        try {
            console.log(`\n💬 User message received for session: ${sessionId}`);
            console.log(`   Message: "${message.substring(0, 100)}${message.length > 100 ? '...' : ''}"`);
            
            const session = this.activeSessions.get(sessionId);
            
            if (!session) {
                console.error(`❌ Session not found: ${sessionId}`);
                throw new Error('Session not found');
            }

            console.log(`   📤 Sending to Gemini...`);
            const result = await session.chat.sendMessage(message);
            const response = result.response.text();
            
            session.messageCount++;

            console.log(`   ✅ Got response from Gemini: "${response.substring(0, 100)}${response.length > 100 ? '...' : ''}"`);
            console.log(`   Message count: ${session.messageCount}`);
            
            return response;
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
