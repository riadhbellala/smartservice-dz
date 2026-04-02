import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth";
import {
  getPlatformStats, getAllUsers, updateUserStatus,
  getAllProviders, verifyProvider, suspendProvider,
  getAllBookings, getPlatformAnalytics
} from "../controllers/adminController";

const router = Router();

router.use(authenticate, authorize("ADMIN"));

router.get("/stats", getPlatformStats);
router.get("/users", getAllUsers);
router.put("/users/:id/status", updateUserStatus);
router.get("/providers", getAllProviders);
router.put("/providers/:id/verify", verifyProvider);
router.put("/providers/:id/suspend", suspendProvider);
router.get("/bookings", getAllBookings);
router.get("/analytics", getPlatformAnalytics);

export default router;
