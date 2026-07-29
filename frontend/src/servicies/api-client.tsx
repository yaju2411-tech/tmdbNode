import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/tmdb`,
  headers: {
    accept: "application/json",
  },
  withCredentials: true,
});
export const api = axios.create({
    baseURL: `${API_BASE_URL}/api`,
    withCredentials: true,
});

export default apiClient;