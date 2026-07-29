import axios from "axios";
import { createClient } from "@supabase/supabase-js";

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

export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
export const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

export default apiClient;