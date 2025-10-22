# Paystack Migration - Implementation Status & Next Steps

## ✅ Completed Tasks

### Documentation
- [x] **PAYSTACK_MIGRATION.md** - Complete migration guide with strategy, mappings, and rollback plan
- [x] **PAYSTACK_SETUP.md** - Step-by-step Paystack account setup and configuration guide

### Core Infrastructure
- [x] **lib/paystack.ts** - Complete Paystack API client with TypeScript types
- [x] **types/transaction.ts** - Transaction, webhook, and payout type definitions
- [x] **types/index.d.ts** - Updated User interface with Paystack fields

### Migration & Setup
- [x] **scripts/migrate-stripe-to-paystack.ts** - Idempotent migration script for existing data
- [x] **package.json** - Updated dependencies (removed Stripe, added testing tools)

### Backend API Routes
- [x] **app/api/onboard-seller-paystack/route.ts** - Seller onboarding with subaccount creation
- [x] **app/api/banks/route.ts** - Bank list API for seller onboarding UI
- [x] **app/api/payments-paystack/route.ts** - Payment initialization with split configuration
- [x] **app/api/payments-paystack/verify/[reference]/route.ts** - Payment verification endpoint
- [x] **app/api/webhooks/paystack/route.ts** - Webhook handler with signature verification

---

## 🚧 Remaining Tasks

### 1. Frontend Components (HIGH PRIORITY)

#### Task 1.1: Create PaystackOnboardingForm Component
**File**: `components/creator/PaystackOnboardingForm.tsx`

**Purpose**: Replace StripeConnectStatus with Paystack-specific onboarding flow

**Features Needed**:
- Bank selection dropdown (fetches from `/api/banks`)
- Account number input with validation
- Business name input
- Real-time account validation
- Loading states
- Error handling
- Success confirmation

**Key Differences from Stripe**:
- No external redirect (all in-app)
- Manual bank details collection
- Account validation step
- Immediate completion (no async onboarding)

#### Task 1.2: Create PaystackCheckout Component
**File**: `components/marketplace/PaystackCheckout.tsx`

**Purpose**: Replace PurchaseModal with Paystack payment flow

**Options**:
1. **Redirect Flow** (Simpler):
   - Call `/api/payments-paystack`
   - Redirect to `authorizationUrl`
   - Return to callback URL
   
2. **Inline Flow** (Better UX):
   - Load Paystack inline JS
   - Call `PaystackPop.setup()`
   - Handle response in-app

**Recommendation**: Start with redirect, add inline later

#### Task 1.3: Create PaymentResultPage
**File**: `app/(root)/marketplace/paymentResult/page.tsx`

**Updates Needed**:
- Parse `reference` parameter (not `session_id`)
- Call `/api/payments-paystack/verify/[reference]`
- Display success/failure UI
- Handle pattern downloads
- Order confirmation

#### Task 1.4: Update Seller Dashboard
**File**: `app/(creator)/dashboard/page.tsx`

**Updates**:
- Show Paystack onboarding status
- Display PaystackOnboardingForm if not complete
- Show earnings from Paystack transactions
- Payout schedule information

---

### 2. Environment Variables & Configuration

#### Task 2.1: Create .env.local.example
**File**: `.env.local.example`

```bash
# Firebase
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

# Paystack (Test)
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_
PAYSTACK_SECRET_KEY=sk_test_
PAYSTACK_WEBHOOK_SECRET=whsec_

# App Configuration
BASE_URL=http://localhost:3000
PLATFORM_FEE_PERCENTAGE=5
DEFAULT_CURRENCY=ZAR

# Email (Optional)
SMTP_HOST=
SMTP_PORT=
EMAIL_USER=
EMAIL_PASSWORD=
```

#### Task 2.2: Update Production Environment Variables
- Add Paystack keys to Vercel/hosting platform
- Configure webhook URL in Paystack dashboard
- Set up secrets in CI/CD

---

### 3. Testing Setup

#### Task 3.1: Create Vitest Configuration
**File**: `vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
```

#### Task 3.2: Unit Tests
Create tests for:
- **lib/paystack.ts**
  - Fee calculations
  - Reference generation
  - Amount conversions
  
- **API Routes**
  - Input validation
  - Error handling
  - Mock Paystack responses

**Files to create**:
- `tests/lib/paystack.test.ts`
- `tests/api/onboard-seller.test.ts`
- `tests/api/payments.test.ts`
- `tests/api/webhooks.test.ts`

#### Task 3.3: Integration Tests (Playwright)
**File**: `tests/e2e/checkout.spec.ts`

Test scenarios:
1. Seller onboarding flow
2. Product purchase flow
3. Payment verification
4. Order creation

---

### 4. Payouts & Transfers

#### Task 4.1: Create Payout API
**File**: `app/api/payouts/route.ts`

**Features**:
- List pending earnings by seller
- Initiate transfer to seller
- Get payout history
- Payout scheduling

#### Task 4.2: Create Payout UI
**File**: `app/(creator)/earnings/page.tsx`

**Features**:
- Show available balance
- Pending transactions
- Payout history
- Request payout button

---

### 5. Reconciliation & Admin

#### Task 5.1: Create Reconciliation Script
**File**: `scripts/reconcile-paystack.ts`

**Purpose**:
- Compare Firestore transactions with Paystack
- Detect mismatches
- Generate reconciliation report
- Export to CSV

#### Task 5.2: Create Admin Dashboard
**File**: `app/admin/reconciliation/page.tsx`

**Features**:
- Run reconciliation
- View reports
- Resolve discrepancies
- Export data

---

### 6. Refunds & Disputes

#### Task 6.1: Create Refund API
**File**: `app/api/refunds/route.ts`

**Features**:
- Initiate refund via Paystack API
- Update transaction status
- Adjust platform earnings
- Notify customer

#### Task 6.2: Handle Dispute Webhooks
**Update**: `app/api/webhooks/paystack/route.ts`

Add handlers for:
- `customeridentification.success`
- `customeridentification.failed`
- Dispute events (if applicable)

---

### 7. Email Notifications

#### Task 7.1: Update Email Templates
**Files**:
- `lib/utils/email.ts`

**Templates to create**:
- Payment confirmation
- Order confirmation
- Payout notification
- Onboarding welcome

---

### 8. Documentation

#### Task 8.1: Update README.md
Add sections for:
- Paystack setup instructions
- Environment variables
- Testing with sandbox
- Deployment guide

#### Task 8.2: Create API Documentation
**File**: `docs/API.md`

Document all endpoints:
- Request/response formats
- Error codes
- Examples with curl

#### Task 8.3: Create User Guide
**File**: `docs/USER_GUIDE.md`

Guides for:
- Sellers: How to onboard
- Buyers: How to checkout
- Platform owners: Admin tasks

---

### 9. CI/CD Setup

#### Task 9.1: GitHub Actions Workflow
**File**: `.github/workflows/test.yml`

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run lint
      - run: npm run test
      - run: npm run build
```

#### Task 9.2: Deploy Workflow
**File**: `.github/workflows/deploy.yml`

Auto-deploy to Vercel on main branch

---

### 10. Migration Execution

#### Task 10.1: Pre-Migration Checklist
- [ ] Backup Firestore database
- [ ] Test migration script in staging
- [ ] Notify users of upcoming changes
- [ ] Prepare rollback plan

#### Task 10.2: Run Migration
```bash
npm run migrate:paystack
```

#### Task 10.3: Post-Migration
- [ ] Verify data integrity
- [ ] Test key flows
- [ ] Monitor error logs
- [ ] Run reconciliation

---

## Priority Order for Implementation

### Week 1: Core Payment Flow
1. Environment variables setup
2. PaystackCheckout component (redirect flow)
3. PaymentResultPage updates
4. Testing with Paystack sandbox

### Week 2: Seller Onboarding
5. PaystackOnboardingForm component
6. Bank selection integration
7. Seller dashboard updates
8. End-to-end onboarding test

### Week 3: Testing & QA
9. Unit tests for critical paths
10. E2E tests with Playwright
11. Manual QA with test cards
12. Fix bugs and edge cases

### Week 4: Payouts & Admin
13. Payout API and UI
14. Reconciliation script
15. Admin tools
16. Email notifications

### Week 5: Migration & Deployment
17. Run migration in staging
18. Deploy to production
19. Monitor and iterate
20. Complete documentation

---

## Quick Start Commands

```bash
# Install dependencies
npm install

# Run migration (staging first!)
npm run migrate:paystack

# Start dev server
npm run dev

# Run tests
npm run test

# Run E2E tests
npm run test:e2e

# Build for production
npm run build
```

---

## Critical Success Factors

1. **Test Thoroughly**: Use Paystack sandbox extensively
2. **Monitor Webhooks**: Set up logging and alerts
3. **Gradual Rollout**: Start with internal users
4. **Keep Stripe Data**: Don't delete until fully validated
5. **Document Everything**: For support and onboarding

---

## Support Resources

- **Paystack Docs**: https://paystack.com/docs
- **Paystack Test Cards**: See PAYSTACK_SETUP.md
- **Migration Guide**: See PAYSTACK_MIGRATION.md
- **Support Email**: support@paystack.com

---

## Notes for Lesotho (LSL Currency)

⚠️ **Important**: Paystack does not directly support LSL (Lesotho Loti).

**Solution**: Use ZAR (South African Rand)
- LSL is pegged 1:1 with ZAR
- Set `DEFAULT_CURRENCY=ZAR`
- Display prices in both LSL and ZAR if needed
- Sellers may need SA bank accounts or local banks supporting ZAR

**Alternative**: If ZAR doesn't work, use USD and clearly communicate exchange rates.

---

## Getting Help

If you encounter issues:

1. Check the error logs
2. Review Paystack dashboard for transaction details
3. Consult PAYSTACK_MIGRATION.md for troubleshooting
4. Contact Paystack support
5. Review webhook logs in Firestore

Good luck with the migration! 🚀
