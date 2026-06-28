/**
 * SSLCommerz configuration.
 * Uses the official `sslcommerz-lts` npm package: npm install sslcommerz-lts
 *
 * Sandbox credentials: https://developer.sslcommerz.com/registration/
 * Set these in your .env file — never commit real keys.
 */
module.exports = {
  store_id: process.env.SSLCOMMERZ_STORE_ID,
  store_passwd: process.env.SSLCOMMERZ_STORE_PASSWORD,
  is_live: process.env.NODE_ENV === "production", // false = sandbox, true = live gateway
};
