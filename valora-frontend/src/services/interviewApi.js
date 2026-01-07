// API Service for Interview Backend

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://valora-backend-07qh.onrender.com';

console.log('🔧 API Configuration:', {
    API_BASE_URL,
    env: process.env.REACT_APP_API_URL,
    fullInitUrl: `${API_BASE_URL}/api/interview/init`
});

class InterviewApiService {
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
            const response = await fetch(`${API_BASE_URL}/api/interview/message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    sessionId,
                    message,
                    context
                })
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
}

export default new InterviewApiService();
