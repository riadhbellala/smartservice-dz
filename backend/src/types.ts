// types.ts — all our TypeScript interfaces in one place
// An interface is like a "shape contract" — it describes what an object looks like
// TypeScript will error if you pass the wrong shape anywhere

// Extends Express's Request type to include our user data
// After JWT verification, we attach the user to the request object
// This way any route handler can access req.user
import { Request } from "express";

export interface AuthUser {
  id: string;
  email: string;
  role: "USER" | "PROVIDER" | "ADMIN";
}

// Custom Request type that includes our user
// We use this in protected routes instead of plain Request
export interface AuthRequest extends Request {
  user?: AuthUser;
}

// Shape of data coming from register form
export interface RegisterBody {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: "USER" | "PROVIDER";
}

// Shape of data coming from login form
export interface LoginBody {
  email: string;
  password: string;
}