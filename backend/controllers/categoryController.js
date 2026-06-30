const Category = require("../models/Category");
const cloudinary = require("../config/cloudinary");

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ order: 1 });
    return res.status(200).json({ success: true, categories });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch categories" });
  }
};

exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: "Category not found" });
    return res.status(200).json({ success: true, category });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch category" });
  }
};

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ order: 1 });
    return res.status(200).json({ success: true, categories });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch categories" });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const category = await Category.create(req.body);
    return res.status(201).json({ success: true, category });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message || "Failed to create category" });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!category) return res.status(404).json({ success: false, message: "Category not found" });
    return res.status(200).json({ success: true, category });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message || "Failed to update category" });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!category) return res.status(404).json({ success: false, message: "Category not found" });
    return res.status(200).json({ success: true, message: "Category removed" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to delete category" });
  }
};

exports.uploadCategoryImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const upload = await cloudinary.uploader.upload(req.file.path, {
      folder: "bormonshop/categories",
    });

    return res.status(200).json({ success: true, url: upload.secure_url });
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return res.status(500).json({ success: false, message: "Image upload failed" });
  }
};
