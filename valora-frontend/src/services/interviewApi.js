// API Service for Interview Backend
import { auth } from '../config/firebase';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

class InterviewApiService {
    // Helper method to get auth headers
    async getAuthHeaders() {
        const headers = {};
        
        try {
            const currentUser = auth.currentUser;
            if (currentUser) {
                const token = await currentUser.getIdToken();
                headers['Authorization'] = `Bearer ${token}`;
            }
        } catch (error) {
            console.warn('Could not get auth token:', error);
        }
        
        return headers;
    }

    async initializeInterview(formData) {
        try {
            const authHeaders = await this.getAuthHeaders();
            
            const response = await fetch(`${API_BASE_URL}/api/interview/init`, {
                method: 'POST',
                headers: authHeaders,
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

            const authHeaders = await this.getAuthHeaders();
            
            const response = await fetch(`${API_BASE_URL}/api/interview/message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...authHeaders
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
            const authHeaders = await this.getAuthHeaders();
            
            const response = await fetch(`${API_BASE_URL}/api/interview/end`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...authHeaders
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
            const authHeaders = await this.getAuthHeaders();
            
            const response = await fetch(`${API_BASE_URL}/api/interview/report/${sessionId}`, {
                method: 'GET',
                headers: authHeaders
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
