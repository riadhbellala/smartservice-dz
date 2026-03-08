import { Router } from "express";
import {
  createBooking,
  getMyBookings,
  cancelBooking
} from "../controllers/bookingController";
import { authenticate } from "../middleware/auth";

const router = Router();

// All booking routes require authentication
router.post("/", authenticate, createBooking);
router.get("/my", authenticate, getMyBookings);
router.put("/:id/cancel", authenticate, cancelBooking);

export default router;