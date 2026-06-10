const express = require("express");
const router = express.Router();

const { createUser, getUsers, getUserById, updateUser, deleteUser, loginUser, forgotPassword, resetPassword, getProfile, updateProfile } = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

router.post("/register", createUser);
router.post("/login", loginUser);
router.post("/forgotpassword", forgotPassword);
router.put("/resetpassword/:resettoken", resetPassword);

router.route("/profile")
  .get(protect, getProfile)
  .put(protect, updateProfile);

router.get("/", getUsers);
router.get("/:id", getUserById);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

module.exports = router;