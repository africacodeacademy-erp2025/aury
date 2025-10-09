# 🎴 Stripe Connect Quick Reference Card

## 🚀 Quick Commands

```bash
# Install dependencies
npm install stripe @stripe/stripe-js @stripe/react-stripe-js

# Start development server
npm run dev

# Forward webhooks (separate terminal)
stripe login
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

## 🔑 Environment Variables

```env
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
BASE_URL=http://localhost:3000
```

## 💳 Test Cards

| Card Number | Result |
|------------|--------|
| `4242 4242 4242 4242` | ✅ Success |
| `4000 0027 6000 3184` | 🔐 3D Secure |
| `4000 0000 0000 0002` | ❌ Declined |

**Details:** CVC: 123, Expiry: 12/34, ZIP: 12345

## 🏦 Test Banking (US)

```
Routing: 110000000
Account: 000123456789
SSN: 000-00-0000
```

## 📍 Key Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/onboard-seller` | POST | Start onboarding |
| `/api/onboard-seller/verify` | GET | Check status |
| `/api/payments` | POST | Create checkout |
| `/api/webhooks/stripe` | POST | Process events |

## 🎯 Testing Workflow

1. **Create Seller** → Sign up as creator
2. **Onboard** → Dashboard → "Start Onboarding"
3. **Create Product** → Add product details
4. **Create Customer** → Sign up as customer
5. **Purchase** → Find product → "Purchase"
6. **Verify** → Check Stripe + Firebase

## 🔔 Webhook Events

```
✅ checkout.session.completed → Create order
✅ payment_intent.succeeded   → Log payment
✅ account.updated            → Update status
✅ charge.succeeded           → Track earnings
```

## 💰 Money Flow

```
Customer Pays: $25.00
  ├─ Platform Fee: $1.25 (5%)
  ├─ Stripe Fee: ~$0.75 (2.9% + $0.30)
  └─ Seller Gets: ~$23.00
```

## 🗂️ Firebase Collections

```typescript
users/
  stripeAccountId: string
  stripeOnboardingComplete: boolean

products/
  salesCount: number

orders/
  sessionId, productId, sellerId, customerId, amount

platformEarnings/
  applicationFee, sellerId, chargeId
```

## 📱 Component Usage

```tsx
// In dashboard
import StripeConnectStatus from '@/components/creator/StripeConnectStatus';

<StripeConnectStatus user={user} />
```

## 🐛 Quick Troubleshooting

| Issue | Fix |
|-------|-----|
| Webhook fails | Check `STRIPE_WEBHOOK_SECRET` |
| Can't purchase | Seller must complete onboarding |
| Modal won't open | Check publishable key |
| Firebase error | Update security rules |

## 📖 Documentation

- `QUICKSTART.md` - Setup guide
- `STRIPE_TESTING_GUIDE.md` - Testing
- `ARCHITECTURE.md` - System design
- `IMPLEMENTATION_CHECKLIST.md` - Verification

## 🔗 Important Links

- Stripe Dashboard: https://dashboard.stripe.com
- Firebase Console: https://console.firebase.google.com
- Stripe Docs: https://stripe.com/docs/connect

## ⚡ Common Tasks

### Check Onboarding Status
```typescript
const status = await fetch(`/api/onboard-seller/verify?sellerId=${id}`);
```

### Create Payment Session
```typescript
const response = await fetch('/api/payments', {
  method: 'POST',
  body: JSON.stringify({ productId, customerId })
});
```

### Verify Webhook
```typescript
const event = stripe.webhooks.constructEvent(
  body, signature, webhookSecret
);
```

## 🎨 Status Indicators

```typescript
// Not onboarded
stripeAccountId: undefined

// Onboarding in progress
stripeOnboardingComplete: false

// Ready to sell
stripeOnboardingComplete: true
chargesEnabled: true
payoutsEnabled: true
```

## 🔐 Security Checklist

- [x] Webhook signature verification
- [x] Server-side Stripe operations
- [x] No secrets in client code
- [x] Firebase security rules
- [x] Seller validation before payment

## 📊 Success Metrics

Track:
- Onboarding completion rate
- Payment success rate
- Platform fee revenue
- Average transaction value

---

**Keep this card handy for quick reference! 🎯**
