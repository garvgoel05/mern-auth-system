import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import { requireAuth } from "./middleware/auth.js";

dotenv.config();
connectDB();

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL, // must be exact origin (not *) when credentials:true
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);

// Example protected dummy dashboard endpoint
app.get("/api/dashboard", requireAuth, (req, res) => {
  res.json({ message: "Welcome to your protected dashboard!", userId: req.userId });
});

app.get("/", (req, res) => res.send("MERN Auth API is running"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
