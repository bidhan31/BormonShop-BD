const express = require("express");
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  updatePaymentStatus,
  getCustomers,
  getSalesReport,
} = require("../controllers/orderController");
const { protect, adminOnly } = require("../middleware/auth");

// ---------- Customer ----------
router.post("/", protect, createOrder);
router.get("/my-orders", protect, getMyOrders);
router.get("/:id", protect, getOrderById);

// ---------- Admin ----------
router.get("/admin/all", protect, adminOnly, getAllOrders);
router.put("/admin/:id/status", protect, adminOnly, updateOrderStatus);
router.put("/admin/:id/payment-status", protect, adminOnly, updatePaymentStatus);
router.get("/admin/customers", protect, adminOnly, getCustomers);
router.get("/admin/sales-report", protect, adminOnly, getSalesReport);

module.exports = router;
