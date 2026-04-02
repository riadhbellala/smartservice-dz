import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { getMyNotifications, markAsRead, markAllAsRead } from "../controllers/notificationController";

const router = Router();

router.use(authenticate);

router.get("/", getMyNotifications);
router.put("/read-all", markAllAsRead);
router.put("/:id/read", markAsRead);

export default router;
