const express = require("express");
const router = express.Router();

const {
  createBooking,
  getAllBookings,
  getMyBookings,
  getDashboard,
  getBookingDetails,
  getAdminDashboard,
  updateBookingStatus,
} = require("../controllers/bookingController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.route("/")
  .post(protect, createBooking)
  .get(protect, getAllBookings);

router.get("/mybookings", protect, getMyBookings);
router.get("/dashboard", protect, getDashboard);
router.get("/:id", protect, getBookingDetails);
router.get("/admin/dashboard", protect, adminOnly, getAdminDashboard);
router.put("/admin/:id/status", protect, adminOnly, updateBookingStatus);

module.exports = router;
