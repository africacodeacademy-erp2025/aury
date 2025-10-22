# Paystack Migration Guide

## Overview
This document outlines the complete migration from Stripe to Paystack for the Aury marketplace platform. The migration enables sellers in Lesotho and other African countries to receive payments through Paystack's infrastructure.

## Table of Contents
1. [Migration Strategy](#migration-strategy)
2. [Paystack API Mappings](#paystack-api-mappings)
3. [Data Schema Changes](#data-schema-changes)
4. [Implementation Phases](#implementation-phases)
5. [Testing Strategy](#testing-strategy)
6. [Rollback Plan](#rollback-plan)
7. [Deployment Checklist](#deployment-checklist)

## Migration Strategy

### Phase 1: Preparation (Tasks 1-3)
- Research Paystack APIs
- Set up environment variables
- Update Firestore schema
- Run migration script for existing data

### Phase 2: Backend Implementation (Tasks 4-9)
- Implement seller onboarding API
- Implement payment initialization API
- Implement payment verification API
- Implement webhook handler
- Update payout logic

### Phase 3: Frontend Updates (Tasks 5, 7)
- Update seller onboarding UI
- Update checkout flow
- Update payment status components

### Phase 4: Testing & Documentation (Tasks 14-16)
- Write unit tests
- Write integration tests
- Set up CI/CD
- Complete documentation

## Paystack API Mappings

### Stripe → Paystack Equivalents

| Stripe Concept | Paystack Equivalent | Notes |
|----------------|---------------------|-------|
| Connect Account | Subaccount | Used for split payments |
| Account Link | Subaccount Creation | Seller provides bank details |
| Payment Intent | Transaction Initialize | Returns authorization URL |
| Checkout Session | Transaction Initialize | Redirect or inline flow |
| Webhook Events | Webhook Events | Similar structure |
| Transfer | Transfer/Transfer Recipient | For direct payouts |
| application_fee_amount | Split configuration | Platform commission |

### Key Paystack Endpoints

1. **Subaccount Management**
   - POST `/subaccount` - Create subaccount
   - GET `/subaccount/:id` - Get subaccount details
   - PUT `/subaccount/:id` - Update subaccount

2. **Transaction Flow**
   - POST `/transaction/initialize` - Start payment
   - GET `/transaction/verify/:reference` - Verify payment
   - GET `/transaction` - List transactions

3. **Split Payments**
   - POST `/split` - Create split configuration
   - GET `/split/:id` - Get split details
   - Split can be configured per transaction or reusable

4. **Transfers (Payouts)**
   - POST `/transferrecipient` - Create recipient
   - POST `/transfer` - Initiate transfer
   - GET `/transfer/:id` - Get transfer status

5. **Webhooks**
   - POST (configured URL) - Receive events
   - Events: charge.success, charge.failed, transfer.success, etc.

### Currency Support
- Paystack supports: NGN (Nigeria), GHS (Ghana), ZAR (South Africa), KES (Kenya)
- **Note**: Lesotho (LSL) is not directly supported. Options:
  1. Use ZAR (South African Rand) - most practical for Lesotho
  2. Convert amounts to supported currency
  3. Document this limitation clearly

## Data Schema Changes

### User Collection Updates

```typescript
// Before (Stripe)
interface User {
  stripeAccountId?: string;
  stripeOnboardingComplete?: boolean;
  stripeChargesEnabled?: boolean;
  stripePayoutsEnabled?: boolean;
}

// After (Paystack)
interface User {
  // Keep Stripe fields for historical data
  stripeAccountId?: string;
  stripeOnboardingComplete?: boolean;
  
  // New Paystack fields
  paystackSubaccountId?: string;
  paystackSubaccountCode?: string;
  paystackOnboardingComplete: boolean;
  paystackRecipientCode?: string;
  paystackAccountMeta?: {
    businessName?: string;
    bankName?: string;
    accountNumber?: string; // Stored encrypted or as last 4 digits only
    bankCode?: string;
    currency?: string;
  };
  
  // Migration tracking
  paymentProvider: 'stripe' | 'paystack';
  migratedAt?: string;
}
```

### Transactions Collection (New)

```typescript
interface Transaction {
  id: string; // Firestore doc ID
  reference: string; // Paystack reference
  buyerId: string;
  sellerId: string;
  productId: string;
  
  // Amounts in kobo/cents
  amountKobo: number;
  platformFeeKobo: number;
  sellerGrossKobo: number;
  
  // Paystack specific
  paystackReference: string;
  paystackAccessCode?: string;
  paystackAuthorizationUrl?: string;
  paystackAuthorization?: any; // From verify response
  paystackChannel?: string; // card, bank, ussd, etc.
  
  // Status tracking
  status: 'pending' | 'success' | 'failed' | 'abandoned';
  paymentStatus: 'pending' | 'paid' | 'failed';
  
  // Metadata
  productName: string;
  productType: 'pattern' | 'physical';
  currency: string; // 'ZAR', 'NGN', etc.
  
  // Timestamps
  createdAt: Timestamp;
  paidAt?: Timestamp;
  updatedAt: Timestamp;
  
  // For historical tracking
  migratedFrom?: 'stripe';
  stripePaymentIntentId?: string;
}
```

### Orders Collection Updates

```typescript
// Update existing orders to include payment provider
interface Order {
  // ... existing fields
  paymentProvider: 'stripe' | 'paystack';
  paystackReference?: string;
  stripeSessionId?: string; // Keep for historical
}
```

### Webhook Logs Collection (New)

```typescript
interface WebhookLog {
  id: string;
  eventId: string; // Paystack event ID for idempotency
  eventType: string; // charge.success, etc.
  payload: any;
  processed: boolean;
  processedAt?: Timestamp;
  error?: string;
  createdAt: Timestamp;
}
```

### Platform Earnings Collection Updates

```typescript
interface PlatformEarnings {
  id: string;
  transactionId: string;
  reference: string; // Paystack reference
  amount: number;
  applicationFee: number;
  currency: string;
  sellerId: string;
  provider: 'stripe' | 'paystack';
  createdAt: Timestamp;
}
```

## Implementation Phases

### Phase 1: Setup and Preparation

#### Task 1: Environment Variables
Create `.env.local.example` with Paystack configuration:

```bash
# Paystack (Test/Sandbox)
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_xxx
PAYSTACK_SECRET_KEY=sk_test_xxx
PAYSTACK_WEBHOOK_SECRET=whsec_xxx

# Paystack (Production) - Add when ready
# NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_xxx
# PAYSTACK_SECRET_KEY=sk_live_xxx
# PAYSTACK_WEBHOOK_SECRET=whsec_xxx

# Platform Configuration
PLATFORM_FEE_PERCENTAGE=5
DEFAULT_CURRENCY=ZAR

# Keep existing Stripe keys for historical data access
# (Remove after full migration and reconciliation)
```

#### Task 2: Migration Script
Create `scripts/migrate-stripe-to-paystack.ts` to:
- Read existing users with Stripe accounts
- Mark them for Paystack onboarding
- Preserve Stripe data for historical reference
- Create initial transactions from historical Stripe orders

#### Task 3: Firestore Indexes
Update Firestore indexes for new queries:
- transactions: by sellerId, status, createdAt
- transactions: by buyerId, status, createdAt
- transactions: by paystackReference
- webhook_logs: by eventId (for idempotency)

### Phase 2: Core Implementation

See individual task files in `docs/tasks/` directory.

## Testing Strategy

### Unit Tests
- API endpoint input validation
- Fee calculation accuracy
- Webhook signature verification
- Transaction state transitions

### Integration Tests
- End-to-end seller onboarding flow
- End-to-end buyer checkout flow
- Webhook processing with test events
- Payout reconciliation

### Manual Testing Checklist
- [ ] Seller onboarding in sandbox
- [ ] Create test products
- [ ] Purchase flow with test cards
- [ ] Verify webhook delivery
- [ ] Check Firestore data consistency
- [ ] Test refund flow
- [ ] Verify platform fee calculation
- [ ] Test payout initiation

### Paystack Test Cards
```
Successful payment: 4084084084084081
Failed payment: 4084084084084090
```

## Rollback Plan

### Immediate Rollback (Within 24 hours)
1. Revert API routes to Stripe versions
2. Update frontend to use Stripe checkout
3. Disable Paystack webhook endpoint
4. Monitor for errors

### Data Preservation
- **Never delete Stripe data** until Paystack is fully validated
- Keep parallel systems for at least one billing cycle
- Maintain transaction logs for audit trail

### Rollback Triggers
- Payment success rate drops below 90%
- Webhook delivery failure rate above 10%
- Critical bugs affecting checkout
- Subaccount creation failure rate above 20%

## Deployment Checklist

### Pre-Deployment
- [ ] All tests passing in CI
- [ ] Paystack sandbox testing complete
- [ ] Migration script tested on staging
- [ ] Webhook endpoint configured in Paystack dashboard
- [ ] Environment variables set in production
- [ ] Rollback plan documented and tested
- [ ] Team briefed on migration

### Deployment Steps
1. Deploy migration script (data preparation)
2. Deploy new API routes with feature flag OFF
3. Verify endpoints return 200 in production
4. Configure Paystack webhooks
5. Test webhook delivery with test event
6. Enable feature flag for internal testing
7. Monitor errors and metrics
8. Gradual rollout to users (10%, 50%, 100%)

### Post-Deployment
- [ ] Monitor payment success rates
- [ ] Monitor webhook processing
- [ ] Verify platform earnings calculations
- [ ] Check seller payout accuracy
- [ ] Run reconciliation report
- [ ] Gather user feedback
- [ ] Document any issues and resolutions

### Monitoring Metrics
- Payment success rate
- Webhook delivery rate
- API response times
- Error rates by endpoint
- Platform fee accuracy
- Seller onboarding completion rate

## Support and Resources

### Paystack Documentation
- API Reference: https://paystack.com/docs/api/
- Subaccounts: https://paystack.com/docs/payments/multi-split-payments/#subaccount
- Webhooks: https://paystack.com/docs/payments/webhooks/
- Test Mode: https://paystack.com/docs/payments/test-payments/

### Contact
- Paystack Support: support@paystack.com
- Developer Resources: developers@paystack.com

## Appendix

### A. Paystack vs Stripe Feature Comparison

| Feature | Stripe | Paystack | Notes |
|---------|--------|----------|-------|
| Split Payments | ✅ Connect | ✅ Subaccounts | Similar functionality |
| Hosted Checkout | ✅ | ✅ | Different UI |
| Inline Checkout | ✅ Elements | ✅ Inline | Similar integration |
| Webhooks | ✅ | ✅ | Similar events |
| Direct Payouts | ✅ | ✅ | Via Transfers API |
| Refunds | ✅ | ✅ | Via Refund API |
| Multi-currency | ✅ 135+ | ⚠️ 4 currencies | Limitation for Paystack |
| Dashboard | ✅ | ✅ | Both excellent |

### B. Currency Handling for Lesotho

Lesotho (LSL) is not directly supported by Paystack. Recommended approach:

1. **Use South African Rand (ZAR)**
   - LSL is pegged 1:1 with ZAR
   - Widely accepted in Lesotho
   - Supported by Paystack

2. **Display Currency Conversion**
   - Show prices in both LSL and ZAR
   - Update conversion rate periodically if needed
   - Clearly communicate to users

3. **Bank Account Setup**
   - Sellers may need South African bank accounts
   - OR use local banks that support ZAR transactions
   - Document account setup requirements clearly

### C. Migration Timeline Estimate

- **Week 1**: Setup, migration script, backend APIs
- **Week 2**: Frontend updates, testing setup
- **Week 3**: Integration testing, documentation
- **Week 4**: Staging deployment, final testing
- **Week 5**: Production deployment, monitoring
- **Week 6+**: Optimization, full Stripe deprecation

Total estimate: **4-6 weeks** for complete migration
