
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export { API_URL };

export const apiCall = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    return response;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};