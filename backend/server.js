require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");
const orderRoutes = require("./routes/orders");
const userRoutes = require("./routes/users");
const couponRoutes = require("./routes/coupons");
const paymentRoutes = require("./routes/payment");

const app = express();

app.use(express.json());
app.use(cookieParser()); // required to read the JWT http-only cookie in middleware/auth.js
app.use(
  cors({
    origin: [
      process.env.CLIENT_URL, // Local dev or primary environment variable
      "https://bormonshop-bd.netlify.app" // Production Netlify origin
    ],
    credentials: true, // allow cookies to be sent cross-origin
  })
);

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/payment", paymentRoutes);

// Centralized error handler — catches anything thrown/passed via next(err) that
// individual route handlers didn't already respond to.
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ success: false, message: err.message || "Server error" });
});

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(process.env.PORT || 5000, () =>
      console.log(`Server running on port ${process.env.PORT || 5000}`)
    );
  })
  .catch((err) => console.error("MongoDB connection error:", err));
