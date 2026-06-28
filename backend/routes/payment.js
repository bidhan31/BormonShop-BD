const express = require("express");
const router = express.Router();
const {
  initiatePayment,
  paymentSuccess,
  paymentFail,
  paymentCancel,
  paymentIPN,
} = require("../controllers/paymentController");
const { protect } = require("../middleware/auth");

// Customer must be logged in to start a payment session
router.post("/init", protect, initiatePayment);

// SSLCommerz calls these directly (server-to-server / browser redirect) — no auth middleware,
// since the gateway itself is the caller, not a logged-in browser session.
router.post("/success", paymentSuccess);
router.post("/fail", paymentFail);
router.post("/cancel", paymentCancel);
router.post("/ipn", paymentIPN);

module.exports = router;
