const express = require("express");
const router = express.Router();

const {
  createBooking,
  getAllBookings,
  getMyBookings,
} = require("../controllers/bookingController");
const { protect } = require("../middleware/authMiddleware");

router.route("/")
  .post(protect, createBooking)
  .get(protect, getAllBookings);

router.get("/mybookings", protect, getMyBookings);

module.exports = router;
