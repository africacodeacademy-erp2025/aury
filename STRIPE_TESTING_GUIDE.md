# Stripe Connect Testing Guide

This guide provides step-by-step instructions for testing the complete Stripe Connect integration.

## Test Accounts

### Stripe Test Mode

Make sure you're in **Test Mode** (toggle in top right of Stripe Dashboard).

### Test Card Numbers

| Card Number | Description | Use Case |
|------------|-------------|----------|
| `4242 4242 4242 4242` | Successful payment | Happy path testing |
| `4000 0027 6000 3184` | Requires authentication | Test 3D Secure |
| `4000 0000 0000 0002` | Card declined | Test error handling |
| `4000 0000 0000 9995` | Insufficient funds | Test payment failures |

**CVC**: Any 3 digits
**Expiry**: Any future date
**ZIP**: Any 5 digits

### Test Banking Information

For Stripe Connect onboarding (US):

- **Routing Number**: `110000000`
- **Account Number**: `000123456789`
- **SSN**: `000000000`
- **Date of Birth**: Any date (18+ years ago)
- **Address**: Any valid US address

## Complete Testing Flow

### Step 1: Create Test Users

1. **Create a Creator Account**
   - Go to `/sign-up`
   - Email: `creator@test.com`
   - Password: `Test123!`
   - Role: Creator
   - Complete sign up

2. **Create a Customer Account**
   - Sign out
   - Go to `/sign-up`
   - Email: `customer@test.com`
   - Password: `Test123!`
   - Role: Customer
   - Complete sign up

### Step 2: Seller Onboarding (Creator)

1. **Log in as Creator**
   - Email: `creator@test.com`
   - Password: `Test123!`

2. **Navigate to Dashboard**
   - Go to `/dashboard` or `/creator/dashboard`
   - You should see a "Set Up Payments" card

3. **Start Onboarding**
   - Click **Start Onboarding** button
   - You'll be redirected to Stripe Connect onboarding

4. **Complete Stripe Onboarding Form**
   
   **Business Details:**
   - Business type: Individual
   - Country: United States (or your test country)
   
   **Personal Information:**
   - First name: Test
   - Last name: Creator
   - Date of birth: 01/01/1990
   - SSN: 000-00-0000
   - Email: creator@test.com
   - Phone: +1 555-555-5555
   
   **Address:**
   - Address: 123 Test Street
   - City: San Francisco
   - State: CA
   - ZIP: 94102
   
   **Bank Account:**
   - Routing number: 110000000
   - Account number: 000123456789
   - Account holder name: Test Creator

5. **Complete Onboarding**
   - Review and submit
   - You'll be redirected to `/onboarding/complete`
   - You should see a success message

6. **Verify Account Status**
   - Return to dashboard
   - The "Set Up Payments" card should now show "Payment Account Active"
   - All checkmarks should be green

### Step 3: Create a Product (Creator)

1. **Still logged in as Creator**

2. **Navigate to Products**
   - Go to `/creator/products` or use "Add Product" button on dashboard

3. **Create a Test Product**
   - Name: "Test Crochet Pattern"
   - Description: "A beautiful test pattern for testing payments"
   - Price: 25.00
   - Category: Patterns
   - Upload an image (optional)
   - Materials: Yarn, Hook
   - Difficulty: Beginner
   - Click **Create Product**

4. **Verify Product Creation**
   - Product should appear in your product list
   - Note the product ID or URL

### Step 4: Make a Purchase (Customer)

1. **Sign Out and Log in as Customer**
   - Email: `customer@test.com`
   - Password: `Test123!`

2. **Browse Marketplace**
   - Go to `/marketplace`
   - Find the "Test Crochet Pattern" product
   - Click to view product details

3. **Initiate Purchase**
   - Click **Purchase** button
   - Embedded checkout modal should open

4. **Complete Payment**
   - **Email**: customer@test.com
   - **Card Number**: 4242 4242 4242 4242
   - **Expiry**: 12/34
   - **CVC**: 123
   - **ZIP**: 12345
   - Click **Pay**

5. **Verify Success**
   - You should be redirected to `/marketplace/paymentResult`
   - Payment status should show "Successful"
   - You should see payment details

### Step 5: Verify in Stripe Dashboard

1. **Check Payments**
   - Go to [Stripe Dashboard](https://dashboard.stripe.com/test/payments)
   - You should see the payment
   - Amount: $25.00 (or your product price)
   - Status: Succeeded

2. **Check Connect Account**
   - Go to **Connect** → **Accounts**
   - Find your test creator account
   - Click to view details
   - Check transfers and balances

3. **Check Platform Fee**
   - In the payment details, scroll to "Application fee"
   - Should show 5% of the total ($1.25 for a $25 product)

4. **Check Webhook Events**
   - Go to **Developers** → **Webhooks**
   - Click your webhook endpoint
   - Recent events should show:
     - `checkout.session.completed`
     - `payment_intent.succeeded`
     - `charge.succeeded`

### Step 6: Verify in Firebase

1. **Check Orders Collection**
   - Go to Firebase Console → Firestore Database
   - Open `orders` collection
   - You should see a new order document with:
     - `productId`: matches your product
     - `sellerId`: creator's user ID
     - `customerId`: customer's user ID
     - `amount`: product price in cents
     - `status`: "paid"

2. **Check Products Collection**
   - Open `products` collection
   - Find your product
   - `salesCount` should be incremented by 1

3. **Check Platform Earnings**
   - Open `platformEarnings` collection
   - You should see a new earning record with:
     - `amount`: total payment
     - `applicationFee`: 5% platform fee
     - `sellerId`: creator's Stripe account ID

4. **Check User Document**
   - Open `users` collection
   - Find creator's document
   - Should have:
     - `stripeAccountId`: acct_xxxxx
     - `stripeOnboardingComplete`: true
     - `stripeChargesEnabled`: true
     - `stripePayoutsEnabled`: true

## Testing Error Scenarios

### Test 1: Purchase Before Onboarding

1. Create a product as a creator WITHOUT completing onboarding
2. Try to purchase as a customer
3. **Expected**: Error message "Seller has not completed Stripe onboarding"

### Test 2: Declined Card

1. Complete onboarding
2. Create a product
3. Try to purchase with card `4000 0000 0000 0002`
4. **Expected**: Payment declined error

### Test 3: Authentication Required

1. Try to purchase with card `4000 0027 6000 3184`
2. **Expected**: 3D Secure authentication prompt
3. Complete authentication
4. **Expected**: Payment succeeds

### Test 4: Webhook Failure

1. Temporarily change `STRIPE_WEBHOOK_SECRET` to wrong value
2. Make a purchase
3. **Expected**: Webhook verification fails (check logs)
4. Order NOT created in Firebase
5. Revert secret, webhook should work again

## Monitoring and Debugging

### Check Server Logs

Monitor your terminal for:
- Webhook event processing
- API route responses
- Error messages

### Check Browser Console

Look for:
- Stripe.js errors
- Network request failures
- Client-side JavaScript errors

### Common Issues and Solutions

| Issue | Possible Cause | Solution |
|-------|---------------|----------|
| "Seller not found" | Product has invalid sellerId | Check product.sellerId matches user ID |
| "No Stripe account found" | Onboarding not completed | Complete onboarding flow |
| Webhook signature failed | Wrong STRIPE_WEBHOOK_SECRET | Verify secret matches Stripe dashboard |
| Payment fails silently | Webhook not receiving events | Use Stripe CLI for local testing |
| "Invalid account" error | Connected account restricted | Check account status in Stripe |

## Advanced Testing

### Test Pattern Products

1. Create a pattern product with `productType: 'pattern'`
2. Purchase the pattern
3. **Expected**: 
   - Order created
   - Pattern delivered (check webhook handler)
   - Email sent with PDF (if implemented)

### Test Multiple Sellers

1. Create multiple creator accounts
2. Each completes onboarding
3. Each creates products
4. Customer purchases from different sellers
5. **Verify**: Each seller receives correct payment (minus platform fee)

### Test Refunds (Manual)

1. Go to Stripe Dashboard → Payment
2. Click **Refund** on a test payment
3. **Expected**:
   - Refund processes
   - Platform fee refunded
   - Webhook event received

## Production Checklist

Before going live:

- [ ] Switch to Live mode in Stripe
- [ ] Update all environment variables with live keys
- [ ] Set up production webhook endpoint
- [ ] Complete business verification in Stripe
- [ ] Test with real bank account (small amounts)
- [ ] Verify tax handling (if applicable)
- [ ] Set up monitoring and alerting
- [ ] Review Stripe fees and pricing
- [ ] Update Terms of Service with payment terms
- [ ] Test customer support flow for payment issues

## Resources

- [Stripe Testing Documentation](https://stripe.com/docs/testing)
- [Test Card Numbers](https://stripe.com/docs/testing#cards)
- [Connect Testing](https://stripe.com/docs/connect/testing)
- [Webhook Testing](https://stripe.com/docs/webhooks/test)
