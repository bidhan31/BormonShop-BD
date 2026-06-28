const express = require("express");
const router = express.Router();
const { register, login, logout, getMe, googleAuth, googleRegister } = require("../controllers/authController");
const { protect } = require("../middleware/auth");

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", protect, getMe);
router.post("/google", googleAuth);
router.post("/google-register", googleRegister);

module.exports = router;
