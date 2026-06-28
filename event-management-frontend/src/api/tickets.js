import apiClient from './axios';

// Get all tickets (for the organizer's events)
export const fetchTickets = async () => {
  const response = await apiClient.get('/tickets');
  return response.data?.data || [];
};

// Get tickets for a specific event
export const fetchEventTickets = async (eventId) => {
  const response = await apiClient.get(`/tickets/events/${eventId}/tickets`);
  return response.data?.data || [];
};

// Create a new ticket type for an event
export const createTicket = async (eventId, ticketData) => {
  console.log(`📤 createTicket for event ${eventId}:`, ticketData);
  const response = await apiClient.post(`/tickets/events/${eventId}/tickets`, ticketData);
  return response.data?.data;
};

// Update a ticket type
export const updateTicket = async (ticketId, ticketData) => {
  const response = await apiClient.put(`/tickets/${ticketId}`, ticketData);
  return response.data?.data;
};

// Delete a ticket type
export const deleteTicket = async (ticketId) => {
  await apiClient.delete(`/tickets/${ticketId}`);
  return true;
};

// Purchase a ticket (reduces quantityAvailable, increases quantitySold)
export const purchaseTicket = async (ticketId, quantity = 1) => {
  const response = await apiClient.post('/purchase', { ticketId, quantity });
  return response.data?.data;
};
