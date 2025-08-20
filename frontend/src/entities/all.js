import axios from 'axios';

// Get backend URL from environment variable
const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Add request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Base Entity class
class BaseEntity {
  constructor(endpoint) {
    this.endpoint = endpoint;
  }

  async create(data) {
    try {
      const response = await apiClient.post(`/api/${this.endpoint}`, data);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to create ${this.endpoint}: ${error.message}`);
    }
  }

  async list(orderBy = '-created_at', limit = 50, filters = {}) {
    try {
      const params = { limit, ...filters };
      const response = await apiClient.get(`/api/${this.endpoint}`, { params });
      
      let data = response.data;
      
      // Client-side sorting if needed
      if (orderBy.startsWith('-')) {
        const field = orderBy.substring(1);
        data.sort((a, b) => {
          if (a[field] < b[field]) return 1;
          if (a[field] > b[field]) return -1;
          return 0;
        });
      } else {
        data.sort((a, b) => {
          if (a[orderBy] < b[orderBy]) return -1;
          if (a[orderBy] > b[orderBy]) return 1;
          return 0;
        });
      }
      
      return data;
    } catch (error) {
      throw new Error(`Failed to list ${this.endpoint}: ${error.message}`);
    }
  }

  async get(id) {
    try {
      const response = await apiClient.get(`/api/${this.endpoint}/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get ${this.endpoint}: ${error.message}`);
    }
  }

  async update(id, data) {
    try {
      const response = await apiClient.put(`/api/${this.endpoint}/${id}`, data);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to update ${this.endpoint}: ${error.message}`);
    }
  }

  async delete(id) {
    try {
      const response = await apiClient.delete(`/api/${this.endpoint}/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to delete ${this.endpoint}: ${error.message}`);
    }
  }
}

// Entity instances
export const AgentConfig = new BaseEntity('agent-config');
export const Tender = new BaseEntity('tenders');
export const Portfolio = new BaseEntity('portfolio');
export const Meeting = new BaseEntity('meetings');
export const EmailThread = new BaseEntity('email-threads');
export const Integration = new BaseEntity('integrations');
export const BidResponse = new BaseEntity('bid-responses');
export const TenderSummary = new BaseEntity('tender-summaries');

// Export the API client for direct use if needed
export { apiClient };