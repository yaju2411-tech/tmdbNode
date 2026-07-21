import axios from "axios";
import { createClient } from "@supabase/supabase-js";

const apiClient = axios.create({
  baseURL: "http://localhost:3000/api/tmdb",
  headers: {
    accept: "application/json",
  },
  withCredentials: true,
});
export const api = axios.create({
    baseURL:"http://localhost:3000/api",
    withCredentials:true,
});

export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
export const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

export default apiClient;