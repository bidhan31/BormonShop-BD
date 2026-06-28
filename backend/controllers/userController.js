const User = require("../models/User");

// GET /api/users/profile
exports.getProfile = async (req, res) => {
  return res.status(200).json({ success: true, user: req.user });
};

// PUT /api/users/profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, mobileNumber } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, mobileNumber },
      { new: true, runValidators: true }
    );
    return res.status(200).json({ success: true, user });
  } catch (error) {
    return res.status(400).json({ success: false, message: "Failed to update profile" });
  }
};

// GET /api/users/wishlist — populated with full product details for the wishlist page
exports.getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("wishlist");
    return res.status(200).json({ success: true, wishlist: user.wishlist });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch wishlist" });
  }
};

// POST /api/users/wishlist/:productId — toggles a product in/out of the wishlist
exports.toggleWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const { productId } = req.params;

    const index = user.wishlist.findIndex((id) => id.toString() === productId);
    let added;
    if (index > -1) {
      user.wishlist.splice(index, 1);
      added = false;
    } else {
      user.wishlist.push(productId);
      added = true;
    }

    await user.save();
    return res.status(200).json({ success: true, added, wishlist: user.wishlist });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to update wishlist" });
  }
};
