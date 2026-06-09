const express = require("express");
const router = express.Router();

const { createUser, getUsers, getUserById, updateUser, deleteUser, loginUser, forgotPassword, resetPassword } = require("../controllers/userController");

router.post("/register", createUser);
router.post("/login", loginUser);
router.post("/forgotpassword", forgotPassword);
router.put("/resetpassword/:resettoken", resetPassword);
router.get("/", getUsers);
router.get("/:id", getUserById);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

module.exports = router;