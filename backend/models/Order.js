const mongoose = require("mongoose");
const { Schema } = mongoose;

/**
 * Snapshot of a purchased item at the time of order.
 * Deliberately denormalized (price, name, image copied in) so that later
 * price changes or product edits never alter historical order records.
 */
const orderItemSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    image: { type: String, required: true },
    size: { type: String, required: true },
    color: { type: String, required: true },
    price: { type: Number, required: true }, // price paid per unit at purchase time
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const shippingAddressSchema = new Schema(
  {
    fullName: { type: String, required: true, trim: true },
    mobileNumber: {
      type: String,
      required: true,
      // Basic BD mobile number validation: 01XXXXXXXXX (11 digits)
      match: [/^01[3-9]\d{8}$/, "Please provide a valid Bangladeshi mobile number"],
    },
    fullAddress: { type: String, required: true, trim: true },
    city: { type: String, trim: true },
    district: { type: String, trim: true },
  },
  { _id: false }
);

// Tracks each stage the order passes through — powers the Live Order Tracking stepper UI
const ORDER_STATUSES = [
  "Pending",
  "Confirmed",
  "Processing",
  "Shipped",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
];

const orderSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },

    orderNumber: {
      type: String,
      required: true,
      unique: true,
      // e.g. "BSBD-20260628-0007" — human-friendly, sortable, and shown to the customer
    },

    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (arr) => arr.length > 0,
        message: "Order must contain at least one item",
      },
    },

    shippingAddress: { type: shippingAddressSchema, required: true },

    // --- Pricing breakdown ---
    subtotal: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 }, // amount knocked off by coupon
    couponCode: { type: String, trim: true, uppercase: true },
    shippingFee: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 }, // subtotal - discount + shippingFee

    // --- Payment ---
    paymentMethod: {
      type: String,
      enum: ["COD", "SSLCommerz"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed", "Refunded"],
      default: "Pending",
    },
    // SSLCommerz-specific fields — populated once the gateway responds (see routes/payment.js)
    sslTransactionId: { type: String, index: true, sparse: true },
    sslValidationId: { type: String },

    // --- Fulfillment / tracking stepper ---
    status: {
      type: String,
      enum: ORDER_STATUSES,
      default: "Pending",
      index: true,
    },
    statusHistory: [
      {
        status: { type: String, enum: ORDER_STATUSES },
        changedAt: { type: Date, default: Date.now },
        note: String,
      },
    ],
  },
  { timestamps: true }
);

// Whenever `status` changes, push exactly one entry into statusHistory automatically.
// This is what the front-end "Live Order Tracking" stepper reads from. Callers that
// want to attach a note (e.g. the admin updating status) should set `order._pendingNote`
// before calling save() — see orderController.updateOrderStatus — rather than pushing
// to statusHistory themselves, which would create a duplicate entry alongside this hook.
orderSchema.pre("save", function (next) {
  if (this.isModified("status")) {
    this.statusHistory.push({
      status: this.status,
      changedAt: new Date(),
      note: this._pendingNote || undefined,
    });
    this._pendingNote = undefined;
  }
  next();
});

orderSchema.index({ createdAt: -1 }); // for admin "recent orders" dashboard queries

module.exports = mongoose.model("Order", orderSchema);
module.exports.ORDER_STATUSES = ORDER_STATUSES;
