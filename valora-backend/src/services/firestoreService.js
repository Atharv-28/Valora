const { db } = require('../config/firebase');

class FirestoreService {
    constructor() {
        this.usersCollection = db.collection('users');
        this.interviewsCollection = db.collection('interviews');
        console.log('✅ Firestore Service initialized');
    }

    async saveInterview(userId, interviewData) {
        try {
            const interviewDoc = {
                userId,
                sessionId: interviewData.sessionId,
                jobPosition: interviewData.jobPosition,
                interviewType: interviewData.interviewType,
                difficulty: interviewData.difficulty,
                timeLimit: interviewData.timeLimit,
                report: interviewData.report,
                transcript: interviewData.transcript,
                createdAt: new Date().toISOString(),
                duration: interviewData.duration || null
            };

            const docRef = await this.interviewsCollection.add(interviewDoc);
            console.log(`✅ Interview saved to Firestore: ${docRef.id}`);
            
            return {
                success: true,
                interviewId: docRef.id
            };
        } catch (error) {
            console.error('❌ Error saving interview to Firestore:', error);
            throw error;
        }
    }

    async getUserInterviews(userId, limit = 20) {
        try {
            const snapshot = await this.interviewsCollection
                .where('userId', '==', userId)
                .orderBy('createdAt', 'desc')
                .limit(limit)
                .get();

            const interviews = [];
            snapshot.forEach(doc => {
                interviews.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            return interviews;
        } catch (error) {
            console.error('❌ Error fetching user interviews:', error);
            throw error;
        }
    }

    async getInterviewById(interviewId, userId) {
        try {
            const doc = await this.interviewsCollection.doc(interviewId).get();
            
            if (!doc.exists) {
                return null;
            }

            const data = doc.data();
            
            // Verify ownership
            if (data.userId !== userId) {
                throw new Error('Unauthorized access to interview');
            }

            return {
                id: doc.id,
                ...data
            };
        } catch (error) {
            console.error('❌ Error fetching interview:', error);
            throw error;
        }
    }

    async getUserAnalytics(userId) {
        try {
            const interviews = await this.getUserInterviews(userId, 100);

            if (interviews.length === 0) {
                return {
                    totalInterviews: 0,
                    averageScore: 0,
                    scoresByType: {},
                    scoresByDifficulty: {},
                    recentTrend: [],
                    topSkills: [],
                    areasToImprove: []
                };
            }

            // Calculate statistics
            const totalInterviews = interviews.length;
            const scores = interviews.map(i => i.report?.overallScore || 0).filter(s => s > 0);
            const averageScore = scores.length > 0 
                ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)
                : 0;

            // Group by type
            const scoresByType = {};
            const scoresByDifficulty = {};
            
            interviews.forEach(interview => {
                const type = interview.interviewType;
                const difficulty = interview.difficulty;
                const score = interview.report?.overallScore || 0;

                if (score > 0) {
                    if (!scoresByType[type]) scoresByType[type] = [];
                    scoresByType[type].push(score);

                    if (!scoresByDifficulty[difficulty]) scoresByDifficulty[difficulty] = [];
                    scoresByDifficulty[difficulty].push(score);
                }
            });

            // Calculate averages
            Object.keys(scoresByType).forEach(type => {
                const scores = scoresByType[type];
                scoresByType[type] = (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1);
            });

            Object.keys(scoresByDifficulty).forEach(difficulty => {
                const scores = scoresByDifficulty[difficulty];
                scoresByDifficulty[difficulty] = (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1);
            });

            // Recent trend (last 10 interviews)
            const recentTrend = interviews
                .slice(0, 10)
                .reverse()
                .map(i => ({
                    date: i.createdAt,
                    score: i.report?.overallScore || 0,
                    type: i.interviewType
                }));

            // Aggregate strengths and mistakes
            const allStrengths = [];
            const allMistakes = [];

            interviews.forEach(interview => {
                if (interview.report?.strengths) {
                    allStrengths.push(...interview.report.strengths);
                }
                if (interview.report?.topMistakes) {
                    allMistakes.push(...interview.report.topMistakes);
                }
            });

            return {
                totalInterviews,
                averageScore: parseFloat(averageScore),
                scoresByType,
                scoresByDifficulty,
                recentTrend,
                topSkills: allStrengths.slice(0, 5),
                areasToImprove: allMistakes.slice(0, 5)
            };
        } catch (error) {
            console.error('❌ Error calculating analytics:', error);
            throw error;
        }
    }

    async createOrUpdateUser(userId, userData) {
        try {
            const userRef = this.usersCollection.doc(userId);
            await userRef.set({
                email: userData.email,
                name: userData.name || userData.email,
                updatedAt: new Date().toISOString(),
                createdAt: userData.createdAt || new Date().toISOString()
            }, { merge: true });

            console.log(`✅ User profile updated: ${userId}`);
        } catch (error) {
            console.error('❌ Error updating user:', error);
            throw error;
        }
    }
}

module.exports = new FirestoreService();
