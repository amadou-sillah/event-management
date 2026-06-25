import apiClient from './axios';

// Get all attendees (for the organizer's events)
export const fetchAttendees = async (params = {}) => {
  const response = await apiClient.get('/attendees', { params });
  return {
    data: response.data?.data || [],
    pagination: response.data?.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 }
  };
};

// Register a new attendee for a specific event
export const registerAttendee = async (eventId, attendeeData) => {
  const response = await apiClient.post(`/events/${eventId}/attendees`, attendeeData);
  return response.data?.data;
};

// Toggle check-in status
export const checkInAttendee = async (attendeeId) => {
  const response = await apiClient.patch(`/attendees/${attendeeId}/checkin`);
  return response.data?.data;
};

// Delete an attendee
export const deleteAttendee = async (attendeeId) => {
  await apiClient.delete(`/attendees/${attendeeId}`);
  return true;
};

// Optional: fetch attendees for a specific event
export const fetchEventAttendees = async (eventId, params = {}) => {
  const response = await apiClient.get(`/events/${eventId}/attendees`, { params });
  return {
    data: response.data?.data || [],
    pagination: response.data?.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 }
  };
};
