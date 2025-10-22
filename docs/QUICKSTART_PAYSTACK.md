# 🚀 Quick Start Guide - Paystack Migration

This guide will help you get the Paystack-integrated marketplace up and running quickly.

## Prerequisites

- Node.js 18+ installed
- Firebase project set up
- Paystack account (test mode)
- Git installed

## Step-by-Step Setup

### 1. Install Dependencies

```bash
npm install
```

This will install all required packages including test dependencies.

### 2. Configure Environment Variables

Copy the example environment file:

```bash
copy .env.local.example .env.local
```

Then update `.env.local` with your actual credentials:

#### Firebase Configuration
Get these from your Firebase Console → Project Settings → Service Accounts:

```bash
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

#### Paystack Configuration
Get these from your Paystack Dashboard → Settings → API Keys & Webhooks:

```bash
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxx
PAYSTACK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxx
```

You'll get the webhook secret after setting up webhooks (Step 5).

### 3. Run Database Migration

This migrates existing Stripe data to the new Paystack structure:

```bash
npm run migrate:paystack
```

**What it does**:
- Updates user documents with Paystack fields
- Creates transaction records from existing orders
- Preserves Stripe data for historical reference
- Is idempotent (safe to run multiple times)

### 4. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### 5. Set Up Paystack Webhooks

For local development, you need to expose your local server to the internet.

#### Option A: Using ngrok (Recommended)

1. Install ngrok:
```bash
npm install -g ngrok
```

2. Start ngrok:
```bash
ngrok http 3000
```

3. Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)

4. Go to Paystack Dashboard → Settings → API Keys & Webhooks

5. Add Webhook URL: `https://abc123.ngrok.io/api/webhooks/paystack`

6. **Important**: Paystack doesn't provide a separate webhook secret like Stripe. Instead, webhook signature verification uses your `PAYSTACK_SECRET_KEY` that you already configured in Step 2.

7. Click "Save" in the Paystack dashboard

8. Test the webhook by clicking "Test" next to your webhook URL in the dashboard

### 6. Test Seller Onboarding

1. Create a seller account or sign in as an existing seller

2. Navigate to Dashboard

3. You'll see the Paystack onboarding prompt

4. **Test Bank Details** (Test Mode):
   - In test mode, Paystack accepts any valid bank code and account number
   - Select any South African bank from the dropdown (e.g., "Standard Bank", "FNB", "Capitec")
   - Enter any 10-digit account number (e.g., `0123456789`)
   - Click "Verify" - Paystack will auto-generate a test account name
   - The validation will always succeed in test mode

5. Complete the onboarding form

6. Your subaccount will be created instantly

### 7. Test Checkout Flow

1. Create a test product (or use existing)

2. Navigate to the marketplace

3. Click "Purchase" on a product

4. You'll be redirected to Paystack checkout

5. **Use Test Card**:
   - **Card Number**: `4084 0840 8408 4081`
   - **Expiry**: Any future date (e.g., `12/25`)
   - **CVV**: `123`
   - **PIN**: `0000`
   - **OTP**: `123456`

6. Complete the payment

7. You'll be redirected back to your app

8. Verify:
   - Transaction status is "success"
   - Order is created
   - Product sales count increased
   - Platform earnings tracked

### 8. Verify Webhooks

1. Go to Paystack Dashboard → Developers → Webhooks

2. Click "Test Webhook"

3. Select `charge.success` event

4. Click "Send Test"

5. Check your console logs - you should see:
   ```
   📨 Webhook received: charge.success (ID: xxx)
   ✅ Webhook processed successfully
   ```

6. Check Firestore `webhook_logs` collection for the logged event

## Testing Checklist

Use this checklist to verify everything works:

- [ ] Dependencies installed successfully
- [ ] Environment variables configured
- [ ] Migration script ran without errors
- [ ] Dev server starts on port 3000
- [ ] Ngrok tunnel established
- [ ] Paystack webhook configured
- [ ] Seller can complete onboarding
- [ ] Subaccount created in Paystack dashboard
- [ ] Buyer can view marketplace
- [ ] Buyer can initiate checkout
- [ ] Payment completes with test card
- [ ] Buyer redirected to success page
- [ ] Transaction marked as success in Firestore
- [ ] Order created in Firestore
- [ ] Webhook received and processed
- [ ] Platform earnings tracked

## Common Issues & Solutions

### Issue: Migration script fails

**Solution**:
- Ensure Firebase credentials are correct
- Check Firebase rules allow admin access
- Verify Firestore has existing data to migrate

### Issue: Paystack API requests fail

**Solution**:
- Verify API keys are correct (should start with `pk_test_` and `sk_test_`)
- Check you're using test mode keys
- Ensure no trailing spaces in .env.local

### Issue: Webhooks not received

**Solution**:
- Verify ngrok is running and tunnel is active
- Check webhook URL in Paystack dashboard is correct
- Ensure webhook secret is set in .env.local
- Restart dev server after adding webhook secret
- Check console for signature verification errors

### Issue: Bank account validation fails

**Solution**:
- In test mode, any 10-digit account number should work
- Make sure you selected a bank from the dropdown first
- The account name will be auto-generated (e.g., "Test Account")
- If validation still fails, check your `PAYSTACK_SECRET_KEY` in `.env.local`
- Verify you're using test mode keys (starting with `sk_test_`)

### Issue: Payment fails with "Seller not onboarded"

**Solution**:
- Complete seller onboarding first
- Verify `paystackSubaccountCode` exists in user document
- Check `paystackOnboardingComplete` is true

## Next Steps

After completing the quick start:

1. **Run Unit Tests**:
   ```bash
   npm run test
   ```

2. **Run E2E Tests** (when ready):
   ```bash
   npm run test:e2e
   ```

3. **Review Documentation**:
   - `docs/PAYSTACK_MIGRATION.md` - Full migration guide
   - `docs/PAYSTACK_SETUP.md` - Detailed Paystack setup
   - `docs/IMPLEMENTATION_STATUS.md` - Task checklist

4. **Implement Remaining Features**:
   - Frontend components (in progress)
   - Payout system
   - Reconciliation tools
   - Admin dashboard

5. **Prepare for Production**:
   - Complete business verification with Paystack
   - Get production API keys
   - Update environment variables
   - Configure production webhook URL
   - Test with real bank accounts
   - Deploy to production

## Production Deployment

When ready for production:

1. **Get Production Keys**:
   - Complete Paystack business verification
   - Get `pk_live_xxx` and `sk_live_xxx` keys
   - Update production environment variables

2. **Configure Production Webhook**:
   - Set webhook URL to `https://yourdomain.com/api/webhooks/paystack`
   - Get production webhook secret
   - Update production environment variables

3. **Deploy**:
   ```bash
   npm run build
   # Then deploy to your hosting platform (Vercel, etc.)
   ```

4. **Verify**:
   - Test onboarding with real bank account
   - Test payment with real card
   - Verify webhooks are received
   - Monitor for errors

## Support

If you need help:

1. Check `docs/IMPLEMENTATION_STATUS.md` for detailed task list
2. Review `docs/PAYSTACK_SETUP.md` for Paystack-specific issues
3. Check Paystack documentation: https://paystack.com/docs
4. Contact Paystack support: support@paystack.com

Good luck! 🎉
