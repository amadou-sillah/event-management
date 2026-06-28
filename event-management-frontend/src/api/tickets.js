import apiClient from './axios';

export const fetchTickets = async () => {
  const response = await apiClient.get('/tickets');
  return response.data?.data || [];
};

export const fetchEventTickets = async (eventId) => {
  const response = await apiClient.get(`/tickets/events/${eventId}/tickets`);
  return response.data?.data || [];
};

export const createTicket = async (eventId, ticketData) => {
  const response = await apiClient.post(`/tickets/events/${eventId}/tickets`, ticketData);
  return response.data?.data;
};

export const updateTicket = async (ticketId, ticketData) => {
  const response = await apiClient.put(`/tickets/${ticketId}`, ticketData);
  return response.data?.data;
};

export const deleteTicket = async (ticketId) => {
  await apiClient.delete(`/tickets/${ticketId}`);
  return true;
};

export const purchaseTicket = async (ticketId, quantity = 1) => {
  console.log(`🟢 [PURCHASE] Buying ${quantity} ticket(s) for ${ticketId}`);
  const response = await apiClient.post('/tickets/purchase', { ticketId, quantity });
  console.log('🟢 [PURCHASE] Response:', response.data);
  return response.data?.data;
};
