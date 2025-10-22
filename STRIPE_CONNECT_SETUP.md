# Stripe Connect Setup Guide

This guide will help you complete the Stripe Connect integration for the Aury platform.

## Prerequisites

1. **Stripe Account**: You need a Stripe account (test mode is fine)
2. **Stripe Connect**: Enable Stripe Connect in your Stripe Dashboard
3. **Environment Variables**: Configure the following in your `.env.local` file:

```env
# Stripe Keys
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Base URL for your application
BASE_URL=http://localhost:3000
```

## Setup Steps

### 1. Enable Stripe Connect

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Settings** → **Connect**
3. Click **Get started** on Stripe Connect
4. Choose **Platform or Marketplace** as your platform type
5. Fill in your business information

### 2. Configure Webhook Endpoint

Webhooks are crucial for handling payment events and account updates.

1. In Stripe Dashboard, go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Enter your webhook URL: `https://yourdomain.com/api/webhooks/stripe`
   - For local testing: `http://localhost:3000/api/webhooks/stripe`
   - Use [ngrok](https://ngrok.com/) or [Stripe CLI](https://stripe.com/docs/stripe-cli) for local webhooks
4. Select events to listen to:
   - ✅ `checkout.session.completed`
   - ✅ `payment_intent.succeeded`
   - ✅ `account.updated`
   - ✅ `charge.succeeded`
5. Copy the **Signing secret** and add it to your `.env.local` as `STRIPE_WEBHOOK_SECRET`

### 3. Test Webhooks Locally with Stripe CLI

For local development, use the Stripe CLI to forward webhooks:

```bash
# Install Stripe CLI
# https://stripe.com/docs/stripe-cli

# Login to Stripe
stripe login

# Forward webhooks to your local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

The CLI will output a webhook signing secret. Use this temporarily in your `.env.local`.

### 4. Firebase Firestore Schema

Ensure your Firebase users collection supports these fields:

```typescript
{
  id: string;
  name: string;
  email: string;
  role: "creator" | "customer" | "craft-business";
  stripeAccountId?: string;              // Stripe Connect account ID
  stripeOnboardingComplete?: boolean;    // Onboarding status
  stripeChargesEnabled?: boolean;        // Can accept payments
  stripePayoutsEnabled?: boolean;        // Can receive payouts
}
```

### 5. Test the Flow

#### For Sellers (Creators/Craft Businesses):

1. Log in as a creator or craft-business user
2. Navigate to the Dashboard
3. You'll see a **Set Up Payments** card
4. Click **Start Onboarding**
5. Complete the Stripe Connect onboarding form
   - Use test data in test mode
   - Test SSN: `000000000`
   - Test routing number: `110000000`
   - Test account number: `000123456789`
6. After completion, you'll be redirected back to `/onboarding/complete`
7. Your account status will be verified and updated in Firebase

#### For Buyers (Customers):

1. Browse the marketplace
2. Select a product from an onboarded seller
3. Click **Purchase**
4. Complete the embedded checkout
5. Use Stripe test cards:
   - Success: `4242 4242 4242 4242`
   - Requires authentication: `4000 0027 6000 3184`
   - Declined: `4000 0000 0000 0002`
6. After payment, you'll be redirected to `/marketplace/paymentResult`

### 6. Monitoring

#### Check Webhook Events

In Stripe Dashboard → **Developers** → **Webhooks**, you can see:
- Recent webhook deliveries
- Success/failure status
- Event details and responses

#### Check Orders in Firebase

After successful payments, check your Firestore `orders` collection for new documents.

#### Check Platform Earnings

Platform fees are tracked in the `platformEarnings` collection in Firestore.

## Important Notes

### Platform Fee

Currently set to **5%** of each transaction. Adjust in `/app/api/payments/route.ts`:

```typescript
const platformFee = Math.round(product.price * 0.05 * 100); // 5% in cents
```

### Onboarding URLs

Update these URLs in production:
- `refresh_url`: Where users go if onboarding link expires
- `return_url`: Where users go after completing onboarding

### Security

- ✅ **Never** expose `STRIPE_SECRET_KEY` in client-side code
- ✅ **Always** verify webhook signatures
- ✅ Store only `stripeAccountId` in your database
- ✅ Never store bank account or card details

## Troubleshooting

### "Seller has not completed Stripe onboarding"

**Solution**: Ensure the seller completed the full onboarding flow and `stripeOnboardingComplete` is `true` in Firebase.

### "Failed to verify onboarding status"

**Solution**: Check that the `stripeAccountId` exists and is valid. Try re-running the onboarding flow.

### Webhook not receiving events

**Solution**:
1. Verify webhook endpoint is publicly accessible
2. Check webhook signing secret matches your `.env.local`
3. Use Stripe CLI for local testing
4. Check Stripe Dashboard → Webhooks for error logs

### Payment fails with "Invalid account"

**Solution**: Ensure the connected account:
- Has `charges_enabled: true`
- Has `payouts_enabled: true`
- Completed verification requirements

## Testing in Production

When you're ready for production:

1. Switch to **Live mode** in Stripe Dashboard
2. Complete Stripe Connect verification for your platform
3. Update environment variables with live keys
4. Update webhook endpoint to production URL
5. Complete real onboarding with valid business information

## Resources

- [Stripe Connect Docs](https://stripe.com/docs/connect)
- [Stripe Connect Testing](https://stripe.com/docs/connect/testing)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [Stripe CLI](https://stripe.com/docs/stripe-cli)

## Support

For issues specific to this integration, check:
- API route logs in your terminal
- Stripe Dashboard event logs
- Firebase Firestore for data consistency
- Browser console for client-side errors
