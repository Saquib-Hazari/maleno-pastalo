# Transactional order email

After Razorpay payment verification, Pastalo sends a responsive Molino Pastello
order confirmation through Resend. It includes product images, ordered items,
total paid, delivery address, and a tracking link.

Required production secrets:

```env
RESEND_API_KEY=re_...
EMAIL_FROM="Molino Pastello <orders@your-domain.com>"

# Local development only: Resend's test sender can deliver only to the
# Resend account owner's email. Remove this once your domain is verified.
EMAIL_TO=saquibhazari1000@gmail.com
APP_URL=https://your-domain.com
```

Verify the `EMAIL_FROM` domain in Resend before production sending. Delivery
errors are logged and do not reverse a confirmed payment. A Razorpay webhook
should eventually retry this notification for payments confirmed after a lost
browser connection.
