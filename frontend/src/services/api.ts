// api.ts — all HTTP calls to our backend in one place
// Never write fetch() or axios() directly in components
// Always go through this file — easier to maintain

import axios from "axios";

// Base URL of our backend
// In development it's localhost:3000
// In production it will be our deployed URL
const API = axios.create({
  baseURL: "http://localhost:3000/api",
});

// Interceptor — runs before EVERY request
// Automatically attaches the JWT token to every request
// So we never have to manually add headers in each call
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// AUTH
export const registerUser = (data: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: string;
}) => API.post("/auth/register", data);

export const loginUser = (data: {
  email: string;
  password: string;
}) => API.post("/auth/login", data);

export const getMe = () => API.get("/auth/me");

// PROVIDERS
export const getProviders = (params?: {
  city?: string;
  category?: string;
  search?: string;
}) => API.get("/providers", { params });

export const getProviderById = (id: string) =>
  API.get(`/providers/${id}`);

export const getProviderSlots = (id: string, date?: string) =>
  API.get(`/providers/${id}/slots`, { params: { date } });

// BOOKINGS
export const createBooking = (data: {
  timeSlotId: string;
  serviceId: string;
  notes?: string;
}) => API.post("/bookings", data);

export const getMyBookings = () => API.get("/bookings/my");

export const cancelBooking = (id: string) =>
  API.put(`/bookings/${id}/cancel`);