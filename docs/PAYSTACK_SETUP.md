# Paystack Setup Guide

## Getting Started with Paystack

This guide walks you through setting up Paystack for the Aury marketplace, from account creation to production deployment.

## Table of Contents
1. [Account Creation](#account-creation)
2. [API Keys](#api-keys)
3. [Webhook Configuration](#webhook-configuration)
4. [Subaccounts](#subaccounts)
5. [Testing](#testing)
6. [Production Checklist](#production-checklist)

## Account Creation

### Step 1: Sign Up for Paystack

1. Visit [https://paystack.com](https://paystack.com)
2. Click "Get Started" or "Sign Up"
3. Fill in business details:
   - Business name
   - Business email
   - Phone number
   - Country (select appropriate country)
4. Verify your email address
5. Complete business verification (required for production)

### Step 2: Business Verification

For production use, you'll need to submit:
- **Business Information**
  - Registered business name
  - Business address
  - Business type (sole proprietor, company, etc.)
  
- **Identity Verification**
  - Government-issued ID
  - Proof of address
  - Business registration documents (if applicable)

- **Bank Account Details**
  - Bank name
  - Account number
  - Account holder name (must match business name)

**Timeline**: Verification typically takes 1-3 business days.

## API Keys

### Accessing Your API Keys

1. Log in to your Paystack dashboard
2. Navigate to **Settings** → **API Keys & Webhooks**
3. You'll see two sets of keys:

#### Test/Sandbox Keys
- **Public Key**: `pk_test_xxxxxxxxx`
- **Secret Key**: `sk_test_xxxxxxxxx`

Use these for development and testing.

#### Live/Production Keys
- **Public Key**: `pk_live_xxxxxxxxx`
- **Secret Key**: `sk_live_xxxxxxxxx`

Use these only in production (after business verification).

### Configuring Environment Variables

Add to your `.env.local` file:

```bash
# Paystack Test Keys (Development)
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_your_key_here
PAYSTACK_SECRET_KEY=sk_test_your_key_here

# Paystack Production Keys (Production only)
# NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_your_key_here
# PAYSTACK_SECRET_KEY=sk_live_your_key_here
```

### Security Best Practices

- ✅ **NEVER commit secret keys to version control**
- ✅ Use environment variables for all keys
- ✅ Rotate keys if compromised
- ✅ Use separate keys for development and production
- ✅ Restrict API key permissions when possible
- ❌ Don't use production keys in development
- ❌ Don't share secret keys via email or chat

## Webhook Configuration

Webhooks are critical for receiving payment notifications and updating order status.

### Step 1: Configure Webhook URL

1. Go to **Settings** → **API Keys & Webhooks**
2. Scroll to **Webhook URL** section
3. Enter your webhook endpoint:
   - **Development**: `https://your-ngrok-url.ngrok.io/api/webhooks/paystack`
   - **Production**: `https://yourdomain.com/api/webhooks/paystack`
4. Click **Save Changes**

### Step 2: Get Webhook Secret

After configuring the webhook URL:
1. The dashboard will display your **Webhook Secret**
2. Copy this secret (starts with `whsec_`)
3. Add to environment variables:

```bash
PAYSTACK_WEBHOOK_SECRET=whsec_your_secret_here
```

### Step 3: Test Webhook Delivery

1. In Paystack dashboard, go to **Developers** → **Webhooks**
2. Click **Test Webhook**
3. Select event type (e.g., `charge.success`)
4. Click **Send Test**
5. Verify your endpoint receives and processes the event

### Webhook Events to Handle

Configure your endpoint to receive these events:

- `charge.success` - Payment completed successfully
- `charge.failed` - Payment failed
- `transfer.success` - Payout completed
- `transfer.failed` - Payout failed
- `transfer.reversed` - Payout reversed

### Webhook Security

The webhook handler must:
1. Verify the signature using `PAYSTACK_WEBHOOK_SECRET`
2. Validate the event structure
3. Check for duplicate events (idempotency)
4. Return 200 status quickly (under 5 seconds)
5. Process asynchronously if needed

Example signature verification:

```typescript
import crypto from 'crypto';

function verifyPaystackSignature(payload: string, signature: string): boolean {
  const hash = crypto
    .createHmac('sha512', process.env.PAYSTACK_WEBHOOK_SECRET!)
    .update(payload)
    .digest('hex');
  
  return hash === signature;
}
```

## Subaccounts

Subaccounts enable split payments where the platform takes a commission and the seller receives the remainder.

### Creating a Subaccount

**API Endpoint**: `POST https://api.paystack.co/subaccount`

**Request**:
```typescript
{
  "business_name": "Seller Business Name",
  "settlement_bank": "058", // Bank code
  "account_number": "0123456789",
  "percentage_charge": 95, // Seller gets 95%, platform keeps 5%
  "description": "Subaccount for Seller XYZ",
  "metadata": {
    "seller_id": "firebase_user_id",
    "seller_email": "seller@example.com"
  }
}
```

**Response**:
```typescript
{
  "status": true,
  "message": "Subaccount created",
  "data": {
    "subaccount_code": "ACCT_xxxxxxxxx",
    "business_name": "Seller Business Name",
    "settlement_bank": "Guaranty Trust Bank",
    "account_number": "0123456789",
    "percentage_charge": 95,
    "settlement_schedule": "auto",
    "active": true,
    "migrate": false,
    "id": 12345,
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

### Getting Bank Codes

**API Endpoint**: `GET https://api.paystack.co/bank`

This returns a list of supported banks with their codes:

```typescript
{
  "status": true,
  "message": "Banks retrieved",
  "data": [
    {
      "id": 1,
      "name": "Access Bank",
      "slug": "access-bank",
      "code": "044",
      "country": "Nigeria",
      "currency": "NGN"
    },
    // ... more banks
  ]
}
```

### Validating Account Numbers

Before creating a subaccount, validate the account number:

**API Endpoint**: `GET https://api.paystack.co/bank/resolve?account_number=0123456789&bank_code=058`

**Response**:
```typescript
{
  "status": true,
  "message": "Account number resolved",
  "data": {
    "account_number": "0123456789",
    "account_name": "John Doe",
    "bank_id": 9
  }
}
```

## Testing

### Test Mode Overview

Paystack provides a full sandbox environment for testing:
- All test API keys start with `pk_test_` or `sk_test_`
- No real money is processed
- All features available (payments, transfers, webhooks)
- Test cards provided

### Test Cards

Use these test card numbers in test mode:

#### Successful Transactions
- **Card Number**: `4084 0840 8408 4081`
- **CVV**: Any 3 digits (e.g., `123`)
- **Expiry**: Any future date (e.g., `12/25`)
- **PIN**: `0000`
- **OTP**: `123456`

#### Failed Transactions
- **Card Number**: `4084 0840 8408 4090`
- All other details can be random

#### Card Requiring Authentication
- **Card Number**: `5060 6666 6666 6666 6666`
- Triggers 3D Secure flow

### Test Bank Accounts

For testing transfers/payouts:
- **Bank Code**: `058` (GTBank)
- **Account Number**: `0123456789`

### Testing Webhooks Locally

To test webhooks during development:

#### Option 1: ngrok (Recommended)

1. Install ngrok: `npm install -g ngrok`
2. Start your dev server: `npm run dev`
3. Start ngrok: `ngrok http 3000`
4. Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)
5. Update webhook URL in Paystack dashboard
6. Test payments and check your local endpoint

#### Option 2: Webhook Testing Tools

Use Paystack dashboard's webhook testing feature:
1. Go to **Developers** → **Webhooks**
2. Click **Test Webhook**
3. Select event type
4. Modify payload if needed
5. Click **Send Test**

### Testing Checklist

- [ ] Initialize transaction with test card
- [ ] Complete payment successfully
- [ ] Verify webhook delivery
- [ ] Check transaction status via API
- [ ] Test failed payment scenario
- [ ] Create subaccount
- [ ] Initialize transaction with split
- [ ] Verify split was applied correctly
- [ ] Test refund flow
- [ ] Initiate transfer/payout
- [ ] Verify transfer webhook

## Production Checklist

Before going live with Paystack:

### Account & Verification
- [ ] Business verification completed and approved
- [ ] Bank account verified
- [ ] Settlement account configured
- [ ] Compliance documents submitted (if required)

### API Configuration
- [ ] Production API keys obtained
- [ ] Production keys added to environment variables
- [ ] Test keys removed from production environment
- [ ] Webhook URL updated to production domain
- [ ] Webhook secret updated
- [ ] SSL certificate valid (HTTPS required)

### Integration Testing
- [ ] End-to-end payment flow tested in production
- [ ] Webhook delivery confirmed
- [ ] Subaccount creation tested
- [ ] Split payments verified
- [ ] Refunds tested
- [ ] Transfers/payouts tested
- [ ] Error handling verified

### Security
- [ ] Secret keys stored securely (environment variables)
- [ ] Webhook signature verification implemented
- [ ] Rate limiting configured
- [ ] CORS policies configured
- [ ] Input validation implemented
- [ ] SQL injection prevention
- [ ] XSS prevention

### Monitoring & Logging
- [ ] Payment success/failure tracking
- [ ] Webhook delivery monitoring
- [ ] Error logging configured
- [ ] Performance monitoring
- [ ] Alerts configured for critical failures

### Documentation
- [ ] User guide for sellers (onboarding)
- [ ] User guide for buyers (checkout)
- [ ] Internal runbook for support team
- [ ] API documentation updated
- [ ] Rollback plan documented

### Compliance
- [ ] Terms of service updated
- [ ] Privacy policy updated
- [ ] Refund policy documented
- [ ] Customer support process defined
- [ ] Dispute handling process defined

### Go-Live Plan
- [ ] Scheduled maintenance window
- [ ] Team notification
- [ ] Gradual rollout plan (10% → 50% → 100%)
- [ ] Rollback triggers defined
- [ ] Support team on standby
- [ ] Monitoring dashboard active

## Common Issues & Solutions

### Issue: Webhook not receiving events

**Solutions**:
- Verify webhook URL is correct and accessible
- Check webhook secret is configured correctly
- Ensure endpoint returns 200 status code
- Check server logs for errors
- Use ngrok for local testing
- Test webhook using dashboard

### Issue: Subaccount creation fails

**Solutions**:
- Verify bank code is correct
- Validate account number using resolve API
- Check account name matches
- Ensure business is verified
- Review error message for specific issue

### Issue: Payment initialization fails

**Solutions**:
- Verify API key is correct
- Check amount is in smallest unit (kobo)
- Ensure email is valid
- Verify currency is supported
- Check for required fields

### Issue: Split not applied correctly

**Solutions**:
- Verify percentage_charge is set correctly
- Check subaccount is active
- Ensure subaccount_code is included in transaction
- Review split configuration
- Check transaction metadata

## Support & Resources

### Paystack Resources
- **Documentation**: https://paystack.com/docs
- **API Reference**: https://paystack.com/docs/api
- **Status Page**: https://status.paystack.com
- **Community**: https://paystack.com/community

### Contact Support
- **Email**: support@paystack.com
- **Twitter**: @paystack
- **Developer Support**: developers@paystack.com

### Additional Resources
- [Paystack Blog](https://paystack.com/blog)
- [Integration Guides](https://paystack.com/docs/guides)
- [Sample Code](https://github.com/PaystackHQ)
- [Postman Collection](https://paystack.com/docs/api/#postman)

## Next Steps

1. ✅ Create Paystack account
2. ✅ Get API keys
3. ✅ Configure webhooks
4. ✅ Test in sandbox
5. → Complete business verification
6. → Deploy to production
7. → Monitor and optimize

For implementation details, see [PAYSTACK_MIGRATION.md](./PAYSTACK_MIGRATION.md)
