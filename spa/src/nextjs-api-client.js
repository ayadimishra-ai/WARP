import axios from 'axios';
import { getNextJSServiceUrl } from './config';

/**
 * NextJS API Client for reusable HTTP requests
 * Centralized axios-based client specifically designed for NextJS service endpoints
 * Provides common configurations, authentication, and error handling
 */

/**
 * Creates NextJS-specific axios instance with default configuration
 * Configured to work with NextJS service endpoints
 */
const createNextJSApiClient = () => {
  const client = axios.create({
    baseURL: getNextJSServiceUrl(),
    headers: {
      Accept: '*/*',
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor to add auth token
  client.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('tokenId');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor for common error handling
  client.interceptors.response.use(
    (response) => response,
    (error) => {
      // Handle common HTTP errors
      if (error.response) {
        switch (error.response.status) {
          case 401:
            // Unauthorized - redirect to login
            window.location.pathname = '/';
            break;
          case 429:
            // Rate limit - will be handled by calling component
            break;
          case 500:
            console.error('Server error:', error.response.data);
            break;
          default:
            console.error('API Error:', error.response.status, error.response.data);
        }
      } else if (error.request) {
        console.error('Network error:', error.request);
      } else {
        console.error('Request setup error:', error.message);
      }
      return Promise.reject(error);
    }
  );

  return client;
};

// Create singleton NextJS API client instance
const nextJSApiClient = createNextJSApiClient();

/**
 * Generic NextJS API client methods for other endpoints
 */
export const nextJSApiMethods = {
  /**
   * Generic GET request
   */
  get: async (endpoint, config = {}) => {
    try {
      const response = await nextJSApiClient.get(endpoint, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Generic POST request
   */
  post: async (endpoint, data = {}, config = {}) => {
    try {
      const response = await nextJSApiClient.post(endpoint, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Generic PUT request
   */
  put: async (endpoint, data = {}, config = {}) => {
    try {
      const response = await nextJSApiClient.put(endpoint, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Generic DELETE request
   */
  delete: async (endpoint, config = {}) => {
    try {
      const response = await nextJSApiClient.delete(endpoint, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

/**
 * Helper function to handle API errors consistently
 * @param {Error} error - The error object from API call
 * @param {Function} setError - State setter function for error messages
 * @param {Function} setLoader - State setter function for loading state
 * @returns {Object} Processed error information
 */
export const handleApiError = (error, setError = null, setLoader = null) => {
  // Reset loader if provided
  if (setLoader) {
    setLoader(false);
  }

  let errorMessage = '';
  let errorType = '';

  switch (error.message) {
    case 'TOO_MANY_REQUESTS':
      errorMessage = 'Too many login attempts. Please try again later.';
      errorType = 'RATE_LIMIT';
      break;
    case 'UNAUTHORIZED':
      errorMessage = 'Session expired. Please login again.';
      errorType = 'AUTH_ERROR';
      break;
    case 'NETWORK_ERROR':
      errorMessage = 'Network error. Please check your connection.';
      errorType = 'NETWORK';
      break;
    case 'SERVER_ERROR':
      errorMessage = 'Server error. Please try again later.';
      errorType = 'SERVER';
      break;
    default:
      errorMessage = 'An unexpected error occurred. Please try again.';
      errorType = 'UNKNOWN';
  }

  // Set error message if setter provided
  if (setError) {
    setError(errorMessage);
  }

  return {
    message: errorMessage,
    type: errorType,
    originalError: error
  };
};

export default nextJSApiClient;
