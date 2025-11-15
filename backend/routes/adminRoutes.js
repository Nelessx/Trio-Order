import express from "express";
import { 
  loginAdmin, 
  registerAdmin, 
  verifyAdminEmail, 
  resendAdminVerificationPin,
  requestAdminPasswordReset,
  verifyAdminResetPin,
  resetAdminPassword,
  approveAdmin,
  rejectAdmin
} from "../controllers/adminController.js";

const adminRouter = express.Router();

// Admin authentication routes
adminRouter.post("/register", registerAdmin);
adminRouter.post("/login", loginAdmin);

// Owner approval routes (no authentication needed - token-based)
adminRouter.get("/approve/:token", approveAdmin);
adminRouter.get("/reject/:token", rejectAdmin);

// Admin email verification routes
adminRouter.post("/verify-email", verifyAdminEmail);
adminRouter.post("/resend-verification", resendAdminVerificationPin);

// Admin password reset routes
adminRouter.post("/forgot-password", requestAdminPasswordReset);
adminRouter.post("/verify-reset-pin", verifyAdminResetPin);
adminRouter.post("/reset-password", resetAdminPassword);

export default adminRouter;

