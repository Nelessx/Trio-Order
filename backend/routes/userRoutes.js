import express from "express";
import { 
  loginUser, 
  registerUser, 
  verifyEmail, 
  resendVerificationPin,
  requestPasswordReset,
  verifyResetPin,
  resetPassword,
  getAllUsers,
  updateUserActivity,
  toggleUserStatus,
  updateProfilePhoto
} from "../controllers/userController.js";
import adminAuthMiddleware from "../middleware/adminAuth.js";
import authMiddleware from "../middleware/auth.js";
import multer from "multer";

const userRouter = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Authentication routes
userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);

// Email verification routes
userRouter.post("/verify-email", verifyEmail);
userRouter.post("/resend-verification", resendVerificationPin);

// Password reset routes
userRouter.post("/forgot-password", requestPasswordReset);
userRouter.post("/verify-reset-pin", verifyResetPin);
userRouter.post("/reset-password", resetPassword);

// Profile photo upload route (protected)
userRouter.put("/profile-photo", authMiddleware, upload.single('profilePhoto'), updateProfilePhoto);

// User management routes (for admin) - Protected with admin authentication
userRouter.get("/all", adminAuthMiddleware, getAllUsers);
userRouter.post("/update-activity", adminAuthMiddleware, updateUserActivity);
userRouter.post("/toggle-status", adminAuthMiddleware, toggleUserStatus);

export default userRouter;
