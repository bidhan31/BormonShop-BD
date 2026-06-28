const express = require("express");
const router = express.Router();
const { validateCoupon } = require("../controllers/orderController");
const { protect } = require("../middleware/auth");

router.post("/validate", protect, validateCoupon);

module.exports = router;
