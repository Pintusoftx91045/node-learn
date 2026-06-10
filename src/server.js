const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
const bookingRoutes = require("./routes/bookingRoutes");

require("dotenv").config({ path: "src/.env" });

const PORT = process.env.PORT || 5000;

const app = express();

// CORS Configuration
app.use(
  cors({
    origin: [
      "http://localhost:5173", // Vite local
      "http://localhost:3000", // Next.js local
      "https://your-frontend-domain.vercel.app", // Live frontend URL
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);

app.use(express.json());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/bookings", bookingRoutes);

app.get("/", (req, res) => {
  res.send("Server Running...");
});

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ MongoDB Error", err));

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server Started on ${PORT}`);
});