import express from "express";
import {
  getDetailPlatformController,
  getMinimalPlatformController,
  patchPlatformController,
  postPlatformController,
  patchProfileController,
  postProfileController,
  getProfileController,
  extractUserInfoEndpoint
} from "../controllers/user.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
const router = express.Router();

router.use(authMiddleware);
router.get("/profile", getProfileController);
router.patch("/profile/:profile_id", patchProfileController);
router.post("/profile", postProfileController);
router.patch("/platform/:platform_id", patchPlatformController);
router.get("/platform/:platform_id", getDetailPlatformController);
router.post("/platform", postPlatformController);
router.get("/platform", getMinimalPlatformController);
router.get("/extract", extractUserInfoEndpoint);
export default router;
