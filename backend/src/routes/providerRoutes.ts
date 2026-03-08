import { Router } from "express";
import {
  getProviders,
  getProviderById,
  getProviderSlots
} from "../controllers/providerController";

const router = Router();

router.get("/", getProviders);
router.get("/:id", getProviderById);
router.get("/:id/slots", getProviderSlots);

export default router;