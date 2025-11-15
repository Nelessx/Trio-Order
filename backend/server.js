import express from "express";
import cors from "cors";
import "dotenv/config";
import { connectDB } from "./config/db.js";
import userRouter from "./routes/userRoutes.js";
import adminRouter from "./routes/adminRoutes.js";
import path from "path";
import { fileURLToPath } from "url";
import itemRouter from "./routes/itemRoute.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";
import specialOfferRouter from "./routes/specialOfferRoute.js";
import recommendationRouter from "./routes/recommendationRoute.js";
import contactRouter from "./routes/contactRoute.js";
import notificationRouter from "./routes/notificationRoute.js";

const app = express();
const port = process.env.PORT || 4000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigin = ["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"];
      if (!origin || allowedOrigin.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("not allowed by cors"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database
connectDB();

// Routes
app.use("/api/user", userRouter);
app.use("/api/admin", adminRouter);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/items", itemRouter);
app.use("/api/cart", cartRouter);
app.use("/api/orders", orderRouter);
app.use("/api/special-offers", specialOfferRouter);
app.use("/api/recommendations", recommendationRouter);
app.use("/api/contact", contactRouter);
app.use("/api/notifications", notificationRouter);

app.get("/", (req, res) => {
  res.send("API working");
});

app.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`);
});
