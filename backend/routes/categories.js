const express = require("express");
const router = express.Router();
const {
  getCategories,
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  uploadCategoryImage,
} = require("../controllers/categoryController");
const { protect, adminOnly } = require("../middleware/auth");
const upload = require("../middleware/upload");

router.get("/", getCategories);
router.get("/admin/all", protect, adminOnly, getAllCategories);
router.get("/:id", protect, adminOnly, getCategoryById);
router.post("/", protect, adminOnly, createCategory);
router.put("/:id", protect, adminOnly, updateCategory);
router.delete("/:id", protect, adminOnly, deleteCategory);
router.post("/upload-image", protect, adminOnly, upload.single("image"), uploadCategoryImage);

module.exports = router;
