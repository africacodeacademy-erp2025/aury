# 🏗️ Stripe Connect Architecture

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         AURY MARKETPLACE                             │
│                      (Next.js Application)                           │
└─────────────────────────────────────────────────────────────────────┘
                                 │
                ┌────────────────┴────────────────┐
                │                                  │
                ▼                                  ▼
┌──────────────────────────┐        ┌──────────────────────────┐
│   CREATOR/SELLER SIDE    │        │    CUSTOMER SIDE         │
└──────────────────────────┘        └──────────────────────────┘
                │                                  │
                ▼                                  ▼
        ┌──────────────┐                  ┌──────────────┐
        │  Dashboard   │                  │ Marketplace  │
        │  Component   │                  │   Browse     │
        └──────────────┘                  └──────────────┘
                │                                  │
                ▼                                  ▼
    ┌────────────────────┐            ┌────────────────────┐
    │ StripeConnect      │            │  Product Detail    │
    │ Status Component   │            │      Page          │
    └────────────────────┘            └────────────────────┘
                │                                  │
                │                                  │
                ▼                                  ▼
        Click "Start                      Click "Purchase"
        Onboarding"                             │
                │                                │
                │                                │
                ▼                                ▼
┌───────────────────────────────────────────────────────────────────┐
│                       API ROUTES LAYER                             │
├───────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌──────────────────────┐              ┌──────────────────────┐  │
│  │ /api/onboard-seller  │              │   /api/payments      │  │
│  │                      │              │                      │  │
│  │ 1. Create Account    │              │ 1. Get Product       │  │
│  │ 2. Generate Link     │              │ 2. Get Seller Info   │  │
│  │ 3. Save to Firebase  │              │ 3. Validate Status   │  │
│  └──────────────────────┘              │ 4. Create Session    │  │
│           │                             └──────────────────────┘  │
│           │                                      │                 │
│           │                                      │                 │
│  ┌──────────────────────┐              ┌──────────────────────┐  │
│  │ /onboard-seller/     │              │ /payments/[session]  │  │
│  │     verify           │              │                      │  │
│  │                      │              │ Retrieve Session     │  │
│  │ Check Status         │              │ Details              │  │
│  │ Update Firebase      │              └──────────────────────┘  │
│  └──────────────────────┘                       │                 │
│                                                  │                 │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │           /api/webhooks/stripe                                │ │
│  │                                                                │ │
│  │  • checkout.session.completed → Create Order                  │ │
│  │  • payment_intent.succeeded   → Log Payment                   │ │
│  │  • account.updated            → Update Seller Status          │ │
│  │  • charge.succeeded           → Track Platform Earnings       │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                    │
└───────────────────────────────────────────────────────────────────┘
                │                                │
                ▼                                ▼
┌───────────────────────────┐      ┌───────────────────────────┐
│      STRIPE CONNECT       │      │   FIREBASE FIRESTORE      │
├───────────────────────────┤      ├───────────────────────────┤
│                           │      │                           │
│ • Express Accounts        │◄────►│ users/                    │
│ • Account Links           │      │   - stripeAccountId       │
│ • Checkout Sessions       │      │   - stripeOnboarding...   │
│ • Payment Intents         │      │                           │
│ • Webhooks                │      │ products/                 │
│ • Transfers               │      │   - salesCount            │
│ • Application Fees        │      │                           │
│                           │      │ orders/                   │
│                           │      │   - sessionId             │
│                           │      │   - productId             │
│                           │      │   - amount                │
│                           │      │                           │
│                           │      │ platformEarnings/         │
│                           │      │   - applicationFee        │
│                           │      │   - sellerId              │
└───────────────────────────┘      └───────────────────────────┘
```

## Component Flow Diagrams

### 1️⃣ Seller Onboarding Flow

```
┌──────────┐
│  Seller  │
│  Visits  │
│Dashboard │
└────┬─────┘
     │
     ▼
┌─────────────────┐
│StripeConnect    │
│Status Component │
│ Shows:          │
│ "Not Onboarded" │
└────┬────────────┘
     │
     ▼ Click "Start Onboarding"
┌─────────────────────────┐
│ POST /api/onboard-seller│
│ { sellerId: "xxx" }     │
└────┬────────────────────┘
     │
     ▼
┌─────────────────────────┐
│ Check Firebase          │
│ Has stripeAccountId?    │
└────┬────────────────────┘
     │
     ├─── NO ──┐
     │         ▼
     │    ┌─────────────────────┐
     │    │ stripe.accounts     │
     │    │   .create()         │
     │    │ type: "express"     │
     │    └────┬────────────────┘
     │         │
     │         ▼
     │    ┌─────────────────────┐
     │    │ Save to Firebase:   │
     │    │ stripeAccountId     │
     │    └────┬────────────────┘
     │         │
     └─── YES ─┤
               ▼
     ┌─────────────────────┐
     │ stripe.accountLinks │
     │   .create()         │
     │ Generate URL        │
     └────┬────────────────┘
          │
          ▼
     ┌─────────────────────┐
     │ Return URL to       │
     │ Frontend            │
     └────┬────────────────┘
          │
          ▼
     ┌─────────────────────┐
     │ window.location.href│
     │ = onboarding URL    │
     └────┬────────────────┘
          │
          ▼
     ┌─────────────────────┐
     │ Stripe Onboarding   │
     │ Form (External)     │
     └────┬────────────────┘
          │
          ▼ Seller Completes
     ┌─────────────────────┐
     │ Redirect to:        │
     │ /onboarding/complete│
     └────┬────────────────┘
          │
          ▼
     ┌─────────────────────────┐
     │ GET /onboard-seller/    │
     │        verify           │
     └────┬────────────────────┘
          │
          ▼
     ┌─────────────────────┐
     │ stripe.accounts     │
     │   .retrieve()       │
     └────┬────────────────┘
          │
          ▼
     ┌─────────────────────┐
     │ Update Firebase:    │
     │ - onboardingComplete│
     │ - chargesEnabled    │
     │ - payoutsEnabled    │
     └────┬────────────────┘
          │
          ▼
     ┌─────────────────────┐
     │ Show Success Page   │
     │ ✅ Ready to Sell    │
     └─────────────────────┘
```

### 2️⃣ Payment Processing Flow

```
┌──────────┐
│ Customer │
│ Clicks   │
│"Purchase"│
└────┬─────┘
     │
     ▼
┌─────────────────────┐
│ PurchaseModal Opens │
│ Embedded Checkout   │
└────┬────────────────┘
     │
     ▼
┌──────────────────────────┐
│ fetchClientSecret()      │
│ POST /api/payments       │
│ { productId, customerId }│
└────┬─────────────────────┘
     │
     ▼
┌─────────────────────────────┐
│ Get Product from Firebase   │
│ products/{productId}        │
└────┬────────────────────────┘
     │
     ▼
┌─────────────────────────────┐
│ Get Seller Info             │
│ users/{sellerId}            │
└────┬────────────────────────┘
     │
     ▼
┌─────────────────────────────┐
│ Validate:                   │
│ ✓ stripeAccountId exists    │
│ ✓ onboardingComplete = true │
└────┬────────────────────────┘
     │
     ├─── FAIL ──► Return Error
     │
     ▼ PASS
┌──────────────────────────────┐
│ Calculate Platform Fee       │
│ fee = price * 0.05           │
└────┬─────────────────────────┘
     │
     ▼
┌──────────────────────────────┐
│ stripe.checkout.sessions     │
│   .create({                  │
│     payment_intent_data: {   │
│       application_fee_amount │
│       transfer_data: {       │
│         destination: seller  │
│       }                      │
│     }                        │
│   })                         │
└────┬─────────────────────────┘
     │
     ▼
┌─────────────────────────┐
│ Return client_secret    │
└────┬────────────────────┘
     │
     ▼
┌─────────────────────────┐
│ Stripe.js Renders       │
│ Checkout Form           │
└────┬────────────────────┘
     │
     ▼
┌─────────────────────────┐
│ Customer Enters Card    │
│ 4242 4242 4242 4242     │
└────┬────────────────────┘
     │
     ▼
┌─────────────────────────┐
│ Stripe Processes        │
│ Payment                 │
└────┬────────────────────┘
     │
     ├──► Webhook: checkout.session.completed
     │    ├─► Create Order in Firebase
     │    ├─► Update Product Sales Count
     │    └─► Track Platform Earnings
     │
     ├──► Webhook: payment_intent.succeeded
     │    └─► Log Success
     │
     └──► Webhook: charge.succeeded
          └─► Track Earnings
               │
               ▼
     ┌─────────────────────────┐
     │ Redirect to:            │
     │ /marketplace/           │
     │   paymentResult         │
     └────┬────────────────────┘
          │
          ▼
     ┌─────────────────────────┐
     │ GET /api/payments/      │
     │     [sessionId]         │
     └────┬────────────────────┘
          │
          ▼
     ┌─────────────────────────┐
     │ Display Payment Success │
     │ ✅ Order Confirmed      │
     └─────────────────────────┘
```

### 3️⃣ Webhook Processing Flow

```
┌─────────────┐
│   Stripe    │
│   Event     │
└──────┬──────┘
       │
       ▼
┌──────────────────────┐
│ POST /api/webhooks/  │
│      stripe          │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Verify Signature     │
│ stripe.webhooks      │
│   .constructEvent()  │
└──────┬───────────────┘
       │
       ├─── FAIL ──► Return 400 Error
       │
       ▼ PASS
┌──────────────────────┐
│ Switch on event.type │
└──────┬───────────────┘
       │
       ├─► checkout.session.completed
       │   ├─► Get product from Firebase
       │   ├─► Create order document
       │   ├─► Increment product.salesCount
       │   └─► Log success
       │
       ├─► payment_intent.succeeded
       │   └─► Log payment info
       │
       ├─► account.updated
       │   ├─► Find user by stripeAccountId
       │   ├─► Update onboarding status
       │   └─► Update capabilities
       │
       └─► charge.succeeded
           ├─► Extract application_fee
           ├─► Create platformEarnings doc
           └─► Log platform revenue
                   │
                   ▼
           ┌──────────────────┐
           │ Return 200 OK    │
           └──────────────────┘
```

## Data Flow

### Money Flow

```
Customer Payment ($25.00)
        │
        ▼
┌───────────────────┐
│  Stripe Platform  │
└────────┬──────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
Platform   Seller
  Fee      Transfer
($1.25)   ($23.75*)
  5%
    │         │
    │         └──► Seller's Stripe Balance
    │              ├─► Payout to Bank Account
    │              └─► (2-7 days)
    │
    └─► Platform's Stripe Balance
         └─► Collects in platform account

* After Stripe processing fees (~$0.75)
```

### Information Flow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Frontend   │────►│   API Route  │────►│    Stripe    │
│  (Browser)   │◄────│  (Server)    │◄────│   (Cloud)    │
└──────────────┘     └──────┬───────┘     └──────────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │   Firebase   │
                     │  Firestore   │
                     └──────────────┘
```

## Security Layers

```
┌─────────────────────────────────────────────┐
│            Security Boundaries               │
├─────────────────────────────────────────────┤
│                                              │
│  Client Side                                 │
│  ├─ Session authentication only              │
│  ├─ No Stripe secret keys                    │
│  └─ Read-only Firebase access                │
│                                              │
├──────────────────────────────────────────────┤
│                                              │
│  Server Side (API Routes)                    │
│  ├─ Stripe secret key access                 │
│  ├─ Firebase admin SDK                       │
│  ├─ User validation                          │
│  └─ Seller status verification               │
│                                              │
├──────────────────────────────────────────────┤
│                                              │
│  Webhooks                                    │
│  ├─ Signature verification required          │
│  ├─ Server-only processing                   │
│  └─ Idempotent operations                    │
│                                              │
├──────────────────────────────────────────────┤
│                                              │
│  Firebase Firestore                          │
│  ├─ Security rules enforcement               │
│  ├─ Stripe fields protected                  │
│  └─ User-scoped access only                  │
│                                              │
└──────────────────────────────────────────────┘
```

## Tech Stack

```
Frontend Layer
├── Next.js 15 (React 19)
├── TypeScript
├── Tailwind CSS
└── Stripe.js / React Stripe.js

Backend Layer
├── Next.js API Routes
├── Stripe Node.js SDK
├── Firebase Admin SDK
└── Webhook Processing

Data Layer
├── Firebase Firestore
│   ├── users
│   ├── products
│   ├── orders
│   └── platformEarnings
└── Stripe Data
    ├── Accounts
    ├── Sessions
    ├── PaymentIntents
    └── Charges

External Services
├── Stripe Connect
│   ├── Express Accounts
│   ├── Checkout Sessions
│   └── Webhooks
└── Firebase
    ├── Authentication
    ├── Firestore
    └── Storage
```

---

This architecture ensures:
✅ Secure payment processing
✅ Proper separation of concerns
✅ Scalable webhook handling
✅ Real-time data consistency
✅ Production-ready infrastructure
