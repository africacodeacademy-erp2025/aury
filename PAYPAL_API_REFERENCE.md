# PayPal Payouts API Reference

Quick reference for all payout-related API endpoints.

---

## 🔐 Seller Onboarding

### Save PayPal Email
**POST** `/api/onboard-seller`

**Request:**
```json
{
  "sellerId": "user123",
  "paypalEmail": "seller@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "PayPal email saved successfully! You can now receive payouts."
}
```

---

### Verify Onboarding Status
**GET** `/api/onboard-seller/verify?sellerId=user123`

**Response:**
```json
{
  "success": true,
  "onboardingComplete": true,
  "paypalEmail": "seller@example.com",
  "payoutMethod": "paypal"
}
```

---

## 💸 Process Payouts

### Send Payout to Individual Seller
**POST** `/api/payouts/process`

**Request:**
```json
{
  "sellerId": "user123",
  "amount": 150.00,
  "currency": "USD",
  "note": "Monthly earnings payout"
}
```

**Response:**
```json
{
  "success": true,
  "batchId": "PAYOUT_BATCH_123",
  "status": "SUCCESS",
  "netAmount": 147.00,
  "payoutFee": 3.00,
  "message": "Payout of USD 147.00 sent to seller@example.com"
}
```

---

### Get Seller Payout History
**GET** `/api/payouts/process?sellerId=user123`

**Response:**
```json
{
  "success": true,
  "payouts": [
    {
      "id": "payout_123",
      "sellerId": "user123",
      "paypalEmail": "seller@example.com",
      "amount": 150.00,
      "payoutFee": 3.00,
      "netAmount": 147.00,
      "currency": "USD",
      "status": "SUCCESS",
      "batchId": "PAYOUT_BATCH_123",
      "createdAt": "2025-10-16T10:30:00Z",
      "method": "paypal"
    }
  ],
  "total": 1
}
```

---

## 🔄 Bulk Payout Operations

### Trigger Payouts for All Sellers
**POST** `/api/payouts/trigger`

**Request (Dry Run):**
```json
{
  "minimumPayout": 10,
  "currency": "USD",
  "dryRun": true
}
```

**Request (Actual Payout):**
```json
{
  "minimumPayout": 10,
  "currency": "USD",
  "dryRun": false
}
```

**Response:**
```json
{
  "success": true,
  "dryRun": false,
  "summary": {
    "processed": 15,
    "skipped": 3,
    "failed": 1,
    "totalAmount": 2450.00,
    "currency": "USD"
  },
  "details": [
    {
      "sellerId": "user123",
      "paypalEmail": "seller@example.com",
      "earnings": 150.00,
      "netAmount": 147.00,
      "payoutFee": 3.00,
      "batchId": "BATCH_123",
      "status": "success"
    }
  ]
}
```

---

### Check Pending Payouts
**GET** `/api/payouts/trigger?minimumPayout=10`

**Response:**
```json
{
  "success": true,
  "totalSellers": 15,
  "totalAmount": 2500.00,
  "minimumPayout": 10,
  "sellers": [
    {
      "sellerId": "user123",
      "paypalEmail": "seller@example.com",
      "earnings": 150.00,
      "name": "John Doe"
    }
  ]
}
```

---

## 🛠️ Usage Examples

### JavaScript/TypeScript

```typescript
// Onboard a seller
async function onboardSeller(sellerId: string, paypalEmail: string) {
  const response = await fetch('/api/onboard-seller', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sellerId, paypalEmail }),
  });
  return await response.json();
}

// Process a payout
async function processSellerPayout(sellerId: string, amount: number) {
  const response = await fetch('/api/payouts/process', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sellerId,
      amount,
      currency: 'USD',
      note: 'Earnings payout',
    }),
  });
  return await response.json();
}

// Get pending payouts
async function getPendingPayouts(minimumPayout = 10) {
  const response = await fetch(
    `/api/payouts/trigger?minimumPayout=${minimumPayout}`
  );
  return await response.json();
}

// Trigger bulk payouts
async function triggerBulkPayouts(dryRun = false) {
  const response = await fetch('/api/payouts/trigger', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      minimumPayout: 10,
      currency: 'USD',
      dryRun,
    }),
  });
  return await response.json();
}
```

---

### cURL

```bash
# Onboard seller
curl -X POST http://localhost:3000/api/onboard-seller \
  -H "Content-Type: application/json" \
  -d '{"sellerId":"user123","paypalEmail":"seller@example.com"}'

# Process payout
curl -X POST http://localhost:3000/api/payouts/process \
  -H "Content-Type: application/json" \
  -d '{"sellerId":"user123","amount":150.00,"currency":"USD"}'

# Check pending
curl http://localhost:3000/api/payouts/trigger?minimumPayout=10

# Trigger bulk (dry run)
curl -X POST http://localhost:3000/api/payouts/trigger \
  -H "Content-Type: application/json" \
  -d '{"minimumPayout":10,"currency":"USD","dryRun":true}'
```

---

## 🎯 Common Workflows

### Weekly Payout Schedule

```typescript
// Run this weekly via cron job
async function weeklyPayouts() {
  // 1. Check who's eligible
  const pending = await fetch('/api/payouts/trigger?minimumPayout=25')
    .then(r => r.json());
  
  console.log(`${pending.totalSellers} sellers eligible for payout`);
  console.log(`Total amount: $${pending.totalAmount}`);
  
  // 2. Preview with dry run
  const preview = await fetch('/api/payouts/trigger', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      minimumPayout: 25,
      currency: 'USD',
      dryRun: true,
    }),
  }).then(r => r.json());
  
  console.log('Preview:', preview);
  
  // 3. Actually process if everything looks good
  const result = await fetch('/api/payouts/trigger', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      minimumPayout: 25,
      currency: 'USD',
      dryRun: false,
    }),
  }).then(r => r.json());
  
  console.log(`Processed ${result.summary.processed} payouts`);
  console.log(`Failed: ${result.summary.failed}`);
  
  return result;
}
```

---

## 📋 Error Codes

| Status Code | Meaning | Action |
|-------------|---------|--------|
| 200 | Success | Payout processed |
| 400 | Bad Request | Check request parameters |
| 404 | Not Found | Seller doesn't exist |
| 500 | Server Error | Check logs, retry |

---

## 🔔 Webhooks (Future Enhancement)

PayPal can send webhook notifications for payout status updates:

```typescript
// app/api/webhooks/paypal/route.ts
export async function POST(request: Request) {
  const event = await request.json();
  
  if (event.event_type === 'PAYMENT.PAYOUTS-ITEM.SUCCEEDED') {
    // Update payout status in database
    const payoutItemId = event.resource.payout_item_id;
    // Update Firebase...
  }
  
  return Response.json({ received: true });
}
```

---

## 🚨 Security Checklist

- [ ] Add authentication to all `/api/payouts/*` endpoints
- [ ] Validate user permissions (admin only for bulk operations)
- [ ] Rate limit payout requests
- [ ] Log all payout attempts
- [ ] Validate amounts are positive and within limits
- [ ] Sanitize PayPal emails
- [ ] Use HTTPS in production
- [ ] Store PayPal credentials securely (environment variables)

---

## 📊 Monitoring

Track these metrics:
- Total payouts processed per day/week/month
- Average payout amount
- Failed payout rate
- Time from order completion to payout
- PayPal fees as percentage of revenue

---

**Pro Tip:** Test all endpoints in sandbox mode before going live! 🧪
