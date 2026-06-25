import apiClient from './axios';

// Get all events with optional pagination & search
export const fetchEvents = async (params = {}) => {
  try {
    const response = await apiClient.get('/events', { params });
    return response.data;
  } catch (error) {
    console.error('fetchEvents error:', error);
    throw error;
  }
};

// Get a single event by ID
export const fetchEventById = async (id) => {
  try {
    const response = await apiClient.get(`/events/${id}`);
    return response.data.event;
  } catch (error) {
    console.error('fetchEventById error:', error);
    throw error;
  }
};

// Create a new event
export const createEvent = async (eventData) => {
  try {
    const response = await apiClient.post('/events', eventData);
    return response.data.event;
  } catch (error) {
    console.error('createEvent error:', error);
    throw error;
  }
};

// Update an existing event
export const updateEvent = async (id, eventData) => {
  try {
    const response = await apiClient.put(`/events/${id}`, eventData);
    return response.data.event;
  } catch (error) {
    console.error('updateEvent error:', error);
    throw error;
  }
};

// Delete an event
export const deleteEvent = async (id) => {
  try {
    await apiClient.delete(`/events/${id}`);
    return true;
  } catch (error) {
    console.error('deleteEvent error:', error);
    throw error;
  }
};