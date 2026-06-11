const Booking = require("../models/Booking");
const User = require("../models/User");

const generateBookingId = async () => {
  const length = Math.floor(Math.random() * 2) + 5; // 5 or 6 digits
  let bookingId;
  let exists = true;

  while (exists) {
    bookingId = Math.floor(Math.random() * Math.pow(10, length)).toString().padStart(length, '0');
    exists = await Booking.exists({ bookingId });
  }

  return bookingId;
};

const createBooking = async (req, res) => {
  try {
    const {
      serviceName,
      bookingDate,
      notes,
      customerName,
      customerEmail,
      customerPhone,
    } = req.body;

    const bookingId = await generateBookingId();

    const booking = await Booking.create({
      bookingId,
      user: req.user._id,
      serviceName,
      bookingDate,
      notes,
      customerName,
      customerEmail,
      customerPhone,
    });

    const populatedBooking = await Booking.findById(booking._id).populate(
      "user",
      "name email"
    );

    res.status(201).json({
      message: "Booking created successfully",
      booking: populatedBooking,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getAllBookings = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Booking.countDocuments();
    const bookings = await Booking.find()
      .populate("user", "name email")
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      bookings,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getMyBookings = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || "";

    const searchQuery = {
      user: req.user._id,
      $or: [
        { bookingId: { $regex: search, $options: "i" } },
        { serviceName: { $regex: search, $options: "i" } },
        { customerName: { $regex: search, $options: "i" } },
        { customerEmail: { $regex: search, $options: "i" } },
        { customerPhone: { $regex: search, $options: "i" } },
        { notes: { $regex: search, $options: "i" } },
      ],
    };

    const total = await Booking.countDocuments(searchQuery);
    const bookings = await Booking.find(searchQuery)
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      bookings,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getDashboard = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get recent 10 bookings
    const recentBookings = await Booking.find({ user: userId })
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .limit(10);

    // Get booking stats
    const total = await Booking.countDocuments({ user: userId });
    const pending = await Booking.countDocuments({ user: userId, status: "pending" });
    const confirmed = await Booking.countDocuments({ user: userId, status: "confirmed" });
    const cancelled = await Booking.countDocuments({ user: userId, status: "cancelled" });
    const completed = await Booking.countDocuments({ user: userId, status: "completed" });

    res.status(200).json({
      recentBookings,
      stats: {
        total,
        pending,
        confirmed,
        cancelled,
        completed,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getBookingDetails = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const booking = await Booking.findById(bookingId).populate("user", "name email");

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    res.status(200).json({
      booking,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getAdminDashboard = async (req, res) => {
  try {
    // Get recent 10 bookings (all users)
    const recentBookings = await Booking.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .limit(10);

    // Get booking stats
    const totalBookings = await Booking.countDocuments();
    const pending = await Booking.countDocuments({ status: "pending" });
    const confirmed = await Booking.countDocuments({ status: "confirmed" });
    const cancelled = await Booking.countDocuments({ status: "cancelled" });
    const completed = await Booking.countDocuments({ status: "completed" });

    // Get user stats
    const totalUsers = await User.countDocuments();
    const activeBookings = pending + confirmed;
    const completionRate = totalBookings > 0 ? ((completed / totalBookings) * 100).toFixed(2) : 0;

    res.status(200).json({
      recentBookings,
      bookingStats: {
        total: totalBookings,
        pending,
        confirmed,
        cancelled,
        completed,
      },
      userStats: {
        totalUsers,
        activeBookings,
        completionRate: parseFloat(completionRate),
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const updateBookingStatus = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const { status } = req.body;

    const validStatuses = ["pending", "confirmed", "cancelled", "completed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid status. Status must be one of: pending, confirmed, cancelled, completed",
      });
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      { status },
      { new: true }
    ).populate("user", "name email");

    if (!updatedBooking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    res.status(200).json({
      message: "Booking status updated successfully",
      booking: updatedBooking,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createBooking,
  getAllBookings,
  getMyBookings,
  getDashboard,
  getBookingDetails,
  getAdminDashboard,
  updateBookingStatus,
};
