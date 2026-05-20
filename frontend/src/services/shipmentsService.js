import api from '../api/axios';

export const shipmentsService = {
  // Get list of shipments
  getShipments: async (filters = {}) => {
    const response = await api.get('/shipments', { params: filters });
    return response.data;
  },

  // Get shipment details
  getShipment: async (id) => {
    const response = await api.get(`/shipments/${id}`);
    return response.data;
  },

  // Create shipment
  createShipment: async (shipmentData) => {
    const response = await api.post('/shipments', shipmentData);
    return response.data;
  },

  // Update shipment status
  updateShipment: async (id, data) => {
    const response = await api.put(`/shipments/${id}`, data);
    return response.data;
  },

  // Cancel shipment
  cancelShipment: async (id) => {
    const response = await api.delete(`/shipments/${id}`);
    return response.data;
  },

  // Get tracking information
  getTracking: async (id) => {
    const response = await api.get(`/shipments/${id}/tracking`);
    return response.data;
  },

  // Get shipments for an order
  getOrderShipments: async (orderId) => {
    const response = await api.get('/shipments', { 
      params: { order_id: orderId } 
    });
    return response.data;
  }
};
