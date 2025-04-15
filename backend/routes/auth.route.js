import express from "express";
import {
  LoginController,
  RegisterController,
  VerifyOtpController,
  ChangePasswordController
} from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/login", LoginController);
router.post("/register", RegisterController);
router.post("/verify-otp", VerifyOtpController);
router.post("/change-password", ChangePasswordController);

export default router;
