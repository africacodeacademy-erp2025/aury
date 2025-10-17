# PayPal Payouts Implementation Guide

This document explains the complete PayPal Payouts system for seller payments.

## 🎯 Overview

**What Changed:**
- ❌ Removed: Stripe Connect for seller onboarding (too complex, long setup)
- ✅ Added: PayPal Payouts for seller payments (simple, fast)
- ℹ️ Kept: Stripe for customer payments (checkout & payments)

**Why PayPal?**
- ⚡ **Instant onboarding**: Sellers just enter their PayPal email (30 seconds)
- 🚀 **Lower barrier to entry**: No ID verification, bank details, or complex forms
- 💰 **Simple fees**: 2% (max $1 domestic, max $20 international)
- 🌍 **Global reach**: Works in 200+ countries

---

## 📦 What Was Installed

```bash
npm install @paypal/payouts-sdk
npm install --save-dev @types/paypal__payouts-sdk
```

---

## 🔑 Environment Variables

Already configured in `.env.local`:

```bash
PAYPAL_CLIENT_ID=your_client_id
PAYPAL_CLIENT_SECRET=your_client_secret
```

**For Production:**
- Set `NODE_ENV=production` to use Live PayPal
- For development, it automatically uses Sandbox mode

---

## 📁 Files Created/Modified

### New Files

1. **`lib/paypal.ts`** - PayPal configuration and utility functions
   - `sendPayout()` - Send payment to a seller
   - `getPayoutBatchDetails()` - Check payout status
   - `validatePayPalEmail()` - Validate email format
   - `calculatePayoutFee()` - Calculate PayPal fees

2. **`app/api/payouts/process/route.ts`** - Process individual seller payouts
   - `POST` - Send payout to specific seller
   - `GET` - Get payout history for a seller

3. **`app/api/payouts/trigger/route.ts`** - Bulk payout processing
   - `POST` - Trigger payouts for all eligible sellers
   - `GET` - Check pending payouts without processing

4. **`components/creator/PayPalOnboarding.tsx`** - UI for seller onboarding
   - Simple form to collect PayPal email
   - Shows onboarding status

### Modified Files

1. **`app/api/onboard-seller/route.ts`**
   - Changed from creating Stripe accounts to saving PayPal email

2. **`app/api/onboard-seller/verify/route.ts`**
   - Changed from verifying Stripe status to checking PayPal email

3. **`types/index.d.ts`**
   - Added PayPal-related fields to `User` interface
   - Added `Payout` interface
   - Added `payoutProcessed` field to `Order` interface

---

## 🚀 How to Use

### For Sellers (Onboarding)

1. **Replace the StripeConnectStatus component:**

```tsx
// In your seller dashboard page
import PayPalOnboarding from "@/components/creator/PayPalOnboarding";

// Replace StripeConnectStatus with PayPalOnboarding
<PayPalOnboarding user={user} />
```

2. **Seller enters their PayPal email** - That's it! Instant onboarding ✅

### For Admins (Processing Payouts)

#### Option 1: Process Individual Seller Payout

```bash
curl -X POST http://localhost:3000/api/payouts/process \
  -H "Content-Type: application/json" \
  -d '{
    "sellerId": "seller123",
    "amount": 150.00,
    "currency": "USD",
    "note": "Monthly earnings payout"
  }'
```

#### Option 2: Trigger Bulk Payouts for All Sellers

**Check who would get paid (dry run):**
```bash
curl -X POST http://localhost:3000/api/payouts/trigger \
  -H "Content-Type: application/json" \
  -d '{
    "minimumPayout": 10,
    "currency": "USD",
    "dryRun": true
  }'
```

**Actually process the payouts:**
```bash
curl -X POST http://localhost:3000/api/payouts/trigger \
  -H "Content-Type: application/json" \
  -d '{
    "minimumPayout": 10,
    "currency": "USD",
    "dryRun": false
  }'
```

#### Option 3: Check Pending Payouts

```bash
curl http://localhost:3000/api/payouts/trigger?minimumPayout=10
```

---

## 🔧 Integration Steps

### Step 1: Update Your Seller Dashboard

Find where you're using `StripeConnectStatus` and replace it:

```tsx
// Before
import StripeConnectStatus from "@/components/creator/StripeConnectStatus";
<StripeConnectStatus user={user} />

// After
import PayPalOnboarding from "@/components/creator/PayPalOnboarding";
<PayPalOnboarding user={user} />
```

### Step 2: Update Earnings Calculation

The `calculateSellerEarnings()` function in `app/api/payouts/trigger/route.ts` needs your business logic:

```typescript
async function calculateSellerEarnings(sellerId: string): Promise<number> {
  // TODO: Implement based on your business model
  // Example: Calculate from completed orders
  const ordersSnapshot = await firebaseDb
    .collection("orders")
    .where("sellerId", "==", sellerId)
    .where("status", "==", "completed")
    .where("payoutProcessed", "==", false)
    .get();

  let totalEarnings = 0;
  for (const orderDoc of ordersSnapshot.docs) {
    const orderData = orderDoc.data();
    const platformFee = parseFloat(process.env.PLATFORM_FEE_PERCENTAGE || "5");
    const sellerEarnings = orderData.total * (1 - platformFee / 100);
    totalEarnings += sellerEarnings;
  }

  return totalEarnings;
}
```

### Step 3: Mark Orders as Paid

After processing payouts, mark orders as paid:

```typescript
// In your payout processing logic
await firebaseDb.collection("orders").doc(orderId).update({
  payoutProcessed: true,
  payoutDate: new Date().toISOString(),
});
```

### Step 4: Set Up Automatic Payouts (Optional)

Use a cron job or scheduled task to run payouts automatically:

**Using Vercel Cron (recommended):**
```typescript
// app/api/cron/payouts/route.ts
export async function GET() {
  // Trigger weekly payouts
  const response = await fetch(`${process.env.BASE_URL}/api/payouts/trigger`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      minimumPayout: 10,
      currency: 'USD',
      dryRun: false,
    }),
  });
  
  return Response.json(await response.json());
}
```

Add to `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/cron/payouts",
    "schedule": "0 0 * * 1"
  }]
}
```

---

## 💡 Best Practices

### 1. Minimum Payout Threshold
Set a minimum amount to avoid excessive fees:
```typescript
const minimumPayout = 10; // $10 USD minimum
```

### 2. Payout Frequency
- **Weekly**: Good for active sellers
- **Bi-weekly**: Reduces transaction costs
- **Monthly**: Lower fees, but sellers wait longer

### 3. Currency Handling
```typescript
// Always specify currency
const currency = process.env.DEFAULT_CURRENCY || "USD";
```

### 4. Error Handling
Always check payout results:
```typescript
if (!payoutResult.success) {
  // Notify seller, log error, retry later
  console.error(`Payout failed for ${sellerId}:`, payoutResult.error);
}
```

### 5. Track Everything
Log all payouts for accounting:
```typescript
await firebaseDb.collection("payouts").add({
  sellerId,
  amount,
  status,
  batchId,
  createdAt: new Date().toISOString(),
});
```

---

## 🧪 Testing

### Sandbox Mode (Development)

1. Get sandbox credentials from PayPal Developer Dashboard
2. Use test PayPal accounts from: https://developer.paypal.com/dashboard/accounts
3. Test payouts with fake money

### Example Test:

```typescript
// Test payout to sandbox account
const result = await sendPayout(
  "sb-seller@example.com", // Sandbox email
  10.00,
  "USD",
  "Test payout",
  "test-seller-123"
);

console.log(result);
```

---

## 📊 Monitoring Payouts

### Check Payout Status

```typescript
import { getPayoutBatchDetails } from "@/lib/paypal";

const status = await getPayoutBatchDetails(batchId);
console.log(status);
```

### Payout Statuses

- `PENDING` - Payout is being processed
- `PROCESSING` - PayPal is sending the money
- `SUCCESS` - Money sent successfully
- `DENIED` - Payout was denied (invalid email, etc.)
- `RETURNED` - Money was returned (email doesn't exist, etc.)

---

## 🔒 Security Notes

1. **Protect Admin Routes**: Add authentication to `/api/payouts/*`
2. **Validate Amounts**: Always check payout amounts are positive and reasonable
3. **Rate Limiting**: Prevent abuse of payout endpoints
4. **Audit Logs**: Keep detailed logs of all payouts

---

## 💰 Fees Comparison

| Method | Setup Time | Fee Structure | When to Use |
|--------|-----------|---------------|-------------|
| **PayPal Payouts** | 30 seconds | 2% (max $1-$20) | Quick onboarding, global sellers |
| Stripe Connect | 10-30 minutes | 0.25% + $0.25 | Full marketplace features |
| Manual Bank Transfer | Instant | Free (your time) | Very few sellers |

---

## 🆘 Troubleshooting

### "Could not find PayPal account"
- Seller needs to create PayPal account first
- Email must match exactly

### "Payout denied"
- Check PayPal email is verified
- Ensure account can receive payments
- Check country restrictions

### "No eligible sellers found"
- Verify sellers have completed onboarding
- Check minimum payout threshold
- Ensure orders are marked as completed

---

## 📞 Support

**PayPal Developer Support:**
- Docs: https://developer.paypal.com/docs/payouts/
- Forum: https://www.paypal-community.com/

**Code Issues:**
- Check `lib/paypal.ts` for utility functions
- Review error logs in terminal
- Test in sandbox mode first

---

## ✅ Next Steps

1. [ ] Update seller dashboard to use `PayPalOnboarding` component
2. [ ] Customize `calculateSellerEarnings()` for your business logic
3. [ ] Test with PayPal sandbox accounts
4. [ ] Set up automatic payout schedule
5. [ ] Add admin UI to trigger manual payouts
6. [ ] Monitor first real payout
7. [ ] Collect seller feedback

---

**That's it! You now have a complete PayPal Payouts system. Sellers can onboard in seconds, and you control when they get paid.** 🎉
