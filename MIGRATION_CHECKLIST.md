# Migration Checklist: Stripe Connect → PayPal Payouts

Use this checklist to ensure smooth migration from Stripe Connect to PayPal Payouts.

## ✅ Pre-Migration

- [x] PayPal Business account created
- [x] PayPal Developer credentials obtained
- [x] Environment variables configured
- [x] PayPal SDK installed
- [x] TypeScript types installed

## ✅ Code Implementation

- [x] Created `lib/paypal.ts` utility library
- [x] Created `/api/onboard-seller` endpoint (PayPal version)
- [x] Created `/api/onboard-seller/verify` endpoint (PayPal version)
- [x] Created `/api/payouts/process` endpoint
- [x] Created `/api/payouts/trigger` endpoint
- [x] Created `PayPalOnboarding.tsx` component
- [x] Updated `types/index.d.ts` with PayPal fields
- [x] All TypeScript errors resolved

## 📋 Migration Steps

### Step 1: Update UI Components

- [ ] Find all instances of `StripeConnectStatus` component
- [ ] Replace with `PayPalOnboarding` component
- [ ] Test seller onboarding flow

**Files to check:**
```bash
# Search for StripeConnectStatus usage
grep -r "StripeConnectStatus" app/
```

**Example replacement:**
```tsx
// Before
import StripeConnectStatus from "@/components/creator/StripeConnectStatus";
<StripeConnectStatus user={user} />

// After
import PayPalOnboarding from "@/components/creator/PayPalOnboarding";
<PayPalOnboarding user={user} />
```

### Step 2: Update Earnings Calculation

- [ ] Review `calculateSellerEarnings()` in `/api/payouts/trigger/route.ts`
- [ ] Implement your business logic for calculating seller earnings
- [ ] Test with sample data

**Location:** `app/api/payouts/trigger/route.ts` (line ~135)

### Step 3: Update Order Processing

- [ ] Add `payoutProcessed` field when creating orders
- [ ] Mark orders as paid after payout processing
- [ ] Update any order-related queries

**Example:**
```typescript
// When creating an order
await firebaseDb.collection("orders").add({
  // ... other fields
  payoutProcessed: false, // Add this
});

// After payout
await firebaseDb.collection("orders").doc(orderId).update({
  payoutProcessed: true,
  payoutDate: new Date().toISOString(),
});
```

### Step 4: Database Migration (Existing Users)

If you have existing sellers with Stripe accounts:

- [ ] Create migration script to notify existing sellers
- [ ] Add grace period for sellers to add PayPal email
- [ ] Update user records with PayPal information

**Migration script template:**
```typescript
async function migrateExistingSellers() {
  const sellers = await firebaseDb
    .collection("users")
    .where("role", "in", ["creator", "craft-business"])
    .get();
  
  for (const sellerDoc of sellers.docs) {
    const data = sellerDoc.data();
    if (data.stripeAccountId && !data.paypalEmail) {
      // Send email notification to add PayPal email
      console.log(`Notify seller ${sellerDoc.id} to add PayPal email`);
    }
  }
}
```

### Step 5: Testing

- [ ] Test in PayPal Sandbox mode
- [ ] Test seller onboarding flow
- [ ] Test individual payout processing
- [ ] Test bulk payout processing
- [ ] Test dry-run mode
- [ ] Test error handling (invalid emails, etc.)

**Test checklist:**
```bash
# 1. Onboard test seller
curl -X POST http://localhost:3000/api/onboard-seller \
  -H "Content-Type: application/json" \
  -d '{"sellerId":"test123","paypalEmail":"sb-test@sandbox.paypal.com"}'

# 2. Verify onboarding
curl http://localhost:3000/api/onboard-seller/verify?sellerId=test123

# 3. Check pending payouts (dry run)
curl -X POST http://localhost:3000/api/payouts/trigger \
  -H "Content-Type: application/json" \
  -d '{"minimumPayout":10,"dryRun":true}'

# 4. Process test payout
curl -X POST http://localhost:3000/api/payouts/process \
  -H "Content-Type: application/json" \
  -d '{"sellerId":"test123","amount":10.00,"currency":"USD"}'
```

### Step 6: Security

- [ ] Add authentication to payout endpoints
- [ ] Add admin-only checks for `/api/payouts/trigger`
- [ ] Add rate limiting
- [ ] Add request validation
- [ ] Add logging for all payout attempts

**Example middleware:**
```typescript
// middleware.ts or in route handlers
function requireAdmin(userId: string) {
  // Check if user is admin
  const user = await firebaseDb.collection("users").doc(userId).get();
  if (user.data()?.role !== "admin") {
    throw new Error("Unauthorized");
  }
}
```

### Step 7: Monitoring & Alerts

- [ ] Set up error monitoring (Sentry, etc.)
- [ ] Set up payout success/failure alerts
- [ ] Create admin dashboard for payout overview
- [ ] Set up weekly payout reports

### Step 8: Documentation

- [ ] Update internal documentation
- [ ] Create seller help guide
- [ ] Update FAQ
- [ ] Create troubleshooting guide

## 🔄 Deployment Steps

### Pre-Production

- [ ] Test in staging environment
- [ ] Verify PayPal credentials are in production env vars
- [ ] Set `NODE_ENV=production`
- [ ] Test with small amount first

### Production Deployment

1. [ ] Deploy code changes
2. [ ] Verify endpoints are working
3. [ ] Test with one seller manually
4. [ ] Monitor for 24 hours
5. [ ] Enable for all sellers

### Post-Deployment

- [ ] Monitor first week of payouts closely
- [ ] Collect seller feedback
- [ ] Document any issues
- [ ] Optimize based on learnings

## 🎯 Quick Wins

Immediate benefits after migration:

- ✅ **90% faster onboarding** (30 seconds vs 10+ minutes)
- ✅ **Lower dropout rate** (simple email vs complex forms)
- ✅ **Global reach** (PayPal works in 200+ countries)
- ✅ **You control timing** (manual or scheduled payouts)
- ✅ **Simpler support** (no Stripe Connect issues)

## ⚠️ Important Notes

1. **Keep Stripe for customer payments** - Don't change your checkout flow
2. **Set minimum payout threshold** - Avoid $10+ transactions getting $0.20 fees
3. **Communicate clearly** - Let sellers know about the change
4. **Have a plan B** - Keep old Stripe code commented for emergency rollback

## 📊 Success Metrics

Track these after migration:

- [ ] Seller onboarding completion rate
- [ ] Time to first payout
- [ ] Payout success rate
- [ ] Seller satisfaction (survey)
- [ ] Support ticket volume

## 🆘 Rollback Plan

If issues arise:

1. Keep old Stripe Connect code in separate branch
2. Have feature flag to switch between systems
3. Communicate with sellers about technical issues
4. Process urgent payouts manually if needed

## 📞 Support Resources

- **PayPal Docs:** https://developer.paypal.com/docs/payouts/
- **PayPal Support:** https://www.paypal-community.com/
- **Your guides:** `PAYPAL_PAYOUTS_GUIDE.md` and `PAYPAL_API_REFERENCE.md`

---

## ✅ Final Checklist Before Going Live

- [ ] All tests passing in sandbox
- [ ] Security measures in place
- [ ] Monitoring/alerts configured
- [ ] Seller communication sent
- [ ] Team trained on new system
- [ ] Rollback plan ready
- [ ] First payout tested manually

**Ready to go live! 🚀**
