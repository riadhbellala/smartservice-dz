import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes";
import providerRoutes from "./routes/providerRoutes";
import bookingRoutes from "./routes/bookingRoutes";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/providers", providerRoutes);
app.use("/api/bookings", bookingRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "SmartService DZ API is running!" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
app.get("/test", (req, res) => {
  res.json({ message: "direct route works!" });
});