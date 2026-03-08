// All shared TypeScript interfaces for the frontend

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "USER" | "PROVIDER" | "ADMIN";
}

export interface Provider {
  id: string;
  businessName: string;
  description: string;
  address: string;
  city: string;
  wilaya: string;
  category: string;
  avgRating: number;
  totalReviews: number;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
}

export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  status: "AVAILABLE" | "BOOKED" | "BLOCKED";
}

export interface Appointment {
  id: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  notes: string;
  serviceName: string;
  serviceDuration: number;
  servicePrice: number;
  providerName: string;
  providerCity: string;
  startTime: string;
  endTime: string;
}