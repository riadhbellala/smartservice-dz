import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth";
import {
  getMyProfile, updateMyProfile, getMyBookings, updateBookingStatus,
  getMySlots, createSlot, createBulkSlots, deleteSlot,
  getMyServices, createService, updateService, deleteService,
  getMyAnalytics, getPeakHours, getAISuggestions
} from "../controllers/providerDashboardController";

const router = Router();

router.use(authenticate, authorize("PROVIDER"));

router.get("/profile", getMyProfile);
router.put("/profile", updateMyProfile);

router.get("/bookings", getMyBookings);
router.put("/bookings/:id", updateBookingStatus);

router.get("/slots", getMySlots);
router.post("/slots", createSlot);
router.post("/slots/bulk", createBulkSlots);
router.delete("/slots/:id", deleteSlot);

router.get("/services", getMyServices);
router.post("/services", createService);
router.put("/services/:id", updateService);
router.delete("/services/:id", deleteService);

router.get("/analytics", getMyAnalytics);
router.get("/ai/peak-hours", getPeakHours);
router.get("/ai/suggestions", getAISuggestions);

export default router;
