import apiClient from "./axios";

export const fetchDashboardSummary = async () => {
  const response = await apiClient.get("/dashboard/summary");
  return response.data?.data;
};

export const fetchRevenue = async () => {
  const response = await apiClient.get("/dashboard/revenue");
  return response.data?.data || [];
};

export const fetchActivity = async (page = 1) => {
  const response = await apiClient.get(`/activity?page=${page}`);
  return {
    data: response.data?.data || [],
    pagination: response.data?.pagination || { page, limit: 10, total: 0, totalPages: 1 },
  };
};
