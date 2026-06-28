const express = require("express");
const router = express.Router();
const {
  getProducts,
  getProductBySlug,
  getRelatedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getAdminProducts,
  uploadProductImages,
  addReview,
} = require("../controllers/productController");
const { protect, adminOnly } = require("../middleware/auth");
const upload = require("../middleware/upload");

// ---------- Public ----------
router.get("/", getProducts); // supports ?q=&category=&minPrice=&maxPrice=&size=&tag=&sort=
router.get("/:slug", getProductBySlug);
router.get("/:id/related", getRelatedProducts);
router.post("/:id/reviews", protect, addReview);

// ---------- Admin only ----------
router.get("/admin/all", protect, adminOnly, getAdminProducts);
router.post("/", protect, adminOnly, createProduct);
router.put("/:id", protect, adminOnly, updateProduct);
router.delete("/:id", protect, adminOnly, deleteProduct);
router.post("/upload-images", protect, adminOnly, upload.array("images", 6), uploadProductImages);

module.exports = router;
