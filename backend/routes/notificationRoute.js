import express from "express";
import { 
  getUserNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead, 
  deleteNotification 
} from "../controllers/notificationController.js";
import authMiddleware from "../middleware/auth.js";

const notificationRouter = express.Router();

// All routes require user authentication
notificationRouter.get("/", authMiddleware, getUserNotifications);
notificationRouter.put("/:id/read", authMiddleware, markNotificationAsRead);
notificationRouter.put("/read-all", authMiddleware, markAllNotificationsAsRead);
notificationRouter.delete("/:id", authMiddleware, deleteNotification);

export default notificationRouter;
