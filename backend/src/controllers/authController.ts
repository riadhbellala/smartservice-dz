// authController.ts — handles register and login logic
// A controller receives a request, does the work, sends a response

import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../db";
import { RegisterBody, LoginBody } from "../types";

// ============================================================
// REGISTER
// ============================================================
export const register = async (req: Request, res: Response) => {
  // Destructure the request body
  const { email, password, firstName, lastName, phone, role }: RegisterBody = req.body;

  // Basic validation — make sure required fields exist
  if (!email || !password || !firstName || !lastName) {
    res.status(400).json({ message: "All fields are required" });
    return;
  }

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ message: "Invalid email format" });
    return;
  }

  // Password strength check
  if (password.length < 6) {
    res.status(400).json({ message: "Password must be at least 6 characters" });
    return;
  }

  try {
    // Check if email already exists
    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );
    // $1 is a placeholder — pg replaces it with the value safely
    // This prevents SQL injection attacks

    if (existingUser.rows.length > 0) {
      res.status(409).json({ message: "Email already registered" });
      return;
    }

    // Hash the password
    // bcrypt.hash(password, saltRounds)
    // saltRounds = 10 means bcrypt runs 2^10 = 1024 iterations
    // More iterations = harder to crack but slower to compute
    // 10 is the industry standard balance
    const hashedPassword = await bcrypt.hash(password, 10);

    // Only allow USER or PROVIDER roles on registration
    // ADMIN accounts are created manually — never through public API
    const userRole = role === "PROVIDER" ? "PROVIDER" : "USER";

    // Insert the new user into the database
    const result = await pool.query(
      `INSERT INTO users (email, password, first_name, last_name, phone, role)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email, first_name, last_name, role, created_at`,
      [email, hashedPassword, firstName, lastName, phone || null, userRole]
    );
    // RETURNING means PostgreSQL gives us back the created row
    // We never return the password field

    const newUser = result.rows[0];

    // Auto-create a provider profile if the role is PROVIDER
    if (userRole === "PROVIDER") {
      await pool.query(
        `INSERT INTO provider_profiles (user_id, business_name, description, created_at, updated_at)
         VALUES ($1, $2, $3, NOW(), NOW())`,
        [newUser.id, `${newUser.first_name} ${newUser.last_name}`, ""]
      );
    }

    // Create JWT token
    // jwt.sign(payload, secret, options)
    // payload = data to store inside the token
    // secret = our JWT_SECRET from .env
    // expiresIn = token expires after 7 days
    const token = jwt.sign(
      {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    // Send success response
    res.status(201).json({
      message: "Account created successfully!",
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.first_name,
        lastName: newUser.last_name,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
};

// ============================================================
// LOGIN
// ============================================================
export const login = async (req: Request, res: Response) => {
  const { email, password }: LoginBody = req.body;

  if (!email || !password) {
    res.status(400).json({ message: "Email and password are required" });
    return;
  }

  try {
    // Find user by email
    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1 AND is_active = true",
      [email]
    );

    // User not found
    if (result.rows.length === 0) {
      // Important: don't say "email not found" — that reveals which emails exist
      // Always say "invalid credentials" for security
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    const user = result.rows[0];

    // Compare the plain password with the hashed one in DB
    // bcrypt.compare() hashes the plain password the same way and compares
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    // Create JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    // Send response — never include password in response!
    res.json({
      message: "Login successful!",
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
};

// ============================================================
// GET CURRENT USER (protected route test)
// ============================================================
export const getMe = async (req: Request, res: Response) => {
  // req.user is set by the authenticate middleware
  const userId = (req as any).user.id;

  try {
    const result = await pool.query(
      `SELECT id, email, first_name, last_name, phone, role, created_at
       FROM users WHERE id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};