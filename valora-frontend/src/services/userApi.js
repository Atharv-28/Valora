import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/user';

// Helper to get auth header
const getAuthHeader = async (getIdToken) => {
  const token = await getIdToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const userApi = {
  // Get all user interviews
  getInterviews: async (getIdToken) => {
    try {
      const headers = await getAuthHeader(getIdToken);
      const response = await axios.get(`${API_BASE_URL}/interviews`, { headers });
      return response.data;
    } catch (error) {
      console.error('Error fetching interviews:', error);
      throw error;
    }
  },

  // Get specific interview
  getInterview: async (interviewId, getIdToken) => {
    try {
      const headers = await getAuthHeader(getIdToken);
      const response = await axios.get(`${API_BASE_URL}/interviews/${interviewId}`, { headers });
      return response.data;
    } catch (error) {
      console.error('Error fetching interview:', error);
      throw error;
    }
  },

  // Get user analytics
  getAnalytics: async (getIdToken) => {
    try {
      const headers = await getAuthHeader(getIdToken);
      const response = await axios.get(`${API_BASE_URL}/analytics`, { headers });
      return response.data;
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw error;
    }
  },

  // Save interview
  saveInterview: async (interviewData, getIdToken) => {
    try {
      const headers = await getAuthHeader(getIdToken);
      const response = await axios.post(`${API_BASE_URL}/interviews`, interviewData, { headers });
      return response.data;
    } catch (error) {
      console.error('Error saving interview:', error);
      throw error;
    }
  },

  // Update profile
  updateProfile: async (profileData, getIdToken) => {
    try {
      const headers = await getAuthHeader(getIdToken);
      const response = await axios.post(`${API_BASE_URL}/profile`, profileData, { headers });
      return response.data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }
};
