const SSLCommerzPayment = require("sslcommerz-lts");
const sslConfig = require("../config/sslcommerz");
const Order = require("../models/Order");

/**
 * STEP 1 — Initialize a payment session.
 * Called from the checkout page when the user selects "Pay Online" (SSLCommerz)
 * instead of Cash on Delivery.
 *
 * Flow:
 *   1. Client creates the Order in our DB first with paymentStatus: "Pending".
 *   2. We build the SSLCommerz session using that order's total + a unique tran_id.
 *   3. We return the gateway's GatewayPageURL — the client redirects the browser there.
 */
exports.initiatePayment = async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId).populate("user", "email name");
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    if (order.paymentMethod !== "SSLCommerz") {
      return res.status(400).json({ success: false, message: "This order is not set up for online payment" });
    }

    // tran_id must be unique per transaction attempt — we reuse the orderNumber
    // plus a timestamp so retries after a failed payment get a fresh id.
    const tran_id = `${order.orderNumber}-${Date.now()}`;

    const data = {
      total_amount: order.total,
      currency: "BDT",
      tran_id,

      // SSLCommerz will redirect/POST to these URLs depending on outcome.
      // These hit our own backend routes defined below, which then redirect
      // the user's browser onward to the appropriate Next.js page.
      success_url: `${process.env.SERVER_URL}/api/payment/success?orderId=${order._id}`,
      fail_url: `${process.env.SERVER_URL}/api/payment/fail?orderId=${order._id}`,
      cancel_url: `${process.env.SERVER_URL}/api/payment/cancel?orderId=${order._id}`,
      ipn_url: `${process.env.SERVER_URL}/api/payment/ipn`,

      shipping_method: "Courier",
      product_name: order.items.map((i) => i.name).join(", ").slice(0, 255),
      product_category: "Clothing",
      product_profile: "general",

      // Customer info — required fields per SSLCommerz API
      cus_name: order.shippingAddress.fullName,
      cus_email: order.user?.email || "guest@bormonshopbd.com",
      cus_phone: order.shippingAddress.mobileNumber,
      cus_add1: order.shippingAddress.fullAddress,
      cus_city: order.shippingAddress.city || "Dhaka",
      cus_country: "Bangladesh",

      // Shipping info — using same as billing for simplicity
      ship_name: order.shippingAddress.fullName,
      ship_add1: order.shippingAddress.fullAddress,
      ship_city: order.shippingAddress.city || "Dhaka",
      ship_country: "Bangladesh",
    };

    const sslcz = new SSLCommerzPayment(sslConfig.store_id, sslConfig.store_passwd, sslConfig.is_live);
    const apiResponse = await sslcz.init(data);

    if (!apiResponse?.GatewayPageURL) {
      return res.status(502).json({ success: false, message: "Failed to initialize SSLCommerz session" });
    }

    // Save the tran_id on the order so we can match it up in the IPN/validation step
    order.sslTransactionId = tran_id;
    await order.save();

    return res.status(200).json({ success: true, gatewayUrl: apiResponse.GatewayPageURL });
  } catch (error) {
    console.error("SSLCommerz init error:", error);
    return res.status(500).json({ success: false, message: "Payment initialization failed" });
  }
};

/**
 * STEP 2a — Success callback.
 * SSLCommerz POSTs here after the customer completes payment on their gateway page.
 * We must independently validate the transaction with SSLCommerz's Validation API
 * before trusting it — never mark an order "Paid" purely because this URL was hit,
 * since success_url can theoretically be called without genuine payment.
 */
exports.paymentSuccess = async (req, res) => {
  try {
    const { orderId } = req.query;
    const { val_id } = req.body; // SSLCommerz sends val_id in the POST body

    const order = await Order.findById(orderId);
    if (!order) return res.redirect(`${process.env.CLIENT_URL}/checkout?error=order_not_found`);

    const sslcz = new SSLCommerzPayment(sslConfig.store_id, sslConfig.store_passwd, sslConfig.is_live);
    const validation = await sslcz.validate({ val_id });

    if (validation.status === "VALID" || validation.status === "VALIDATED") {
      order.paymentStatus = "Paid";
      order.status = "Confirmed";
      order.sslValidationId = val_id;
      await order.save();
      return res.redirect(`${process.env.CLIENT_URL}/order-confirmation/${order._id}`);
    }

    // Validation failed despite hitting the success URL — treat as failed payment
    order.paymentStatus = "Failed";
    await order.save();
    return res.redirect(`${process.env.CLIENT_URL}/checkout?error=validation_failed`);
  } catch (error) {
    console.error("SSLCommerz success handler error:", error);
    return res.redirect(`${process.env.CLIENT_URL}/checkout?error=server_error`);
  }
};

/** STEP 2b — Failure callback: gateway declined the payment. */
exports.paymentFail = async (req, res) => {
  const { orderId } = req.query;
  await Order.findByIdAndUpdate(orderId, { paymentStatus: "Failed" });
  return res.redirect(`${process.env.CLIENT_URL}/checkout?error=payment_failed`);
};

/** STEP 2c — Cancel callback: user backed out of the gateway page. */
exports.paymentCancel = async (req, res) => {
  const { orderId } = req.query;
  await Order.findByIdAndUpdate(orderId, { paymentStatus: "Pending" });
  return res.redirect(`${process.env.CLIENT_URL}/checkout?info=payment_cancelled`);
};

/**
 * STEP 3 — IPN (Instant Payment Notification).
 * SSLCommerz also independently pings this server-to-server webhook, which is
 * more reliable than relying on the customer's browser hitting success_url
 * (e.g. if they close the tab right after paying). Always re-validate here too.
 */
exports.paymentIPN = async (req, res) => {
  try {
    const { val_id, tran_id } = req.body;

    const order = await Order.findOne({ sslTransactionId: tran_id });
    if (!order) return res.status(404).send("Order not found");

    const sslcz = new SSLCommerzPayment(sslConfig.store_id, sslConfig.store_passwd, sslConfig.is_live);
    const validation = await sslcz.validate({ val_id });

    if (validation.status === "VALID" || validation.status === "VALIDATED") {
      if (order.paymentStatus !== "Paid") {
        order.paymentStatus = "Paid";
        order.status = "Confirmed";
        order.sslValidationId = val_id;
        await order.save();
      }
    }

    return res.status(200).send("IPN received");
  } catch (error) {
    console.error("SSLCommerz IPN error:", error);
    return res.status(500).send("IPN processing error");
  }
};
