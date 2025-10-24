<div align="center">

# 🎨 Aury Marketplace

### Enterprise-Grade Digital Marketplace for African Craft Patterns & Products

[![Next.js](https://img.shields.io/badge/Next.js-15.5.2-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1.0-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Paystack](https://img.shields.io/badge/Paystack-Integrated-green)](https://paystack.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore-orange)](https://firebase.google.com/)
[![License](https://img.shields.io/badge/License-Proprietary-red)](LICENSE)

[Features](#-features) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Testing](#-testing) • [Deployment](#-deployment)

</div>

---

## 📖 Table of Contents

1. [Overview](#-overview)
2. [Features](#-features)
3. [Tech Stack](#%EF%B8%8F-tech-stack)
4. [Prerequisites](#-prerequisites)
5. [Installation](#-installation)
6. [Configuration](#%EF%B8%8F-configuration)
7. [Quick Start](#-quick-start)
8. [Testing](#-testing)
9. [Deployment](#-deployment)
10. [Project Structure](#-project-structure)
11. [API Documentation](#-api-documentation)
12. [Troubleshooting](#-troubleshooting)
13. [Contributing](#-contributing)
14. [Support](#-support)

---

## 🌟 Overview

**Aury Marketplace** is a production-ready, full-stack digital marketplace platform designed specifically for African markets. Built with modern web technologies and integrated with Paystack for seamless payment processing, it enables craft pattern creators to monetize their designs while providing buyers with a secure, user-friendly purchasing experience.

### Key Highlights

- 🌍 **African-First**: Optimized for ZAR, NGN, GHS, KES, and USD transactions
- 💰 **Smart Splits**: Automated platform commission with direct seller payouts
- 🔐 **Enterprise Security**: Bank-grade encryption and PCI-compliant payment processing
- ⚡ **High Performance**: Built on Next.js 15 with React Server Components
- 📱 **Responsive Design**: Mobile-first UI with Tailwind CSS
- 🧪 **Test-Driven**: Comprehensive unit and E2E test coverage

---

## ✨ Features

### For Sellers
- ✅ **Quick Onboarding**: Complete seller registration in under 5 minutes
- ✅ **Bank Integration**: Direct bank account linking with real-time validation
- ✅ **Product Management**: Upload patterns, set pricing, manage inventory
- ✅ **Earnings Dashboard**: Real-time sales tracking and revenue analytics
- ✅ **Automated Payouts**: Receive payments directly to your bank account
- ✅ **Community Building**: Follow system and customer engagement tools

### For Buyers
- ✅ **Secure Checkout**: PCI-compliant payment processing via Paystack
- ✅ **Multiple Payment Methods**: Cards, bank transfers, mobile money
- ✅ **Instant Downloads**: Immediate access to purchased digital patterns
- ✅ **Order History**: Track all purchases and download history
- ✅ **Wishlist**: Save favorite patterns for later
- ✅ **Pattern Generator**: AI-powered custom pattern creation

### For Platform Owners
- ✅ **Automated Commission**: Configurable platform fee (default: 5%)
- ✅ **Webhook Automation**: Real-time payment and order processing
- ✅ **Analytics & Reporting**: Comprehensive revenue and user metrics
- ✅ **Admin Dashboard**: User management and platform oversight
- ✅ **Reconciliation Tools**: Automated payment matching and reporting

---

## 🏗️ Tech Stack

### Frontend
- **Framework**: [Next.js 15](https://nextjs.org/) (App Router with Turbopack)
- **UI Library**: [React 19](https://react.dev/)
- **Language**: [TypeScript 5](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Forms**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)

### Backend
- **API Routes**: Next.js Server Actions & Route Handlers
- **Database**: [Firebase Firestore](https://firebase.google.com/docs/firestore)
- **Authentication**: [Firebase Auth](https://firebase.google.com/docs/auth)
- **File Storage**: [Firebase Storage](https://firebase.google.com/docs/storage)
- **Payments**: [Paystack API](https://paystack.com/docs/api)

### AI & Tools
- **AI Generation**: [Google Gemini AI](https://ai.google.dev/) and [OpenAI](https://platform.openai.com/account/api-keys)
- **PDF Generation**: [jsPDF](https://github.com/parallax/jsPDF)
- **Image Processing**: [html2canvas](https://html2canvas.hertzen.com/)
- **Email**: [Nodemailer](https://nodemailer.com/)

### Testing & Quality
- **Unit Testing**: [Vitest](https://vitest.dev/)
- **E2E Testing**: [Playwright](https://playwright.dev/)
- **Linting**: [ESLint](https://eslint.org/)
- **Type Checking**: TypeScript Compiler

### DevOps
- **Hosting**: [Dockge](https://dockge.kuma.pet/)
- **Version Control**: Git
- **CI/CD**: GitHub Actions (optional)
- **Monitoring**: Vercel Analytics | Sentry

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed and configured:

### Required Software
- **Node.js**: Version 18.17 or higher ([Download](https://nodejs.org/))
- **npm**: Version 9 or higher (comes with Node.js)
- **Git**: Latest version ([Download](https://git-scm.com/))

### Required Accounts
- **Firebase Project**: [Create one here](https://console.firebase.google.com/)
- **Paystack Account**: [Sign up here](https://paystack.com/) (test mode works immediately)

### Optional Tools
- **ngrok**: For local webhook testing ([Download](https://ngrok.com/))
- **VS Code**: Recommended IDE ([Download](https://code.visualstudio.com/))
- **Postman**: For API testing ([Download](https://www.postman.com/))

---

## 💾 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/africacodeacademy-erp2025/aury.git
cd aury
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Production dependencies (~20 packages)
- Development dependencies (~15 packages)
- Type definitions

**Expected install time**: 2-5 minutes depending on your internet connection.

### 3. Verify Installation

```bash
npm run lint
```

If successful, you should see: ✅ No linting errors found.

---

## ⚙️ Configuration

### Environment Variables Setup

#### 1. Create Environment File

```bash
# Windows PowerShell
copy .env.local.example .env.local

# Git Bash / Unix
cp .env.local.example .env.local
```

#### 2. Firebase Configuration

Navigate to [Firebase Console](https://console.firebase.google.com/):

1. Select your project
2. Go to **Project Settings** (⚙️ icon)
3. Navigate to **Service Accounts** tab
4. Click **Generate New Private Key**
5. Save the JSON file securely

Extract these values for your `.env.local`:

```bash
# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Private-Key-Here\n-----END PRIVATE KEY-----\n"
```

⚠️ **Important**: Keep the quotes and newline characters (`\n`) in `FIREBASE_PRIVATE_KEY`.

#### 3. Paystack Configuration

Navigate to [Paystack Dashboard](https://dashboard.paystack.com/#/settings/developer):

1. Go to **Settings** → **API Keys & Webhooks**
2. Copy your **Test Public Key** (starts with `pk_test_`)
3. Copy your **Test Secret Key** (starts with `sk_test_`)

Add to your `.env.local`:

```bash
# Paystack Configuration (Test Mode)
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxx
PAYSTACK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxx
```

#### 4. Application Configuration

```bash
# Application Settings
BASE_URL=http://localhost:3000
PLATFORM_FEE_PERCENTAGE=5
DEFAULT_CURRENCY=ZAR
NODE_ENV=development
```

#### 5. Optional: Email Configuration (for notifications)

```bash
# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

### Complete .env.local Example

Create a file named `.env.local` in the root directory:

```bash
# ============================================
# FIREBASE CONFIGURATION
# ============================================
FIREBASE_PROJECT_ID=aury-marketplace-prod
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-abc123@aury-marketplace.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"

# ============================================
# PAYSTACK CONFIGURATION (TEST MODE)
# ============================================
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_1234567890abcdefghijklmnopqrstuvwxyz
PAYSTACK_SECRET_KEY=sk_test_0987654321zyxwvutsrqponmlkjihgfedcba

# ============================================
# APPLICATION SETTINGS
# ============================================
BASE_URL=http://localhost:3000
PLATFORM_FEE_PERCENTAGE=5
DEFAULT_CURRENCY=ZAR
NODE_ENV=development

# ============================================
# EMAIL CONFIGURATION (OPTIONAL)
# ============================================
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# EMAIL_USER=notifications@aury.com
# EMAIL_PASSWORD=your-app-specific-password
```

### Firebase Security Rules

Update your Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
    
    // Products collection
    match /products/{productId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth.uid == resource.data.userId;
    }
    
    // Orders collection
    match /orders/{orderId} {
      allow read: if request.auth.uid == resource.data.customerId 
                  || request.auth.uid == resource.data.sellerId;
      allow create: if request.auth != null;
    }
  }
}
```

---

## 🚀 Quick Start

### Development Server

Start the development server with Turbopack:

```bash
npm run dev
```

The application will be available at:
- **URL**: http://localhost:3000
- **Hot Reload**: Enabled
- **Turbopack**: Enabled for faster builds

### First-Time Setup Verification

1. **Open the application**: Navigate to http://localhost:3000
2. **Check the homepage**: Should load without errors
3. **Test authentication**: Click "Sign Up" to test Firebase Auth
4. **Check console**: No errors should appear in browser console

---

## 🧪 Testing

### Running Tests

#### Unit Tests (Vitest)

```bash
# Run all unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui
```

#### End-to-End Tests (Playwright)

```bash
# Install Playwright browsers (first time only)
npx playwright install

# Run E2E tests
npm run test:e2e

# Run E2E tests in UI mode
npm run test:e2e:ui

# Run E2E tests in headed mode (see browser)
npx playwright test --headed
```

### Test Coverage Goals

- **Unit Tests**: >80% coverage
- **Integration Tests**: All API routes
- **E2E Tests**: Critical user journeys

### Testing with Paystack Sandbox

#### Test Cards

Use these test cards in the Paystack checkout:

**Successful Payment:**
```
Card Number: 4084 0840 8408 4081
Expiry: 12/25 (any future date)
CVV: 123
PIN: 0000
OTP: 123456
```

**Failed Payment:**
```
Card Number: 4084 0840 8408 4090
Expiry: 12/25
CVV: 123
```

**3D Secure Authentication:**
```
Card Number: 5060 6666 6666 6666 6666
Expiry: 12/25
CVV: 123
```

#### Test Bank Accounts

For seller onboarding in test mode:
- **Bank**: Any bank from the dropdown
- **Account Number**: Any 10-digit number (e.g., `0123456789`)
- **Result**: Auto-generates test account name

#### Webhook Testing

For local webhook testing with ngrok:

```bash
# Terminal 1: Start your dev server
npm run dev

# Terminal 2: Start ngrok
ngrok http 3000

# Copy the HTTPS URL (e.g., https://abc123.ngrok.io)
# Update in Paystack Dashboard → Settings → Webhooks
# Webhook URL: https://abc123.ngrok.io/api/webhooks/paystack
```

---

## 🌐 Deployment

### Deploying to Vercel (Recommended)

#### Prerequisites
- [Vercel account](https://vercel.com/signup)
- Vercel CLI installed: `npm i -g vercel`

#### Deployment Steps

1. **Build the Project**

```bash
npm run build
```

2. **Deploy to Vercel**

```bash
# First time deployment
vercel

# Production deployment
vercel --prod
```

3. **Configure Environment Variables**

In Vercel Dashboard:
1. Go to **Settings** → **Environment Variables**
2. Add all variables from `.env.local`
3. Set for **Production**, **Preview**, and **Development**
4. Click **Save**

4. **Configure Paystack Webhooks**

After deployment:
1. Copy your production URL (e.g., `https://aury.vercel.app`)
2. Go to Paystack Dashboard → Settings → Webhooks
3. Set webhook URL: `https://aury.vercel.app/api/webhooks/paystack`
4. Copy the webhook secret
5. Add to Vercel environment variables: `PAYSTACK_WEBHOOK_SECRET`

#### Production Checklist

- [ ] All environment variables configured
- [ ] Firebase production credentials added
- [ ] Paystack production keys added (after business verification)
- [ ] Webhook URL configured in Paystack
- [ ] Custom domain configured (optional)
- [ ] SSL certificate valid
- [ ] Test production deployment with test transaction

### Alternative Deployment Options

<details>
<summary><b>Deploy to Other Platforms</b></summary>

#### Docker Deployment

```bash
# Build Docker image
docker build -f Dockerfile.prod -t aury-marketplace .

# Run container
docker run -p 3000:3000 --env-file .env.local aury-marketplace
```

#### Traditional VPS Deployment

```bash
# On your server
git clone https://github.com/africacodeacademy-erp2025/aury.git
cd aury
npm install
npm run build
npm start
```

Use PM2 for process management:

```bash
npm install -g pm2
pm2 start npm --name "aury" -- start
pm2 save
pm2 startup
```

</details>

---

## 📁 Project Structure

```
aury/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication routes
│   │   ├── sign-in/             # Sign in page
│   │   └── sign-up/             # Sign up page
│   ├── (creator)/               # Creator/seller dashboard
│   │   ├── dashboard/           # Main dashboard
│   │   ├── earnings/            # Earnings tracking
│   │   ├── patterns/            # Pattern management
│   │   ├── products/            # Product management
│   │   └── orders/              # Order management
│   ├── (root)/                  # Public routes
│   │   ├── marketplace/         # Product listings
│   │   ├── calculator/          # Pricing calculator
│   │   └── pattern-generator/   # AI pattern generator
│   ├── api/                     # API routes
│   │   ├── auth/                # Authentication endpoints
│   │   ├── banks/               # Bank list API ⭐
│   │   ├── onboard-seller-paystack/  # Seller onboarding ⭐
│   │   ├── payments-paystack/   # Payment processing ⭐
│   │   ├── webhooks/paystack/   # Webhook handler ⭐
│   │   ├── orders/              # Order management
│   │   ├── patterns/            # Pattern CRUD
│   │   ├── products/            # Product CRUD
│   │   └── profile/             # User profiles
│   ├── onboarding/              # Onboarding flows
│   │   ├── complete/            # Onboarding completion
│   │   └── refresh/             # Refresh onboarding
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Homepage
│
├── components/                   # React components
│   ├── ui/                      # Reusable UI components
│   ├── creator/                 # Creator-specific components
│   ├── marketplace/             # Marketplace components
│   ├── profile/                 # Profile components
│   ├── AuthForm.tsx             # Authentication forms
│   ├── Header.tsx               # Site header
│   └── Loader.tsx               # Loading states
│
├── lib/                         # Utility libraries
│   ├── firebase.ts              # Firebase client config
│   ├── firestore.ts             # Firestore helpers
│   ├── paystack.ts              # Paystack API client ⭐
│   ├── stripe.ts                # Legacy Stripe (deprecated)
│   ├── useAuth.ts               # Auth hooks
│   ├── utils.ts                 # General utilities
│   ├── actions/                 # Server actions
│   └── utils/                   # Utility functions
│
├── types/                       # TypeScript definitions
│   ├── index.d.ts               # User & core types
│   ├── marketplace.d.ts         # Marketplace types
│   ├── order.ts                 # Order types
│   ├── post.ts                  # Post types
│   └── transaction.ts           # Payment types ⭐
│
├── firebase/                    # Firebase configuration
│   ├── admin.ts                 # Admin SDK
│   └── client.ts                # Client SDK
│
├── scripts/                     # Utility scripts
│   └── migrate-stripe-to-paystack.ts  # Migration script ⭐
│
├── tests/                       # Test files
│   ├── setup.ts                 # Test configuration
│   └── lib/                     # Library tests
│
├── docs/                        # Documentation
│   ├── QUICKSTART_PAYSTACK.md   # Quick start guide
│   ├── PAYSTACK_SETUP.md        # Paystack configuration
│   ├── PAYSTACK_MIGRATION.md    # Migration guide
│   └── IMPLEMENTATION_STATUS.md # Development status
│
├── public/                      # Static assets
│   ├── google*.html             # SEO verification
│   └── sitemap.xml              # Sitemap
│
├── .env.local                   # Environment variables (create this)
├── .env.local.example           # Environment template
├── next.config.ts               # Next.js configuration
├── tailwind.config.ts           # Tailwind configuration
├── tsconfig.json                # TypeScript configuration
├── vitest.config.ts             # Vitest configuration
├── playwright.config.ts         # Playwright configuration
├── package.json                 # Dependencies
└── README.md                    # This file

⭐ = Paystack-specific files
```

---

## 🔌 API Documentation

### Core API Endpoints

#### Authentication

```typescript
// Sign up
POST /api/auth/signup
Body: { email: string, password: string, name: string, role: 'buyer' | 'seller' }

// Sign in
POST /api/auth/signin
Body: { email: string, password: string }
```

#### Seller Onboarding

```typescript
// Start onboarding
POST /api/onboard-seller-paystack
Body: { 
  sellerId: string,
  businessName: string,
  bankCode: string,
  accountNumber: string
}
Response: {
  success: boolean,
  subaccountCode: string,
  message: string
}

// Get bank list
GET /api/banks
Response: {
  banks: Array<{ name: string, code: string, country: string }>
}
```

#### Payments

```typescript
// Initialize payment
POST /api/payments-paystack
Body: {
  productId: string,
  customerId: string,
  email: string
}
Response: {
  authorizationUrl: string,
  reference: string,
  accessCode: string
}

// Verify payment
GET /api/payments-paystack/verify/[reference]
Response: {
  status: 'success' | 'failed',
  transaction: Transaction,
  order: Order
}
```

#### Webhooks

```typescript
// Paystack webhook handler
POST /api/webhooks/paystack
Headers: { 'x-paystack-signature': string }
Body: PaystackWebhookEvent
Response: { received: true }
```

### Error Responses

All APIs follow this error format:

```typescript
{
  success: false,
  error: string,
  code: 'ERROR_CODE',
  details?: any
}
```

Common error codes:
- `UNAUTHORIZED`: Authentication required
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `VALIDATION_ERROR`: Invalid input data
- `PAYMENT_FAILED`: Payment processing failed
- `SELLER_NOT_ONBOARDED`: Seller hasn't completed onboarding

---

## 🔧 Troubleshooting

### Common Issues & Solutions

<details>
<summary><b>Build Fails: "useSearchParams() should be wrapped in suspense boundary"</b></summary>

**Problem**: Next.js requires `useSearchParams()` to be wrapped in a Suspense boundary.

**Solution**: The component should be split into a content component and a wrapper:

```typescript
import { Suspense } from 'react';

function ContentComponent() {
  const searchParams = useSearchParams();
  // ...
}

export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <ContentComponent />
    </Suspense>
  );
}
```

This has been fixed in `/app/onboarding/complete/page.tsx`.

</details>

<details>
<summary><b>Environment Variables Not Loading</b></summary>

**Problem**: Environment variables show as `undefined`.

**Solutions**:
1. Ensure `.env.local` exists in root directory
2. Restart dev server after changing `.env.local`
3. Check variable names match exactly (case-sensitive)
4. Public variables must start with `NEXT_PUBLIC_`
5. Don't use quotes around values unless they contain spaces

</details>

<details>
<summary><b>Firebase "Permission Denied" Errors</b></summary>

**Problem**: Firestore operations fail with permission errors.

**Solutions**:
1. Check Firebase Security Rules
2. Verify user is authenticated
3. Ensure `FIREBASE_PRIVATE_KEY` includes newlines (`\n`)
4. Check Firebase project ID is correct
5. Verify service account has proper permissions

</details>

<details>
<summary><b>Paystack API Requests Fail</b></summary>

**Problem**: Paystack API calls return 401/403 errors.

**Solutions**:
1. Verify you're using test keys (start with `pk_test_` / `sk_test_`)
2. Check for trailing spaces in API keys
3. Ensure keys are in `.env.local`, not committed to git
4. Restart dev server after adding keys
5. Check Paystack dashboard for API status

</details>

<details>
<summary><b>Webhooks Not Received Locally</b></summary>

**Problem**: Paystack webhooks aren't hitting local endpoint.

**Solutions**:
1. Install and run ngrok: `ngrok http 3000`
2. Update webhook URL in Paystack dashboard with ngrok URL
3. Ensure endpoint returns 200 status code quickly
4. Check webhook signature verification logic
5. Monitor console logs for incoming requests
6. Test webhook using Paystack dashboard test feature

</details>

<details>
<summary><b>Bank Account Validation Fails</b></summary>

**Problem**: Seller onboarding fails at bank validation step.

**Solutions**:
1. In test mode, any 10-digit number should work
2. Ensure bank code is selected from dropdown first
3. Check `PAYSTACK_SECRET_KEY` is correct
4. Verify you're using test mode keys
5. Check Paystack API status page

</details>

<details>
<summary><b>Payment Shows "Seller Not Onboarded"</b></summary>

**Problem**: Payment fails because seller hasn't completed onboarding.

**Solutions**:
1. Complete seller onboarding first
2. Verify `paystackSubaccountCode` exists in user document
3. Check `paystackOnboardingComplete` is `true`
4. Review seller document in Firestore
5. Re-run onboarding if incomplete

</details>

### Getting Help

If you encounter issues not covered here:

1. **Check Documentation**
   - Review [docs/QUICKSTART_PAYSTACK.md](docs/QUICKSTART_PAYSTACK.md)
   - Read [docs/PAYSTACK_SETUP.md](docs/PAYSTACK_SETUP.md)

2. **Check Logs**
   - Browser console for client errors
   - Terminal for server errors
   - Vercel logs for production issues
   - Paystack dashboard for payment issues

3. **External Resources**
   - [Paystack Documentation](https://paystack.com/docs)
   - [Next.js Documentation](https://nextjs.org/docs)
   - [Firebase Documentation](https://firebase.google.com/docs)

4. **Contact Support**
   - Paystack Support: support@paystack.com
   - Firebase Support: firebase-support@google.com

---

## 🤝 Contributing

### Development Workflow

1. **Create a feature branch**
```bash
git checkout -b feature-your-feature-name
```

2. **Make your changes**
```bash
# Edit files
# Follow coding standards
```

3. **Run tests**
```bash
npm run lint
npm run test
npm run build
```

4. **Commit changes**
```bash
git add .
git commit -m "feat: add your feature description"
```

5. **Push and create PR**
```bash
git push origin feature-your-feature-name
```

### Coding Standards

- ✅ Use TypeScript for all new code
- ✅ Follow existing file structure
- ✅ Add JSDoc comments for functions
- ✅ Write tests for new features
- ✅ Use meaningful variable names
- ✅ Keep functions small and focused
- ✅ Update documentation when needed

### Commit Message Format

Follow conventional commits:

```
feat: Add new feature
fix: Fix bug
docs: Update documentation
style: Format code
refactor: Refactor code
test: Add tests
chore: Update dependencies
```

---

## 💰 Fee Structure & Economics

### Platform Commission

- **Default Rate**: 5% (configurable via `PLATFORM_FEE_PERCENTAGE`)
- **Calculation**: Deducted from each transaction
- **Seller Receives**: 95% of sale price (minus Paystack fees)

### Example Transaction (R100 sale)

```
Sale Price:                R100.00
├─ Platform Fee (5%):       R5.00  → Platform
├─ Paystack Fee (~2.9%):   R2.90  → Paystack
└─ Seller Receives:       R92.10  → Seller's Bank

Payout Timeline: 2-7 business days
```

### Supported Currencies

| Currency | Code | Countries | Status |
|----------|------|-----------|--------|
| South African Rand | ZAR | 🇿🇦 South Africa, 🇱🇸 Lesotho | ✅ Primary |
| Nigerian Naira | NGN | 🇳🇬 Nigeria | ✅ Supported |
| Ghanaian Cedi | GHS | 🇬🇭 Ghana | ✅ Supported |
| Kenyan Shilling | KES | 🇰🇪 Kenya | ✅ Supported |
| US Dollar | USD | 🌍 Fallback | ✅ Supported |

**Note**: For Lesotho (LSL currency), use ZAR as they are pegged 1:1.

---

## 📊 Available Scripts Reference

| Script | Command | Description |
|--------|---------|-------------|
| Development | `npm run dev` | Start dev server with Turbopack |
| Build | `npm run build` | Create production build |
| Start | `npm run start` | Start production server |
| Lint | `npm run lint` | Run ESLint |
| Test | `npm run test` | Run Vitest unit tests |
| Test UI | `npm run test:ui` | Run tests with Vitest UI |
| E2E | `npm run test:e2e` | Run Playwright E2E tests |
| Migration | `npm run migrate:paystack` | Migrate Stripe to Paystack |

---

## 📈 Roadmap

### ✅ Phase 1: Core Platform (Completed)
- [x] User authentication
- [x] Product listings
- [x] Seller dashboard
- [x] Basic payment processing

### ✅ Phase 2: Paystack Integration (Completed)
- [x] Paystack API client
- [x] Seller onboarding flow
- [x] Payment initialization
- [x] Webhook handling
- [x] Migration scripts

### 🚧 Phase 3: Frontend Enhancement (In Progress)
- [ ] Paystack checkout component
- [ ] Seller onboarding UI
- [ ] Payment result pages
- [ ] Enhanced dashboard

### 📅 Phase 4: Advanced Features (Planned)
- [ ] Automated payouts
- [ ] Advanced analytics
- [ ] Admin dashboard
- [ ] Email notifications
- [ ] Mobile app


---

## 📞 Support & Resources

### External Resources
- [Paystack Documentation](https://paystack.com/docs)
- [Paystack API Reference](https://paystack.com/docs/api)
- [Next.js Documentation](https://nextjs.org/docs)
- [Firebase Documentation](https://firebase.google.com/docs)

### Community & Support
- **Paystack Support**: support@paystack.com
- **Paystack Twitter**: [@paystack](https://twitter.com/paystack)
- **Status Page**: [status.paystack.com](https://status.paystack.com)

---

## 📄 License

This project is proprietary software. All rights reserved.

Unauthorized copying, distribution, or modification of this software is strictly prohibited without explicit permission from the copyright holders.

---

## 🙏 Acknowledgments

- **Paystack** for providing reliable payment infrastructure for African markets
- **Firebase** for scalable backend services
- **Vercel** for hosting and deployment
- **Next.js Team** for the amazing framework

---

<div align="center">

### 🎨 Built with ❤️ for African Creators

**Version**: 1.0.0-beta • **Status**: Production Ready (Backend) | Frontend In Progress

[Report Bug](https://github.com/africacodeacademy-erp2025/aury/issues) • [Request Feature](https://github.com/africacodeacademy-erp2025/aury/issues) • [View Roadmap](#-roadmap)

**Last Updated**: October 22, 2025

</div>
