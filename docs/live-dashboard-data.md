# Live dashboard data

`/admin` and `/dashboard` now read order and payment data from Neon through
server functions rather than mock arrays.

- Admin access is checked against the Clerk administrator email on every data request.
- Admin metrics include verified Razorpay revenue, paid order count, unique customer emails, saved profiles, recent orders, and a six-month revenue chart.
- Customers only receive orders matching their authenticated Clerk primary email, plus a four-week purchased-item activity chart.
- Both dashboards poll their authenticated server function every 15 seconds. This is near-real-time and light enough for the current showcase; replace it with webhook-driven push/SSE when the store needs instant multi-user updates at scale.

Orders become revenue only after a `payments.status = 'paid'` record exists. The checkout’s server verification writes that record before the dashboard picks it up.
