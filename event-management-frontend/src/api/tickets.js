import apiClient from './axios';

// Get all tickets (for the organizer's events)
export const fetchTickets = async () => {
  const response = await apiClient.get('/tickets');
  return response.data?.data || [];
};

// Get tickets for a specific event
export const fetchEventTickets = async (eventId) => {
  // ✅ Correct: include /tickets prefix
  const response = await apiClient.get(`/tickets/events/${eventId}/tickets`);
  return response.data?.data || [];
};

// Create a new ticket type for an event
export const createTicket = async (eventId, ticketData) => {
  // ✅ Correct: include /tickets prefix
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
