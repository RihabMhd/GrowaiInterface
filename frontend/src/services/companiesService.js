import api from '../api/axios';

export const companiesService = {
  // Get list of companies
  getCompanies: async (filters = {}) => {
    const response = await api.get('/companies', { params: filters });
    return response.data;
  },

  // Get company details
  getCompany: async (id) => {
    const response = await api.get(`/companies/${id}`);
    return response.data;
  },

  // Connect company with credentials
  connectCompany: async (id, credentials) => {
    const response = await api.post(`/companies/${id}/connect`, credentials);
    return response.data;
  },

  // Disconnect company
  disconnectCompany: async (id) => {
    const response = await api.post(`/companies/${id}/disconnect`);
    return response.data;
  },

  // Test connection
  testConnection: async (id) => {
    const response = await api.get(`/companies/${id}/test-connection`);
    return response.data;
  },

  // Enable updates (register webhook)
  enableUpdates: async (id) => {
    const response = await api.post(`/companies/${id}/enable-updates`);
    return response.data;
  },

  // Disable updates (unregister webhook)
  disableUpdates: async (id) => {
    const response = await api.post(`/companies/${id}/disable-updates`);
    return response.data;
  }
};
