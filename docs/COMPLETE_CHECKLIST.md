# ✅ Paystack Migration - Complete Checklist

Use this checklist to track your implementation progress. Check off items as you complete them.

## Phase 1: Setup & Configuration

### Environment Setup
- [ ] Node.js 18+ installed
- [ ] Project cloned/forked
- [ ] Dependencies installed (`npm install`)
- [ ] `.env.local` created from `.env.local.example`

### Paystack Account
- [ ] Paystack account created at https://paystack.com
- [ ] Email verified
- [ ] Test mode enabled
- [ ] Test API keys obtained:
  - [ ] Public key (`pk_test_xxx`)
  - [ ] Secret key (`sk_test_xxx`)
- [ ] API keys added to `.env.local`

### Firebase Setup
- [ ] Firebase project created
- [ ] Service account credentials obtained
- [ ] Firebase credentials added to `.env.local`
- [ ] Firestore database created
- [ ] Firestore indexes deployed (`firestore.indexes.json`)

---

## Phase 2: Backend Migration

### Database Migration
- [ ] Migration script reviewed (`scripts/migrate-stripe-to-paystack.ts`)
- [ ] Backup of Firestore database created
- [ ] Migration script tested in development
- [ ] Migration script executed successfully:
  - [ ] Users migrated
  - [ ] Orders migrated
  - [ ] Transaction records created
  - [ ] No errors in migration log

### API Routes - Seller Onboarding
- [ ] `/api/onboard-seller-paystack` route created
- [ ] Bank validation implemented
- [ ] Subaccount creation working
- [ ] Firestore updates successful
- [ ] Error handling tested
- [ ] Unit tests written and passing

### API Routes - Banks
- [ ] `/api/banks` route created
- [ ] Bank list retrieval working
- [ ] Caching implemented (optional)
- [ ] Error handling tested

### API Routes - Payments
- [ ] `/api/payments-paystack` route created
- [ ] Seller onboarding validation working
- [ ] Fee calculation correct
- [ ] Transaction initialization successful
- [ ] Firestore transaction creation working
- [ ] Error handling tested
- [ ] Unit tests written and passing

### API Routes - Payment Verification
- [ ] `/api/payments-paystack/verify/[reference]` route created
- [ ] Paystack verification working
- [ ] Transaction status updates correct
- [ ] Order creation on success working
- [ ] Product sales count updates working
- [ ] Platform earnings tracking working
- [ ] Error handling tested
- [ ] Unit tests written and passing

### API Routes - Webhooks
- [ ] `/api/webhooks/paystack` route created
- [ ] Signature verification implemented
- [ ] Idempotency check working (event ID)
- [ ] Event logging to Firestore working
- [ ] `charge.success` handler implemented
- [ ] `charge.failed` handler implemented
- [ ] `transfer.success` handler implemented (if payouts ready)
- [ ] `transfer.failed` handler implemented (if payouts ready)
- [ ] Error handling tested
- [ ] Unit tests written and passing

---

## Phase 3: Webhook Configuration

### Local Development (ngrok)
- [ ] ngrok installed (`npm install -g ngrok`)
- [ ] ngrok tunnel started (`ngrok http 3000`)
- [ ] HTTPS URL copied
- [ ] Webhook URL configured in Paystack dashboard
- [ ] Webhook secret obtained
- [ ] Webhook secret added to `.env.local`
- [ ] Dev server restarted
- [ ] Test webhook sent from Paystack dashboard
- [ ] Webhook received and processed successfully
- [ ] Webhook logged in Firestore `webhook_logs` collection

### Production Webhooks (when ready)
- [ ] Production domain available
- [ ] Webhook URL updated to production: `https://yourdomain.com/api/webhooks/paystack`
- [ ] Production webhook secret obtained
- [ ] Production webhook secret added to environment variables
- [ ] Test webhook sent to production
- [ ] Production webhook verified

---

## Phase 4: Testing

### Unit Tests
- [ ] Test framework configured (Vitest)
- [ ] `tests/setup.ts` created
- [ ] `tests/lib/paystack.test.ts` implemented
- [ ] Fee calculation tests passing
- [ ] Amount conversion tests passing
- [ ] Reference generation tests passing
- [ ] API route unit tests implemented
- [ ] All unit tests passing (`npm run test`)
- [ ] Test coverage > 80% for payment code

### Integration Testing (Manual)
- [ ] Dev server running
- [ ] Seller onboarding flow tested:
  - [ ] Bank selection working
  - [ ] Account validation working
  - [ ] Subaccount creation successful
  - [ ] Subaccount visible in Paystack dashboard
  - [ ] Firestore user document updated
  
- [ ] Buyer checkout flow tested:
  - [ ] Product page loads
  - [ ] Purchase button works
  - [ ] Payment initialization successful
  - [ ] Redirect to Paystack checkout
  - [ ] Test card payment successful: `4084 0840 8408 4081`
  - [ ] Redirect back to app
  - [ ] Transaction marked as success
  - [ ] Order created in Firestore
  - [ ] Product sales count incremented
  - [ ] Platform earnings tracked
  
- [ ] Webhook flow tested:
  - [ ] Payment triggers webhook
  - [ ] Webhook received
  - [ ] Signature verified
  - [ ] Event logged
  - [ ] Transaction updated
  - [ ] No duplicate processing

### E2E Tests (Optional but Recommended)
- [ ] Playwright configured
- [ ] `tests/e2e/checkout.spec.ts` implemented
- [ ] Seller onboarding test passing
- [ ] Buyer checkout test passing
- [ ] All E2E tests passing (`npm run test:e2e`)

---

## Phase 5: Frontend Implementation

### Checkout Component
- [ ] `components/marketplace/PaystackCheckout.tsx` created
- [ ] Redirect flow implemented
- [ ] Payment initialization working
- [ ] Loading states implemented
- [ ] Error handling implemented
- [ ] Styled and responsive
- [ ] Tested with real checkout flow

### Seller Onboarding Component
- [ ] `components/creator/PaystackOnboardingForm.tsx` created
- [ ] Bank selection dropdown implemented
- [ ] Account number input with validation
- [ ] Business name input
- [ ] Real-time account validation
- [ ] Loading states implemented
- [ ] Error handling implemented
- [ ] Success confirmation displayed
- [ ] Styled and responsive

### Payment Result Page
- [ ] `app/(root)/marketplace/paymentResult/page.tsx` updated
- [ ] Reference parameter parsing
- [ ] Verification endpoint call
- [ ] Success UI implemented
- [ ] Failure UI implemented
- [ ] Pattern download link (if applicable)
- [ ] Order confirmation details
- [ ] Navigation options

### Seller Dashboard
- [ ] `app/(creator)/dashboard/page.tsx` updated
- [ ] Paystack onboarding status shown
- [ ] PaystackOnboardingForm displayed if not complete
- [ ] Earnings from Paystack transactions shown
- [ ] Payout schedule information displayed

---

## Phase 6: Payout System (Optional but Recommended)

### Payout API
- [ ] `app/api/payouts/route.ts` created
- [ ] List seller earnings endpoint
- [ ] Initiate payout endpoint
- [ ] Payout history endpoint
- [ ] Transfer recipient creation
- [ ] Transfer initiation via Paystack
- [ ] Error handling implemented
- [ ] Unit tests passing

### Payout UI
- [ ] `app/(creator)/earnings/page.tsx` created
- [ ] Available balance displayed
- [ ] Pending transactions listed
- [ ] Request payout button functional
- [ ] Payout history table
- [ ] Payout status updates
- [ ] Styled and responsive

---

## Phase 7: Reconciliation & Admin

### Reconciliation Script
- [ ] `scripts/reconcile-paystack.ts` created
- [ ] Paystack transaction list retrieval
- [ ] Firestore transaction comparison
- [ ] Mismatch detection
- [ ] Report generation
- [ ] CSV export functionality
- [ ] Script tested and working

### Admin Dashboard (Optional)
- [ ] `app/admin/reconciliation/page.tsx` created
- [ ] Run reconciliation button
- [ ] View reports interface
- [ ] Resolve discrepancies interface
- [ ] Export data functionality
- [ ] Access control implemented

---

## Phase 8: Production Preparation

### Business Verification
- [ ] Paystack business verification started
- [ ] Business documents submitted
- [ ] Bank account verified
- [ ] Verification approved by Paystack

### Production API Keys
- [ ] Production public key obtained (`pk_live_xxx`)
- [ ] Production secret key obtained (`sk_live_xxx`)
- [ ] Production keys secured
- [ ] Production keys added to hosting environment variables
- [ ] Test keys removed from production environment

### Deployment Configuration
- [ ] Hosting platform chosen (e.g., Vercel)
- [ ] Environment variables configured in hosting platform
- [ ] Build and deploy successful
- [ ] Production URL accessible
- [ ] HTTPS enabled
- [ ] Domain configured (if applicable)

### Production Webhooks
- [ ] Webhook URL configured: `https://yourdomain.com/api/webhooks/paystack`
- [ ] Production webhook secret obtained
- [ ] Production webhook secret added to environment variables
- [ ] Test webhook sent to production
- [ ] Webhook verified in production

### Security Audit
- [ ] No API keys in source code
- [ ] Environment variables secured
- [ ] Webhook signature verification enabled
- [ ] HTTPS enforced
- [ ] Rate limiting configured (optional)
- [ ] CORS policies reviewed
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention verified
- [ ] XSS prevention verified

---

## Phase 9: Testing in Production

### Seller Flow (Production)
- [ ] Real seller account created
- [ ] Real bank details provided
- [ ] Subaccount created successfully
- [ ] Subaccount visible in Paystack dashboard
- [ ] Onboarding completion confirmed

### Buyer Flow (Production)
- [ ] Test purchase with small amount
- [ ] Real card used for payment
- [ ] Payment successful
- [ ] Webhook received
- [ ] Transaction updated
- [ ] Order created
- [ ] Seller receives split payment
- [ ] Platform receives commission

### Monitoring
- [ ] Error logging configured
- [ ] Payment success rate monitoring
- [ ] Webhook delivery monitoring
- [ ] API response time monitoring
- [ ] Alerts configured for critical failures

---

## Phase 10: Documentation & Training

### User Documentation
- [ ] Seller onboarding guide created
- [ ] Buyer checkout guide created
- [ ] FAQ document created
- [ ] Troubleshooting guide updated

### Internal Documentation
- [ ] API documentation complete
- [ ] Architecture diagram created
- [ ] Runbook for support team created
- [ ] Deployment guide complete
- [ ] Rollback procedure documented

### Team Training
- [ ] Support team trained on Paystack
- [ ] Support team familiar with common issues
- [ ] Escalation procedures defined
- [ ] Testing procedures documented

---

## Phase 11: Go-Live

### Pre-Launch
- [ ] All tests passing
- [ ] Documentation complete
- [ ] Team briefed
- [ ] Support channels ready
- [ ] Rollback plan tested
- [ ] Monitoring dashboard active
- [ ] Communication to users prepared

### Launch
- [ ] Feature flag enabled (if used)
- [ ] Gradual rollout started (10% users)
- [ ] Monitoring for errors
- [ ] User feedback collected
- [ ] Issues addressed quickly

### Post-Launch Monitoring (Week 1)
- [ ] Payment success rate monitored daily
- [ ] Webhook delivery rate checked daily
- [ ] Error logs reviewed daily
- [ ] User feedback analyzed
- [ ] Critical bugs fixed
- [ ] Rollout increased to 50%
- [ ] Rollout increased to 100%

---

## Phase 12: Stripe Deprecation

### Validation Period (30 days minimum)
- [ ] All new transactions via Paystack
- [ ] Payment success rate stable
- [ ] No critical issues
- [ ] Reconciliation reports match
- [ ] All sellers onboarded to Paystack

### Final Migration
- [ ] Historical Stripe data archived
- [ ] Stripe API routes deprecated (optional keep for reference)
- [ ] Stripe dependencies removed (if desired)
- [ ] Stripe environment variables archived
- [ ] Documentation updated

---

## Success Metrics

### Technical Metrics
- [ ] Payment success rate > 95%
- [ ] Webhook delivery rate > 99%
- [ ] API response time < 2 seconds
- [ ] Zero data loss during migration
- [ ] All tests passing (100%)

### Business Metrics
- [ ] Seller onboarding time < 5 minutes
- [ ] Checkout completion time < 30 seconds
- [ ] Platform fees accurately calculated
- [ ] Payouts processed without errors
- [ ] User satisfaction maintained or improved

### User Experience
- [ ] Clear onboarding process
- [ ] Intuitive checkout
- [ ] Transparent fee structure
- [ ] Fast payment confirmation
- [ ] Reliable order fulfillment

---

## Notes & Issues

Use this section to track any issues or notes during implementation:

```
Date: ___________
Issue: ___________
Resolution: ___________

Date: ___________
Issue: ___________
Resolution: ___________

Date: ___________
Issue: ___________
Resolution: ___________
```

---

## Sign-Off

### Development Team
- [ ] Backend implementation complete
- [ ] Frontend implementation complete
- [ ] Tests passing
- [ ] Documentation complete
- Signed: _____________ Date: _______

### QA Team
- [ ] All test scenarios passed
- [ ] Edge cases covered
- [ ] Performance acceptable
- [ ] Security audit passed
- Signed: _____________ Date: _______

### Product Owner
- [ ] Features meet requirements
- [ ] User experience acceptable
- [ ] Ready for production
- [ ] Go-live approved
- Signed: _____________ Date: _______

---

**Last Updated**: October 8, 2025
**Version**: 1.0.0
**Project**: Aury Marketplace Paystack Migration
