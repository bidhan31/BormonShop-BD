const multer = require("multer");
const path = require("path");
const os = require("os");

// Files are temporarily written to the OS tmp dir, then streamed to Cloudinary
// in productController.uploadProductImages, then discarded — never stored permanently on disk.
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, os.tmpdir()),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

function fileFilter(req, file, cb) {
  const allowed = ["image/jpeg", "image/png", "image/webp"];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Only JPEG, PNG, and WEBP images are allowed"));
}

module.exports = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 6 }, // 5MB per file, max 6 images per product
});
