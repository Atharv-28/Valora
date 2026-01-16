// API Service for Interview Backend

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

class InterviewApiService {
    async initializeInterview(formData) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/interview/init`, {
                method: 'POST',
                body: formData // FormData with resume and other details
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error initializing interview:', error);
            throw error;
        }
    }

    async sendMessage(sessionId, message, context) {
        try {
            const payload = {
                sessionId,
                message,
                context: {
                    jobPosition: context.jobPosition,
                    interviewType: context.interviewType,
                    timeRemaining: context.timeRemaining
                }
            };

            // Add snapshot if available
            if (context.snapshot) {
                payload.snapshot = context.snapshot;
            }

            const response = await fetch(`${API_BASE_URL}/api/interview/message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error sending message:', error);
            throw error;
        }
    }

    async endInterview(sessionId) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/interview/end`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ sessionId })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error ending interview:', error);
            throw error;
        }
    }

    async getReport(sessionId) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/interview/report/${sessionId}`, {
                method: 'GET'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching report:', error);
            throw error;
        }
    }
}

export default new InterviewApiService();
