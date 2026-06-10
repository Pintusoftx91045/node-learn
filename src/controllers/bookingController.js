const Booking = require("../models/Booking");

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

module.exports = {
  createBooking,
  getAllBookings,
  getMyBookings,
};
