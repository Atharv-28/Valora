const { GoogleGenerativeAI } = require('@google/generative-ai');

class ReportService {
    constructor() {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY is not set in environment variables');
        }
        
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        console.log('✅ Report Service initialized');
    }

    async generateReport(sessionData, transcript) {
        try {
            console.log('\n📊 ========== GENERATING REPORT ==========');
            console.log(`   Session ID: ${sessionData.sessionId}`);
            console.log(`   Transcript items: ${transcript.length}`);

            const reportPrompt = this.createReportPrompt(sessionData, transcript);
            
            const result = await this.model.generateContent({
                contents: [{ role: 'user', parts: [{ text: reportPrompt }] }],
                generationConfig: {
                    maxOutputTokens: 3000,
                    temperature: 0.3, // Lower temperature for more consistent analysis
                }
            });

            const response = result.response.text();
            console.log('✅ Report generated successfully');
            
            // Parse the JSON response
            const reportData = this.parseReportResponse(response);
            
            return reportData;
        } catch (error) {
            console.error('❌ Error generating report:', error.message);
            throw error;
        }
    }

    createReportPrompt(sessionData, transcript) {
        // Format transcript for analysis
        const transcriptText = transcript.map((item, index) => {
            return `${index + 1}. ${item.speaker === 'bot' ? 'INTERVIEWER' : 'CANDIDATE'}: ${item.text}`;
        }).join('\n\n');

        const prompt = `You are an expert interview evaluator. Analyze the following interview transcript and generate a comprehensive performance report.

INTERVIEW CONTEXT:
- Position: ${sessionData.jobPosition}
- Interview Type: ${sessionData.interviewType}
- Difficulty Level: ${sessionData.difficulty}
- Duration: ${sessionData.timeLimit} minutes
- Job Description: ${sessionData.jobDescription}

INTERVIEW TRANSCRIPT:
${transcriptText}

TASK: Generate a detailed interview performance report in the following JSON format. Be thorough, specific, and constructive in your analysis.

{
  "overallScore": <number between 0-10 with one decimal place>,
  "scoringBreakdown": {
    "technicalAccuracy": <number 0-10 with one decimal>,
    "communicationClarity": <number 0-10 with one decimal>,
    "confidenceIndex": <number 0-10 with one decimal>
  },
  "questionAnalysis": [
    {
      "question": "<interviewer question>",
      "answer": "<candidate answer>",
      "feedback": "<detailed constructive feedback on this specific answer>"
    }
  ],
  "topMistakes": [
    "<mistake/blunder/fumble 1>",
    "<mistake/blunder/fumble 2>",
    "<mistake/blunder/fumble 3>",
    "<mistake/blunder/fumble 4>",
    "<mistake/blunder/fumble 5>"
  ],
  "strengths": [
    "<strength/what they did correctly 1>",
    "<strength/what they did correctly 2>",
    "<strength/what they did correctly 3>",
    "<strength/what they did correctly 4>",
    "<strength/what they did correctly 5>"
  ],
  "summary": "<2-3 sentence overall summary of the interview performance>"
}

EVALUATION CRITERIA:
1. **Overall Score**: Holistic assessment considering all factors
2. **Technical Accuracy**: Correctness of technical knowledge, problem-solving ability, depth of understanding
3. **Communication Clarity**: Ability to articulate thoughts clearly, structure answers well, explain concepts effectively
4. **Confidence Index**: Body language cues (if visual analysis was done), tone, decisiveness, self-assurance in answers
5. **Question Analysis**: For EACH interviewer question, provide the candidate's answer and specific feedback
6. **Top Mistakes**: Identify fumbles, wrong answers, hesitations, poor explanations, missed opportunities
7. **Strengths**: Highlight what the candidate did well, strong answers, good examples, effective communication

IMPORTANT:
- Be specific and reference actual parts of the transcript
- Provide actionable feedback
- Balance criticism with encouragement
- If technical interview, focus more on technical accuracy
- If HR interview, focus more on soft skills and communication
- If hybrid, balance both aspects
- Return ONLY valid JSON, no markdown formatting or additional text

Generate the report now:`;

        return prompt;
    }

    parseReportResponse(response) {
        try {
            // Remove markdown code blocks if present
            let cleanedResponse = response.trim();
            if (cleanedResponse.startsWith('```json')) {
                cleanedResponse = cleanedResponse.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
            } else if (cleanedResponse.startsWith('```')) {
                cleanedResponse = cleanedResponse.replace(/```\n?/g, '').replace(/```\n?$/g, '');
            }

            const reportData = JSON.parse(cleanedResponse);

            // Validate the structure
            if (!reportData.overallScore || !reportData.scoringBreakdown || !reportData.questionAnalysis) {
                throw new Error('Invalid report structure');
            }

            return reportData;
        } catch (error) {
            console.error('❌ Error parsing report response:', error.message);
            console.error('Raw response:', response);
            
            // Return a fallback structure
            return {
                overallScore: 0,
                scoringBreakdown: {
                    technicalAccuracy: 0,
                    communicationClarity: 0,
                    confidenceIndex: 0
                },
                questionAnalysis: [],
                topMistakes: ['Report generation failed. Please try again.'],
                strengths: [],
                summary: 'Unable to generate report at this time.'
            };
        }
    }
}

module.exports = new ReportService();
