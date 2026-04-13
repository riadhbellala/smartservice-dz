// api.ts — all HTTP calls to our backend in one place
// Never write fetch() or axios() directly in components
// Always go through this file — easier to maintain

import axios from "axios";

// Base URL of our backend
// In development it's localhost:3000
// In production it will be our deployed URL
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
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

export const submitReview = (id: string, data: { rating: number; review?: string }) =>
  API.put(`/bookings/${id}/review`, data);

// NOTIFICATIONS
export const getNotifications = () =>
  API.get("/notifications");

export const markNotificationRead = (id: string) =>
  API.put(`/notifications/${id}/read`);

export const markAllNotificationsRead = () =>
  API.put("/notifications/read-all");

// DASHBOARD / PROVIDER SPECIFIC APIs
export const getProviderProfile = () => API.get("/provider/profile");
export const updateProviderProfile = (data: any) => API.put("/provider/profile", data);
export const getProviderBookings = () => API.get("/provider/bookings");
export const updateBookingStatus = (id: string, status: string) => API.put(`/provider/bookings/${id}`, { status });
export const getProviderOwnSlots = (date?: string) => API.get("/provider/slots", { params: { date } });
export const createSlot = (data: { startTime: string; endTime: string }) => API.post("/provider/slots", data);
export const createBulkSlots = (data: any) => API.post("/provider/slots/bulk", data);
export const deleteSlot = (id: string) => API.delete(`/provider/slots/${id}`);
export const getProviderOwnServices = () => API.get("/provider/services");
export const createService = (data: any) => API.post("/provider/services", data);
export const updateService = (id: string, data: any) => API.put(`/provider/services/${id}`, data);
export const deleteService = (id: string) => API.delete(`/provider/services/${id}`);
export const getProviderAnalytics = () => API.get("/provider/analytics");
export const getPeakHours = () => API.get("/provider/ai/peak-hours");
export const getAISuggestions = () => API.get("/provider/ai/suggestions");

// ADMIN APIs
export const getPlatformStats = () => API.get("/admin/stats");
export const getAllUsers = (params?: { search?: string; role?: string; status?: string; page?: number }) => API.get("/admin/users", { params });
export const updateUserStatus = (id: string, status: string) => API.put(`/admin/users/${id}/status`, { status });
export const getAllProviders = (params?: { status?: string }) => API.get("/admin/providers", { params });
export const verifyProvider = (id: string) => API.put(`/admin/providers/${id}/verify`);
export const suspendProvider = (id: string) => API.put(`/admin/providers/${id}/suspend`);
export const getAllBookings = (params?: { page?: number; limit?: number }) => API.get("/admin/bookings", { params });
export const getPlatformAnalytics = () => API.get("/admin/analytics");

export default API;