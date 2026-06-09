const express = require("express");
const mongoose = require("mongoose");
const userRoutes = require("./routes/userRoutes");
require("dotenv").config({ path: "src/.env" });
const PORT = process.env.PORT || 5000;

const app = express();

app.use(express.json());

app.use("/api/users", userRoutes);

app.get("/", (req, res) => {
  res.send("Server Running...");
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ MongoDB Error", err));

app.listen(PORT, () => {
  console.log(`🚀 Server Started on ${PORT}`);
});