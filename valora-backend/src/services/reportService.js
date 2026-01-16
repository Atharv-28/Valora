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
                    maxOutputTokens: 2500, // Reduced from 4000 to save tokens
                    temperature: 0.3,
                    responseMimeType: "application/json"
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
        // Format transcript concisely
        const transcriptText = transcript.map((item, idx) => {
            const speaker = item.speaker === 'bot' ? 'Q' : 'A';
            return `${idx + 1}. ${speaker}: ${item.text}`;
        }).join('\n');

        const prompt = `Evaluate interview: ${sessionData.jobPosition} (${sessionData.interviewType}, ${sessionData.difficulty}, ${sessionData.timeLimit}min)

Job: ${sessionData.jobDescription}

TRANSCRIPT:
${transcriptText}

Generate JSON report:
{
  "overallScore": <0-10>,
  "scoringBreakdown": {"technicalAccuracy":<0-10>,"communicationClarity":<0-10>,"confidenceIndex":<0-10>},
  "questionAnalysis": [{"question":"<q>","answer":"<a>","feedback":"<specific feedback>"}],
  "topMistakes": ["<mistake1>","<mistake2>","<mistake3>","<mistake4>","<mistake5>"],
  "strengths": ["<strength1>","<strength2>","<strength3>","<strength4>","<strength5>"],
  "summary": "<2-3 sentences>"
}

Requirements:
- Be specific, reference actual answers
- Provide actionable feedback
- Balance criticism with encouragement
- Technical interview: focus on accuracy
- HR interview: focus on soft skills
- Hybrid: balance both
- Return ONLY JSON`;

        return prompt;
    }

    parseReportResponse(response) {
        try {
            // Remove markdown code blocks if present
            let cleanedResponse = response.trim();
            
            // Remove markdown code blocks
            if (cleanedResponse.startsWith('```json')) {
                cleanedResponse = cleanedResponse.replace(/^```json\s*/g, '');
            } else if (cleanedResponse.startsWith('```')) {
                cleanedResponse = cleanedResponse.replace(/^```\s*/g, '');
            }
            
            // Remove trailing markdown if present
            if (cleanedResponse.endsWith('```')) {
                cleanedResponse = cleanedResponse.replace(/```\s*$/g, '');
            }
            
            // Try to fix incomplete JSON by finding the last complete object
            cleanedResponse = cleanedResponse.trim();
            
            // If JSON is incomplete, try to find and close it properly
            if (!cleanedResponse.endsWith('}')) {
                // Find the last complete field
                const lastCompletePos = cleanedResponse.lastIndexOf('},');
                if (lastCompletePos > 0) {
                    // Truncate after the last complete field and close the JSON
                    cleanedResponse = cleanedResponse.substring(0, lastCompletePos + 1);
                    
                    // Count open braces vs close braces to properly close
                    const openBraces = (cleanedResponse.match(/{/g) || []).length;
                    const closeBraces = (cleanedResponse.match(/}/g) || []).length;
                    const missingBraces = openBraces - closeBraces;
                    
                    for (let i = 0; i < missingBraces; i++) {
                        cleanedResponse += '\n}';
                    }
                }
            }

            console.log('   🧹 Cleaned response length:', cleanedResponse.length);
            const reportData = JSON.parse(cleanedResponse);

            // Validate the structure
            if (!reportData.overallScore || !reportData.scoringBreakdown || !reportData.questionAnalysis) {
                throw new Error('Invalid report structure');
            }

            return reportData;
        } catch (error) {
            console.error('❌ Error parsing report response:', error.message);
            console.error('Raw response (first 500 chars):', response.substring(0, 500));
            
            // Return a fallback structure
            return {
                overallScore: 0,
                scoringBreakdown: {
                    technicalAccuracy: 0,
                    communicationClarity: 0,
                    confidenceIndex: 0
                },
                questionAnalysis: [],
                topMistakes: ['Report generation encountered an error. The AI response was incomplete or malformed.'],
                strengths: [],
                summary: 'Unable to generate complete report. Please try again or check interview transcript manually.'
            };
        }
    }
}

module.exports = new ReportService();
