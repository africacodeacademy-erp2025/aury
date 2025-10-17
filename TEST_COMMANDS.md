# Quick Test Commands for PayPal Onboarding

## PowerShell Commands

### Test Onboarding
```powershell
$body = @{
    sellerId = "test-seller-123"
    paypalEmail = "test@example.com"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3000/api/onboard-seller" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body | Select-Object -Expand Content | ConvertFrom-Json
```

### Verify Onboarding
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/onboard-seller/verify?sellerId=test-seller-123" `
    -Method GET | Select-Object -Expand Content | ConvertFrom-Json
```

## cURL Commands (Git Bash)

### Test Onboarding
```bash
curl -X POST http://localhost:3000/api/onboard-seller \
  -H "Content-Type: application/json" \
  -d '{
    "sellerId": "test-seller-123",
    "paypalEmail": "test@example.com"
  }'
```

### Verify Onboarding
```bash
curl http://localhost:3000/api/onboard-seller/verify?sellerId=test-seller-123
```

## Node.js Test Script

```bash
node test-paypal-onboarding.js
```

Or with custom values:
```bash
node test-paypal-onboarding.js YOUR_USER_ID your-email@example.com
```

## Common Issues

### "Missing PayPal email"
**Cause:** The request body isn't being sent properly

**Solutions:**
1. Make sure you're sending JSON with `Content-Type: application/json`
2. Check the request body format:
   ```json
   {
     "sellerId": "your-user-id",
     "paypalEmail": "your-email@example.com"
   }
   ```
3. Check server logs for the actual body received

### "User not found"
**Cause:** The sellerId doesn't exist in Firebase

**Solutions:**
1. Create a user first in Firebase
2. Use a valid user ID from your database
3. Check Firebase console to verify user exists

## Testing from UI

If you're testing from a React component, make sure:

```tsx
const response = await fetch("/api/onboard-seller", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    sellerId: user.id,
    paypalEmail: paypalEmail.toLowerCase().trim(),
  }),
});
```

## Debug Mode

The API now logs the received body. Check your terminal/server logs to see:
```
Received request body: { sellerId: '...', paypalEmail: '...' }
```
