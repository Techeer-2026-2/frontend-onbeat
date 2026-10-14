import apiClient from "./client";

export const checkServerHealth = async () => {
  const response = await apiClient.get("/health");
  return response.data;
};