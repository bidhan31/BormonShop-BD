const Order = require("../models/Order");
const Product = require("../models/Product");
const Coupon = require("../models/Coupon");
const mongoose = require("mongoose");

// Generates a human-friendly, sortable order number like "BSBD-20260628-0007"
async function generateOrderNumber() {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const countToday = await Order.countDocuments({
    createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
  });
  const sequence = String(countToday + 1).padStart(4, "0");
  return `BSBD-${datePart}-${sequence}`;
}

/**
 * POST /api/orders
 * Creates an order from the checkout form. Validates stock, applies coupon if present,
 * decrements variant stock, and snapshots item details so later product edits don't
 * retroactively change historical orders.
 */
exports.createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, couponCode } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }
    if (!["COD", "SSLCommerz"].includes(paymentMethod)) {
      return res.status(400).json({ success: false, message: "Invalid payment method" });
    }

    // Re-validate price + stock server-side — never trust prices sent from the client
    const orderItems = [];
    let subtotal = 0;

    for (const item of items) {
      if (!item) {
        return res.status(400).json({ success: false, message: "Invalid item data" });
      }

      const productId = item.productId.toString();
      console.log(`Validating product ${productId} (${item.name}) for order creation...`);

      // findOne instead of findById — avoids ObjectId casting for string-typed _id fields
      const product = await Product.findById(new mongoose.Types.ObjectId(productId));
      console.log(`Product fetched: ${product ? product.name : "not found"}`);
      if (!product || !product.isActive) {  
        return res.status(400).json({ success: false, message: `Product unavailable: ${item.name}` });
      }

      const variant = product.variants.find((v) => v.size === item.size && v.color === item.color);
      if (!variant || variant.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name} (${item.size}/${item.color})`,
        });
      }

      const unitPrice = product.discountPrice ?? product.price;
      subtotal += unitPrice * item.quantity;

      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.images[0],
        size: item.size,
        color: item.color,
        price: unitPrice,
        quantity: item.quantity,
      });

      // Atomic stock decrement — avoids optimistic concurrency (VersionError) entirely
      await Product.findOneAndUpdate(
        { _id: productId, "variants.size": item.size, "variants.color": item.color },
        { $inc: { "variants.$.stock": -item.quantity } }
      );
    }

    // Apply coupon if provided
    let discount = 0;
    let appliedCouponCode;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
      if (coupon) {
        const calculated = coupon.calculateDiscount(subtotal);
        if (calculated !== null) {
          discount = calculated;
          appliedCouponCode = coupon.code;
          coupon.usedCount += 1;
          await coupon.save();
        }
      }
    }

    const shippingFee = subtotal >= 2000 ? 0 : 80; // free shipping over ৳2000, flat ৳80 otherwise
    const total = subtotal - discount + shippingFee;

    const order = await Order.create({
      user: req.user._id,
      orderNumber: await generateOrderNumber(),
      items: orderItems,
      shippingAddress,
      subtotal,
      discount,
      couponCode: appliedCouponCode,
      shippingFee,
      total,
      paymentMethod,
      paymentStatus: paymentMethod === "COD" ? "Pending" : "Pending",
      status: paymentMethod === "COD" ? "Confirmed" : "Pending", // COD orders confirm immediately
    });

    return res.status(201).json({ success: true, order });
  } catch (error) {
    console.error("Create order error:", error);
    return res.status(500).json({ success: false, message: "Failed to create order" });
  }
};

// GET /api/orders/my-orders — customer's own order history
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, orders });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch orders" });
  }
};

// GET /api/orders/:id — single order detail (used by order confirmation + tracking pages)
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    // Customers can only view their own orders; admins can view any
    if (req.user.role !== "admin" && order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to view this order" });
    }

    return res.status(200).json({ success: true, order });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch order" });
  }
};

// POST /api/coupons/validate — checks a coupon code against the current cart subtotal
exports.validateCoupon = async (req, res) => {
  try {
    const { code, subtotal } = req.body;
    const coupon = await Coupon.findOne({ code: code?.toUpperCase() });

    if (!coupon) {
      return res.status(404).json({ success: false, message: "Coupon code not found" });
    }

    const discount = coupon.calculateDiscount(subtotal);
    if (discount === null) {
      return res.status(400).json({ success: false, message: "This coupon is not valid for your order" });
    }

    return res.status(200).json({ success: true, discount, code: coupon.code });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to validate coupon" });
  }
};

// ---------- Admin order management ----------

// GET /api/orders/admin/all — supports ?status=&page=&limit=
exports.getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = status ? { status } : {};
    const skip = (Number(page) - 1) * Number(limit);

    const [orders, total] = await Promise.all([
      Order.find(filter).populate("user", "name email").sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Order.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      orders,
      pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch orders" });
  }
};

// PUT /api/orders/admin/:id/status — moves an order through the tracking stepper
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    order.status = status;
    if (note) order._pendingNote = note; // picked up by the pre-save hook in Order.js
    await order.save();

    return res.status(200).json({ success: true, order });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message || "Failed to update status" });
  }
};

// GET /api/orders/admin/customers — customer list for admin dashboard
exports.getCustomers = async (req, res) => {
  try {
    // Aggregate orders by customer to show total spend + order count alongside each user
    const customers = await Order.aggregate([
      {
        $group: {
          _id: "$user",
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: "$total" },
          lastOrderAt: { $max: "$createdAt" },
        },
      },
      { $sort: { lastOrderAt: -1 } },
      {
        $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "userInfo" },
      },
      { $unwind: "$userInfo" },
      {
        $project: {
          name: "$userInfo.name",
          email: "$userInfo.email",
          totalOrders: 1,
          totalSpent: 1,
          lastOrderAt: 1,
        },
      },
    ]);

    return res.status(200).json({ success: true, customers });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch customers" });
  }
};

// GET /api/orders/admin/sales-report?from=&to= — revenue summary for the admin dashboard
exports.getSalesReport = async (req, res) => {
  try {
    const { from, to } = req.query;
    const dateFilter = {};
    if (from) dateFilter.$gte = new Date(from);
    if (to) dateFilter.$lte = new Date(to);

    const match = {
      paymentStatus: "Paid",
      ...(from || to ? { createdAt: dateFilter } : {}),
    };

    const [summary] = await Order.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$total" },
          totalOrders: { $sum: 1 },
          avgOrderValue: { $avg: "$total" },
        },
      },
    ]);

    // Daily revenue breakdown — feeds a line chart on the admin dashboard
    const dailyBreakdown = await Order.aggregate([
      { $match: match },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$total" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return res.status(200).json({
      success: true,
      summary: summary || { totalRevenue: 0, totalOrders: 0, avgOrderValue: 0 },
      dailyBreakdown,
    });
  } catch (error) {
    console.error("Sales report error:", error);
    return res.status(500).json({ success: false, message: "Failed to generate sales report" });
  }
};
