// auth.ts — JWT verification middleware
// This runs BEFORE any protected route handler
// Think of it as a security guard at the door

import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthRequest, AuthUser } from "../types";

// Main auth middleware function
// req — the incoming request
// res — the response we can send back
// next — call this to pass control to the next handler
export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  // JWT tokens are sent in the "Authorization" header
  // Format: "Bearer eyJhbGc..."
  const authHeader = req.headers.authorization;

  // If no Authorization header — reject immediately
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ message: "No token provided" });
    return;
  }

  // Extract just the token part (remove "Bearer " prefix)
  const token = authHeader.split(" ")[1];

  try {
    // jwt.verify() does two things:
    // 1. Checks the signature (was this token created by us?)
    // 2. Checks expiry (has the token expired?)
    // If either fails, it throws an error
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as AuthUser;

    // Attach the decoded user data to the request
    // Now any route handler after this can use req.user
    req.user = decoded;

    // Call next() to pass control to the actual route handler
    next();
  } catch (error) {
    // Token is invalid or expired
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

// Role-based access control middleware
// Usage: router.get("/admin", authenticate, authorize("ADMIN"), handler)
// This is a "middleware factory" — a function that RETURNS a middleware function
export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    // If user's role is not in the allowed roles list — reject
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({
        message: "Access denied. Insufficient permissions."
      });
      return;
    }
    // Role is allowed — continue
    next();
  };
};