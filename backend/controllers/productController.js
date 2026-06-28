const Product = require("../models/Product");
const cloudinary = require("../config/cloudinary");

/**
 * GET /api/products
 * Supports the storefront's "Advanced Search & Multi-criteria Filters" feature.
 * Query params (all optional):
 *   q          — text search across name/description
 *   category   — "T-Shirts" | "Shirts" | "Pants" | "Hoodies"
 *   minPrice / maxPrice
 *   size       — filters products that have a variant of this size
 *   tag        — "new-arrival" | "best-seller" | "trending"
 *   sort       — "price-asc" | "price-desc" | "newest" | "rating"
 *   page, limit — pagination
 */
exports.getProducts = async (req, res) => {
  try {
    console.log("Fetching products with query params:", req.query);
    const { q, category, minPrice, maxPrice, size, tag, sort, page = 1, limit = 12 } = req.query;

    const filter = { isActive: true };

    if (q) {
      // Simple case-insensitive text match across name and description.
      // For larger catalogs, swap this for a MongoDB text index ($text search).
      filter.$or = [{ name: { $regex: q, $options: "i" } }, { description: { $regex: q, $options: "i" } }];
    }
    if (category) filter.category = category;
    if (tag) filter.tags = tag;
    if (size) filter["variants.size"] = size;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const sortMap = {
      "price-asc": { price: 1 },
      "price-desc": { price: -1 },
      newest: { createdAt: -1 },
      rating: { rating: -1 },
    };
    const sortOption = sortMap[sort] || { createdAt: -1 };

    const skip = (Number(page) - 1) * Number(limit);

    // const [products, total] = await Promise.all([
    //   Product.find(filter).sort(sortOption).skip(skip).limit(Number(limit)),
    //   Product.countDocuments(filter),
    // ]);

    const [products, total] = await Promise.all([
      Product.find(),
      Product.countDocuments(),
    ]);

    return res.status(200).json({
      success: true,
      products,
      pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    console.error("Get products error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch products" });
  }
};

exports.getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug, isActive: true });
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    return res.status(200).json({ success: true, product });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch product" });
  }
};

exports.getRelatedProducts = async (req, res) => {
  try {
    const current = await Product.findById(req.params.id);
    if (!current) return res.status(404).json({ success: false, message: "Product not found" });

    const related = await Product.find({
      category: current.category,
      _id: { $ne: current._id },
      isActive: true,
    }).limit(4);

    return res.status(200).json({ success: true, products: related });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch related products" });
  }
};

// ---------- Admin-only below (mounted behind `protect` + `adminOnly` middleware) ----------

exports.createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    return res.status(201).json({ success: true, product });
  } catch (error) {
    console.error("Create product error:", error);
    return res.status(400).json({ success: false, message: error.message || "Failed to create product" });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    return res.status(200).json({ success: true, product });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message || "Failed to update product" });
  }
};

// Soft delete — keeps the product record (and its order history references) intact
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    return res.status(200).json({ success: true, message: "Product removed" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to delete product" });
  }
};

// Admin product list — includes inactive products, unlike the public getProducts
exports.getAdminProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, products });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch products" });
  }
};

// Uploads images to Cloudinary — called by the admin "Add Product" form before createProduct
exports.uploadProductImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: "No files uploaded" });
    }

    const uploads = await Promise.all(
      req.files.map((file) =>
        cloudinary.uploader.upload(file.path, { folder: "bormonshop/products" })
      )
    );

    const urls = uploads.map((u) => u.secure_url);
    return res.status(200).json({ success: true, urls });
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return res.status(500).json({ success: false, message: "Image upload failed" });
  }
};

// ---------- Reviews ----------

exports.addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    product.reviews.push({
      user: req.user._id,
      userName: req.user.name,
      rating,
      comment,
    });
    product.recalculateRating();
    await product.save();

    return res.status(201).json({ success: true, product });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message || "Failed to add review" });
  }
};
