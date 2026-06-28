const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    // password is optional for Google-only accounts; required: false allows googleId users
    password: { type: String, required: false, select: false },
    mobileNumber: { type: String, trim: true },
    role: { type: String, enum: ["customer", "admin"], default: "customer" },
    wishlist: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    // Google OAuth fields
    googleId: { type: String, sparse: true, index: true },
    avatar: { type: String }, // Google profile picture URL
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
