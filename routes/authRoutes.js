const express = require("express");
const router = express.Router();
const { login, registerUser, registerAdmin, updateUserRole } = require("../controllers/authController");
const { protect, admin } = require("../middleware/auth");

router.post("/register", registerUser);
router.post("/register-admin", protect, admin, registerAdmin);
router.put("/update-role", protect, admin, updateUserRole);
router.post("/login", login);

module.exports = router;