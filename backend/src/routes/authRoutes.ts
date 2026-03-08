// authRoutes.ts — defines the URL endpoints for authentication
// A route connects a URL + HTTP method to a controller function

import { Router } from "express";
import { register, login, getMe } from "../controllers/authController";
import { authenticate } from "../middleware/auth";

// Router is a mini Express app — we mount it on a path in index.ts
const router = Router();

// POST /api/auth/register — create new account
router.post("/register", register);

// POST /api/auth/login — login and get token
router.post("/login", login);

// GET /api/auth/me — get current user (protected)
// authenticate runs first — if token is invalid, getMe never runs
router.get("/me", authenticate, getMe);

export default router;