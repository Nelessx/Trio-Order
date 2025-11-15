import express from "express";
import { 
  submitContactQuery, 
  getAllContactQueries, 
  updateContactQueryStatus, 
  deleteContactQuery 
} from "../controllers/contactController.js";
import adminAuthMiddleware from "../middleware/adminAuth.js";
import authMiddleware from "../middleware/auth.js";

const contactRouter = express.Router();

// Protected route - Submit contact query (requires user authentication)
contactRouter.post("/submit", authMiddleware, submitContactQuery);

// Admin routes - Protected with admin authentication
contactRouter.get("/all", adminAuthMiddleware, getAllContactQueries);
contactRouter.put("/:id/status", adminAuthMiddleware, updateContactQueryStatus);
contactRouter.delete("/:id", adminAuthMiddleware, deleteContactQuery);

export default contactRouter;
