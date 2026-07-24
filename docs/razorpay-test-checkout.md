# Razorpay test checkout

## Purpose

Pastalo remains a showcase storefront, but `/checkout` now demonstrates a real
India-ready payment flow in Razorpay **test mode**. No customer money is taken
while the account remains in test mode.

## Environment

Keep these values only in `.env.local` or deployment secrets:

```env
VITE_RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
```

The key ID is intentionally returned to Razorpay Checkout. The secret never
leaves the server and must never be committed or sent to a browser.

## Flow

```text
Checkout form
  -> createRazorpayCheckout server function
  -> calculate current catalog price and availability on server
  -> Razorpay Order API (INR test order)
  -> orders + order_items + order_addresses + payments tables
  -> Razorpay Checkout modal
  -> verifyRazorpayCheckout server function
  -> verify HMAC signature and retrieve payment from Razorpay
  -> reduce inventory, record sale movement, confirm order/payment
```

The browser never supplies the payable amount. The server derives it from the
active product variant price and validates stock before opening Razorpay.

## Database records

`payments` is provider-neutral at the order boundary and records provider
order/payment IDs, amount, currency, status, and payment timestamp. Existing
`orders`, `order_items`, `order_addresses`, `inventory_levels`, and
`inventory_movements` provide the checkout and stock audit trail.

## Test checklist

1. Use Razorpay Dashboard **Test Mode**.
2. Visit `/checkout`, complete every required delivery field, and select Pay.
3. Use a Razorpay-provided test payment method in the modal.
4. Confirm the success message, the `payments` row, confirmed `orders` row,
   and inventory movement in Neon.
5. Before live sales, replace the test keys with the client’s live keys and
   add a signed webhook endpoint plus reservation expiry handling.

## Client handover

When selling this website, the client creates and verifies their own Razorpay
account, sets their own keys and webhooks, and remains the payment-data owner.
# Razorpay webhook recovery

Checkout confirms payments immediately in the browser and `/api/razorpay-webhook`
recovers a payment if the browser closes before that callback returns.

Before using this outside local development:

1. Deploy the app to a public HTTPS URL.
2. In Razorpay Dashboard → Developers → Webhooks, add
   `https://your-domain.com/api/razorpay-webhook`.
3. Subscribe to `payment.captured` and `order.paid`.
4. Create a separate webhook secret, set it as `RAZORPAY_WEBHOOK_SECRET`, and
   never expose it to the browser.

Razorpay cannot deliver webhooks to `localhost`; use test mode and a public
tunnel or staging deployment when testing the endpoint.
