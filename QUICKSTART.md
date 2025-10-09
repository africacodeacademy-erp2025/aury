# 🚀 Quick Start Guide - Stripe Connect Integration

Get your Stripe Connect payment system up and running in 15 minutes!

## Prerequisites

✅ Node.js 18+ installed
✅ Firebase project set up
✅ Stripe account (test mode is fine)

## Step 1: Install Dependencies (if needed)

```bash
npm install stripe @stripe/stripe-js @stripe/react-stripe-js
```

## Step 2: Configure Environment Variables

Create or update `.env.local`:

```env
# Stripe Keys (Get from https://dashboard.stripe.com/test/apikeys)
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here

# Application
BASE_URL=http://localhost:3000

# Firebase (your existing config)
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
# ... other Firebase vars
```

## Step 3: Enable Stripe Connect

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Click **Settings** → **Connect**
3. Click **Get started**
4. Choose **Platform or Marketplace**
5. Fill in your platform details
6. Click **Save**

## Step 4: Set Up Webhooks (For Local Development)

### Option A: Using Stripe CLI (Recommended for Local Testing)

```bash
# Install Stripe CLI
# Mac: brew install stripe/stripe-cli/stripe
# Windows: Download from https://github.com/stripe/stripe-cli/releases

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copy the webhook signing secret from the output and add to `.env.local`:

```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

### Option B: Using Public URL (ngrok, etc.)

If you need a public URL:

```bash
# Install ngrok
npm install -g ngrok

# Start ngrok
ngrok http 3000

# Use the HTTPS URL in Stripe Dashboard → Webhooks
# https://your-ngrok-url.ngrok.io/api/webhooks/stripe
```

## Step 5: Update Firebase Firestore Rules

In Firebase Console → Firestore → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /products/{productId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
                              request.auth.uid == resource.data.sellerId;
    }
    
    match /orders/{orderId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
    }
  }
}
```

## Step 6: Start the Development Server

```bash
npm run dev
```

## Step 7: Test the Integration

### Create a Seller Account

1. Navigate to `http://localhost:3000/sign-up`
2. Create account with role: **Creator** or **Craft Business**
3. Email: `seller@test.com`
4. Password: `Test123!`

### Complete Onboarding

1. After login, go to Dashboard
2. Click **Start Onboarding** in the Stripe Connect card
3. Fill in test information:
   - **Business type**: Individual
   - **Name**: Test Seller
   - **DOB**: 01/01/1990
   - **SSN**: 000-00-0000
   - **Address**: 123 Test St, San Francisco, CA 94102
   - **Phone**: +1 555-555-5555
   - **Routing**: 110000000
   - **Account**: 000123456789
4. Submit and verify you're redirected back

### Create a Product

1. In Dashboard, click **Add Product**
2. Fill in product details:
   - Name: "Test Pattern"
   - Price: 25
   - Description: "A test product"
3. Save the product

### Make a Test Purchase

1. Log out and create a **Customer** account
2. Browse to `/marketplace`
3. Find your test product
4. Click **Purchase**
5. Use test card: **4242 4242 4242 4242**
6. CVC: **123**, Expiry: **12/34**, ZIP: **12345**
7. Complete payment

### Verify Success

✅ Check payment result page shows success
✅ Check Stripe Dashboard → Payments (should see the payment)
✅ Check Firebase → orders collection (should have new order)
✅ Check webhook events in terminal (should see processing logs)

## Step 8: Monitor Webhooks

In your terminal running Stripe CLI, you should see:

```
✔ Webhook signing secret: whsec_xxxxx
👂 Listening for events...
🔔 checkout.session.completed (evt_xxxxx)
🔔 payment_intent.succeeded (evt_xxxxx)
🔔 charge.succeeded (evt_xxxxx)
✅ All events processed successfully
```

## Common Issues & Quick Fixes

### Issue: "Seller has not completed Stripe onboarding"

**Fix**: Complete the onboarding flow. Check Firebase user document has `stripeOnboardingComplete: true`

### Issue: Webhook signature verification failed

**Fix**: Ensure `STRIPE_WEBHOOK_SECRET` matches the secret from Stripe CLI or Dashboard

### Issue: Payment modal doesn't open

**Fix**: Check console for errors. Verify `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is set and starts with `pk_test_`

### Issue: Firebase permission denied

**Fix**: Update Firestore security rules (see Step 5)

## Next Steps

Once everything works:

1. ✅ Test error scenarios (declined cards, etc.)
2. ✅ Test with different product types
3. ✅ Review webhook processing logs
4. ✅ Test multiple sellers
5. ✅ Test refund flow (manually in Stripe Dashboard)

## Production Deployment

When ready for production:

1. **Switch to Live Mode**
   ```env
   STRIPE_SECRET_KEY=sk_live_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
   ```

2. **Set Up Production Webhook**
   - URL: `https://yourdomain.com/api/webhooks/stripe`
   - Get signing secret from Stripe Dashboard
   - Update `STRIPE_WEBHOOK_SECRET`

3. **Complete Verification**
   - Verify your platform business in Stripe
   - Add bank account for platform fees
   - Review and accept terms

4. **Deploy**
   ```bash
   # Deploy to Vercel, Netlify, etc.
   vercel deploy --prod
   ```

## Resources

📚 **Full Documentation**
- [STRIPE_CONNECT_SETUP.md](./STRIPE_CONNECT_SETUP.md) - Complete setup guide
- [STRIPE_TESTING_GUIDE.md](./STRIPE_TESTING_GUIDE.md) - Detailed testing procedures
- [FIRESTORE_INDEXES.md](./FIRESTORE_INDEXES.md) - Database configuration

🔗 **External Links**
- [Stripe Connect Docs](https://stripe.com/docs/connect)
- [Stripe Testing](https://stripe.com/docs/testing)
- [Stripe CLI](https://stripe.com/docs/stripe-cli)

## Need Help?

Check the troubleshooting sections in:
- `STRIPE_CONNECT_SETUP.md`
- `STRIPE_TESTING_GUIDE.md`

Or review the Stripe Dashboard event logs for detailed error messages.

---

**🎉 That's it! You now have a fully functional marketplace with Stripe Connect payments!**
