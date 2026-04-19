import axios from 'axios';

const apiClient = axios.create({
    baseURL: 'https://api.yourservice.com',
    timeout: 10000,
});

// Add JWT authentication to every request
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('jwt');
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Interceptor to handle response errors globally
apiClient.interceptors.response.use((response) => {
    return response;
}, (error) => {
    if (error.response.status === 401) {
        // Handle unauthorized access (e.g., log out user or redirect)
    }
    return Promise.reject(error);
});

// CSRF protection: Assuming CSRF token is stored in local storage
apiClient.defaults.headers.common['X-CSRF-Token'] = localStorage.getItem('csrf_token');

// Function to refresh token if expired
const refreshToken = async () => {
    // Implement token refresh logic here
};

// Function to make API calls
const makeApiCall = async (endpoint, method = 'GET', data = null) => {
    try {
        const response = await apiClient.request({
            url: endpoint,
            method,
            data,
        });
        return response.data;
    } catch (error) {
        console.error('API call error:', error);
        throw error; // Re-throw error for further handling
    }
};

export { makeApiCall, refreshToken };