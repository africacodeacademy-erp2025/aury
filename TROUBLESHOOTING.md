# 🔧 Common Issues & Solutions

## Firebase Timestamp Serialization Error

### Error Message
```
Only plain objects, and a few built-ins, can be passed to Client Components from Server Components. 
Classes or null prototypes are not supported.
  {name: ..., email: ..., updatedAt: {_seconds: ..., _nanoseconds: ...}, ...}
```

### Cause
Firebase Timestamps are class instances that cannot be serialized when passing from Server Components to Client Components in Next.js.

### Common Places This Occurs
1. **Server Actions** (like `getCurrentUser()`)
2. **Client-side Firebase queries** in "use client" components
3. **Spreading Firebase document data** without sanitization

### Solution 1: Fix Server Actions (getCurrentUser)

Instead of spreading all data:
```typescript
// ❌ BAD - Spreads everything including Timestamps
return {
  ...userRecord.data(),
  id: userRecord.id,
} as User;
```

Explicitly return only needed fields:
```typescript
// ✅ GOOD - Only serializable fields
const userData = userRecord.data();
return {
  id: userRecord.id,
  name: userData.name || "",
  email: userData.email || "",
  role: userData.role || "customer",
  stripeAccountId: userData.stripeAccountId,
  stripeOnboardingComplete: userData.stripeOnboardingComplete,
} as User;
```

### Solution 2: Serialize Timestamps in Client Components

For client-side queries, create a helper function:
```typescript
// Helper function
const serializeData = (data: any) => {
  const serialized: any = { ...data };
  if (serialized.createdAt?.toDate) {
    serialized.createdAt = serialized.createdAt.toDate().toISOString();
  }
  if (serialized.updatedAt?.toDate) {
    serialized.updatedAt = serialized.updatedAt.toDate().toISOString();
  }
  return serialized;
};

// Usage
const userData = serializeData(userDoc.data());
```

### Solution 3: Update Type Definition

Ensure your User type only includes serializable fields:
```typescript
export interface User {
  name: string;
  email: string;
  id: string;
  role: "creator" | "customer" | "craft-business";
  stripeAccountId?: string;
  stripeOnboardingComplete?: boolean;
  // ❌ Don't include: updatedAt?: Timestamp
  // ✅ Use: updatedAt?: string (if needed)
}
```

---

## Stripe Webhook Signature Failed

### Error Message
```
Webhook signature verification failed
```

### Causes & Solutions

1. **Wrong Secret**
   - Check `STRIPE_WEBHOOK_SECRET` matches Stripe Dashboard
   - For local: Use secret from `stripe listen` command

2. **Body Already Parsed**
   - Don't use `await request.json()` before verification
   - Use `await request.text()` instead

3. **Missing Signature**
   - Ensure request header `stripe-signature` is present
   - Check webhook endpoint is correct

### Solution
```typescript
const body = await request.text();
const signature = headers().get("stripe-signature");
const event = stripe.webhooks.constructEvent(body, signature!, webhookSecret);
```

---

## Seller Cannot Receive Payments

### Error Message
```
Seller has not completed Stripe onboarding
```

### Checklist
- [ ] Seller completed full onboarding flow
- [ ] `stripeAccountId` saved in Firebase
- [ ] `stripeOnboardingComplete: true` in Firebase
- [ ] Account verified: `GET /api/onboard-seller/verify`

### Solution
1. Re-run onboarding: Click "Start Onboarding" again
2. Complete all required fields
3. Wait for verification redirect
4. Check Firebase user document

---

## Payment Modal Won't Open

### Possible Causes

1. **Missing Publishable Key**
   ```typescript
   // Check .env.local
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```

2. **Wrong Key Format**
   - Test mode: `pk_test_...`
   - Live mode: `pk_live_...`

3. **Client Component Not Marked**
   ```typescript
   // Add at top of file
   "use client";
   ```

### Solution
```typescript
// Verify in browser console
console.log(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
// Should output: pk_test_...
```

---

## Webhook Events Not Received

### Checklist for Local Development
- [ ] Stripe CLI installed
- [ ] Logged in: `stripe login`
- [ ] Forwarding active: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
- [ ] Webhook secret from CLI added to `.env.local`
- [ ] Dev server running

### Checklist for Production
- [ ] Webhook endpoint publicly accessible
- [ ] HTTPS enabled
- [ ] Correct URL in Stripe Dashboard
- [ ] Webhook secret from Dashboard in env vars
- [ ] Events selected in Dashboard

### Debug
Check Stripe Dashboard → Developers → Webhooks → [Your Endpoint] → Event logs

---

## Firebase Permission Denied

### Error Message
```
Missing or insufficient permissions
```

### Causes
1. **Security Rules Too Restrictive**
2. **User Not Authenticated**
3. **Wrong User ID**

### Solution
Update Firestore Security Rules:

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

---

## Product Not Found

### Error Message
```
Product not found
```

### Checklist
- [ ] Product ID is correct
- [ ] Product exists in Firebase
- [ ] `sellerId` field matches user ID
- [ ] Product not deleted

### Debug
```typescript
// Check in Firebase Console
// Firestore → products → [productId]

// Or query in code
const productDoc = await getDoc(doc(firebaseDb, "products", productId));
console.log("Product exists:", productDoc.exists());
console.log("Product data:", productDoc.data());
```

---

## TypeScript Errors After Installation

### Error Message
```
Cannot find module 'stripe' or its corresponding type declarations
```

### Solution
1. **Restart TypeScript Server**
   - VS Code: Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server"

2. **Reinstall Dependencies**
   ```bash
   rm -rf node_modules
   rm package-lock.json
   npm install
   ```

3. **Check Installation**
   ```bash
   npm list stripe @stripe/stripe-js @stripe/react-stripe-js
   ```

---

## Environment Variables Not Loading

### Symptoms
- `undefined` when accessing `process.env.STRIPE_SECRET_KEY`
- "Missing API key" errors

### Solution

1. **Check File Name**
   - Must be `.env.local` (not `.env`)
   - In project root directory

2. **Restart Dev Server**
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```

3. **Verify Variables**
   ```typescript
   // In API route (server-side)
   console.log("Secret key:", process.env.STRIPE_SECRET_KEY?.slice(0, 10));
   
   // In component (client-side)
   console.log("Publishable key:", process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.slice(0, 10));
   ```

4. **Check Prefix**
   - Client-side: Must start with `NEXT_PUBLIC_`
   - Server-side: No prefix needed

---

## Orders Not Created After Payment

### Checklist
- [ ] Webhook endpoint receiving events
- [ ] Webhook signature verified
- [ ] `checkout.session.completed` handler implemented
- [ ] Firebase write permissions granted
- [ ] No errors in webhook logs

### Debug
1. **Check Webhook Logs**
   ```typescript
   // In webhook handler
   console.log("Event type:", event.type);
   console.log("Session data:", event.data.object);
   ```

2. **Check Firebase**
   - Open Firebase Console → Firestore
   - Check `orders` collection for new documents

3. **Check Stripe Dashboard**
   - Developers → Webhooks → Event logs
   - Check for delivery status and responses

---

## Test Card Declined

### Issue
Using `4242 4242 4242 4242` but payment fails

### Solution

1. **Check Test Mode**
   - Ensure using test keys (`sk_test_`, `pk_test_`)
   - Stripe Dashboard should show "Test Mode" badge

2. **Card Details**
   - Card: `4242 4242 4242 4242`
   - CVC: Any 3 digits (e.g., `123`)
   - Expiry: Any future date (e.g., `12/34`)
   - ZIP: Any 5 digits (e.g., `12345`)

3. **Test Specific Scenarios**
   - Declined: `4000 0000 0000 0002`
   - 3D Secure: `4000 0027 6000 3184`
   - Insufficient funds: `4000 0000 0000 9995`

---

## Platform Fee Not Applied

### Checklist
- [ ] `application_fee_amount` set in checkout session
- [ ] Amount calculated correctly (in cents)
- [ ] Connected account destination specified
- [ ] Charge appears in Stripe Dashboard

### Verify
```typescript
// In /api/payments route
const platformFee = Math.round(product.price * 0.05 * 100); // 5% in cents

const session = await stripe.checkout.sessions.create({
  payment_intent_data: {
    application_fee_amount: platformFee,
    transfer_data: {
      destination: sellerStripeAccountId,
    },
  },
  // ... other options
});
```

Check in Stripe Dashboard:
- Payment details → Application fee section

---

## Need More Help?

### Check Documentation
- [QUICKSTART.md](./QUICKSTART.md)
- [STRIPE_CONNECT_SETUP.md](./STRIPE_CONNECT_SETUP.md)
- [STRIPE_TESTING_GUIDE.md](./STRIPE_TESTING_GUIDE.md)

### Check Logs
- Terminal console (server logs)
- Browser console (client logs)
- Stripe Dashboard event logs
- Firebase Console logs

### Stripe Resources
- [Stripe API Docs](https://stripe.com/docs/api)
- [Stripe Connect Guide](https://stripe.com/docs/connect)
- [Stripe Testing](https://stripe.com/docs/testing)
- [Stripe Support](https://support.stripe.com)

---

**Still stuck? Check the error message carefully - it usually tells you exactly what's wrong! 🔍**
