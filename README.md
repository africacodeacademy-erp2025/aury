# 🚀 Aury Marketplace - Paystack Edition

A Next.js-based marketplace for craft patterns and products, powered by Paystack payments for African markets.

## 🌟 Features

- ✅ **Seller Onboarding**: Easy Paystack subaccount creation with bank validation
- ✅ **Secure Payments**: Split payments with configurable platform commission (default 5%)
- ✅ **Multi-Currency**: Support for ZAR, NGN, GHS, KES, and USD
- ✅ **Webhooks**: Real-time payment notifications and automatic order fulfillment
- 🚧 **Pattern Sales**: Digital pattern delivery (frontend in progress)
- 🚧 **Seller Dashboard**: Earnings tracking and payout requests (in progress)

## 🏗️ Tech Stack

- **Frontend**: Next.js 15, React 19, TailwindCSS
- **Backend**: Next.js API Routes, Firebase Firestore
- **Payments**: Paystack API ⭐
- **Auth**: Firebase Authentication
- **Testing**: Vitest (unit), Playwright (E2E)

## 📋 Prerequisites

- Node.js 18+
- Firebase project
- Paystack account ([sign up here](https://paystack.com))

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
copy .env.local.example .env.local
```

Update `.env.local` with your Paystack keys from [dashboard.paystack.com/#/settings/developer](https://dashboard.paystack.com/#/settings/developer)

### 3. Run Migration (if you have existing Stripe data)

```bash
npm run migrate:paystack
```

### 4. Start Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 5. Test the Integration

**Seller Onboarding**:
- Sign up as seller → Dashboard → Complete onboarding
- Test Bank: GTBank (058), Account: 0123456789

**Buyer Checkout**:
- Browse marketplace → Purchase → Use test card: `4084 0840 8408 4081`

📖 **Detailed guide**: See [docs/QUICKSTART_PAYSTACK.md](docs/QUICKSTART_PAYSTACK.md)

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [Quick Start](docs/QUICKSTART_PAYSTACK.md) | Get running in 10 minutes |
| [Migration Guide](docs/PAYSTACK_MIGRATION.md) | Complete Stripe → Paystack migration |
| [Paystack Setup](docs/PAYSTACK_SETUP.md) | Detailed Paystack configuration |
| [Implementation Status](docs/IMPLEMENTATION_STATUS.md) | Task checklist and roadmap |
| [Migration Summary](docs/MIGRATION_SUMMARY.md) | Architecture overview |

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests  
npm run test:e2e

# With UI
npm run test:ui
```

**Test Cards**: See [Paystack Test Payments](https://paystack.com/docs/payments/test-payments/)

## 🔑 Key Files

```
├── lib/paystack.ts                    # Paystack API client ⭐
├── types/transaction.ts               # Payment types ⭐
├── app/api/
│   ├── onboard-seller-paystack/      # Seller onboarding ⭐
│   ├── payments-paystack/            # Payment processing ⭐
│   ├── banks/                        # Bank list API ⭐
│   └── webhooks/paystack/            # Webhook handler ⭐
├── scripts/migrate-stripe-to-paystack.ts  # Migration script ⭐
└── docs/                             # Comprehensive documentation
```

⭐ = New/updated for Paystack

## 💰 Fee Structure

- **Platform Fee**: 5% (configurable via `PLATFORM_FEE_PERCENTAGE`)
- **Example**: R100 sale = R5 platform, R95 to seller
- **Paystack Fees**: Paid by platform (sellers get full split)

## 🌍 Supported Markets

| Country | Currency | Status |
|---------|----------|--------|
| 🇿🇦 South Africa | ZAR | ✅ |
| 🇱🇸 Lesotho | LSL/ZAR | ✅ Use ZAR |
| 🇳🇬 Nigeria | NGN | ✅ |
| 🇬🇭 Ghana | GHS | ✅ |
| 🇰🇪 Kenya | KES | ✅ |

**Note**: For Lesotho, use ZAR (pegged 1:1 with LSL)

## 📊 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run test` | Run unit tests |
| `npm run test:e2e` | Run E2E tests |
| `npm run migrate:paystack` | Migrate Stripe data |

## 🚀 Deployment

### Vercel (Recommended)

```bash
vercel
```

Then configure:
1. Environment variables in Vercel dashboard
2. Paystack webhook URL: `https://your-domain.vercel.app/api/webhooks/paystack`

See [Deployment Guide](docs/PAYSTACK_MIGRATION.md#deployment-checklist)

## 🗺️ Migration Status

### ✅ Completed
- [x] Paystack API client library
- [x] Seller onboarding API
- [x] Payment initialization & verification
- [x] Webhook handling with signature verification
- [x] Migration script
- [x] Comprehensive documentation
- [x] Test infrastructure

### 🚧 In Progress
- [ ] Frontend checkout component
- [ ] Seller onboarding UI
- [ ] Payment result page
- [ ] Dashboard updates

### 📅 Planned
- [ ] Payout system
- [ ] Reconciliation tools
- [ ] Admin dashboard
- [ ] Email notifications

See [IMPLEMENTATION_STATUS.md](docs/IMPLEMENTATION_STATUS.md) for complete task list

## 🐛 Troubleshooting

**Webhooks not received?**
- Use ngrok: `ngrok http 3000`
- Update webhook URL in Paystack dashboard
- Add webhook secret to `.env.local`

**Payment fails?**
- Ensure seller completed onboarding
- Check API keys are test mode keys
- Verify environment variables loaded

See [Troubleshooting Guide](docs/PAYSTACK_SETUP.md#common-issues--solutions)

## 📞 Support

- **Paystack Docs**: https://paystack.com/docs
- **Paystack Support**: support@paystack.com
- **Project Docs**: See `docs/` directory

## 📄 License

Proprietary. All rights reserved.

---

**Built with ❤️ for African markets**

**Status**: Backend ✅ Complete | Frontend 🚧 In Progress
**Version**: 1.0.0-beta (Paystack Edition)
**Last Updated**: October 8, 2025
