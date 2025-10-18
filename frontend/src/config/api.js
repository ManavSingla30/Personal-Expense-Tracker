// src/config/api.js
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

console.log('🔗 API URL:', API_URL); // Debug log

export { API_URL };

export const apiCall = async (endpoint, options = {}) => {
  try {
    const url = `${API_URL}${endpoint}`;
    console.log('📡 API Call:', url); // Debug log
    
    const response = await fetch(url, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    return response;
  } catch (error) {
    console.error('❌ API Error:', error);
    throw error;
  }
};
