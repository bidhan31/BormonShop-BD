const express = require("express");
const router = express.Router();
const { getProfile, updateProfile, getWishlist, toggleWishlist } = require("../controllers/userController");
const { protect } = require("../middleware/auth");

router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.get("/wishlist", protect, getWishlist);
router.post("/wishlist/:productId", protect, toggleWishlist);

module.exports = router;
