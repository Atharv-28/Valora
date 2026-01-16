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
        const stripCodeFences = (text) => {
            let cleaned = text.trim();
            if (cleaned.startsWith('```json')) cleaned = cleaned.replace(/^```json\s*/g, '');
            else if (cleaned.startsWith('```')) cleaned = cleaned.replace(/^```\s*/g, '');
            if (cleaned.endsWith('```')) cleaned = cleaned.replace(/```\s*$/g, '');
            return cleaned.trim();
        };

        const extractJsonBlock = (text) => {
            const start = text.indexOf('{');
            const end = text.lastIndexOf('}');
            return (start >= 0 && end > start) ? text.substring(start, end + 1) : text;
        };

        const attemptParse = (text) => {
            try {
                const parsed = JSON.parse(text);
                return (parsed && parsed.scoringBreakdown && Array.isArray(parsed.questionAnalysis)) ? parsed : null;
            } catch { return null; }
        };

        const salvageQuestionAnalysis = (text) => {
            const qaIndex = text.indexOf('"questionAnalysis"');
            if (qaIndex === -1) return null;
            const arrayStart = text.indexOf('[', qaIndex);
            if (arrayStart === -1) return null;
            const arraySlice = text.substring(arrayStart + 1);
            const lastComplete = arraySlice.lastIndexOf('},');
            if (lastComplete === -1) return null;
            const prefix = text.substring(0, arrayStart + 1);
            let rebuilt = `${prefix}${arraySlice.substring(0, lastComplete + 1)}\n]`;
            const openBraces = (rebuilt.match(/{/g) || []).length;
            const closeBraces = (rebuilt.match(/}/g) || []).length;
            if (openBraces > closeBraces) rebuilt += '\n' + '}'.repeat(openBraces - closeBraces);
            return rebuilt;
        };

        try {
            let cleaned = extractJsonBlock(stripCodeFences(response));
            let reportData = attemptParse(cleaned);
            if (!reportData) {
                const salvaged = salvageQuestionAnalysis(cleaned);
                if (salvaged) {
                    console.log('   🧩 Salvaging incomplete JSON...');
                    reportData = attemptParse(salvaged);
                }
            }
            if (!reportData) throw new Error('Invalid report structure');
            return reportData;
        } catch (error) {
            console.error('❌ Error parsing report:', error.message);
            console.error('First 500 chars:', response.substring(0, 500));
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
