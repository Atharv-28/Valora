// API Service for Interview Backend
import { auth } from '../config/firebase';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://valora-backend-07qh.onrender.com';

console.log('🔧 API Configuration:', {
    API_BASE_URL,
    env: process.env.REACT_APP_API_URL,
    fullInitUrl: `${API_BASE_URL}/api/interview/init`
});

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
            
    // Test backend connectivity
    async testConnection() {
        try {
            console.log('🧪 Testing backend connection...');
            const response = await fetch(`${API_BASE_URL}/health`);
            const data = await response.json();
            console.log('✅ Backend is reachable:', data);
            return data;
        } catch (error) {
            console.error('❌ Backend connection test failed:', error);
            throw error;
        }
    }
    async initializeInterview(formData) {
        try {
            console.log('📤 Sending request to:', `${API_BASE_URL}/api/interview/init`);
            console.log('📦 FormData contents:', {
                resume: formData.get('resume')?.name,
                jobDescription: formData.get('jobDescription')?.substring(0, 50) + '...',
                jobPosition: formData.get('jobPosition'),
                interviewType: formData.get('interviewType')
            });

            const response = await fetch(`${API_BASE_URL}/api/interview/init`, {
                method: 'POST',
                headers: authHeaders,
                body: formData // FormData with resume and other details
            });

            console.log('📥 Response status:', response.status, response.statusText);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Error response body:', errorText);
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const data = await response.json();
            console.log('✅ Success response:', data);
            return data;
        } catch (error) {
            console.error('❌ Error initializing interview:', error);
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
