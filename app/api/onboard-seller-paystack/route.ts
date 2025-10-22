/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * POST /api/onboard-seller
 * 
 * Creates a Paystack subaccount for a seller and initiates onboarding.
 * 
 * Paystack does not have a hosted onboarding flow like Stripe Connect.
 * Instead, we need to collect bank details from the seller and create
 * a subaccount via API.
 * 
 * Flow:
 * 1. Frontend collects: business name, bank code, account number
 * 2. API validates account number
 * 3. API creates Paystack subaccount
 * 4. API stores subaccount details in Firestore
 * 5. Returns success with subaccount info
 */

import { NextResponse } from 'next/server';
import { paystack } from '@/lib/paystack';
import { firebaseDb } from '@/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

interface OnboardSellerRequest {
  sellerId: string;
  businessName?: string;
  bankCode: string;
  accountNumber: string;
  validateOnly?: boolean; // If true, only validate account without creating subaccount
  primaryContactName?: string;
  primaryContactEmail?: string;
  primaryContactPhone?: string;
}

export async function POST(request: Request) {
  try {
    const body: OnboardSellerRequest = await request.json();

    // Validate required fields
    if (!body.sellerId) {
      return NextResponse.json(
        { error: 'Missing sellerId' },
        { status: 400 }
      );
    }

    if (!body.bankCode || !body.accountNumber) {
      return NextResponse.json(
        { error: 'Missing required fields: bankCode, accountNumber' },
        { status: 400 }
      );
    }

    // If not validation-only mode, business name is required
    if (!body.validateOnly && !body.businessName) {
      return NextResponse.json(
        { error: 'Missing required field: businessName' },
        { status: 400 }
      );
    }

    // Get user document
    const userDoc = await firebaseDb.collection('users').doc(body.sellerId).get();
    
    if (!userDoc.exists) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userData = userDoc.data();

    // Step 1: Validate bank account number
    console.log('Validating account number...');
    console.log('Bank code:', body.bankCode);
    console.log('Account number:', body.accountNumber);
    
    let accountName: string;
    
    try {
      const validation = await paystack.misc.validateAccount(
        body.accountNumber,
        body.bankCode
      );
      accountName = validation.account_name;
      console.log(`✅ Account validated: ${accountName}`);
    } catch (error: any) {
      console.error('Account validation failed:', error.message);
      
      // In test mode, if validation fails due to currency issue, generate a test account name
      if (error.message?.includes('valid currencies') && process.env.PAYSTACK_SECRET_KEY?.startsWith('sk_test_')) {
        console.log('⚠️ Test mode: Generating mock account name for non-NGN bank');
        accountName = `Test Account - ${body.businessName || 'User'}`;
        console.log(`✅ Mock account validated: ${accountName}`);
      } else {
        return NextResponse.json(
          {
            error: 'Failed to validate bank account',
            details: error.message,
            hint: 'For testing, use Nigerian banks or ensure you have valid test credentials',
          },
          { status: 400 }
        );
      }
    }

    // If validation-only mode, return account name without creating subaccount
    if (body.validateOnly) {
      return NextResponse.json({
        success: true,
        accountName: accountName,
        validated: true,
      });
    }

    // Check if seller already has a Paystack subaccount (only for full onboarding)
    if (userData?.paystackSubaccountCode) {
      return NextResponse.json(
        {
          error: 'Seller already has a Paystack subaccount',
          subaccountCode: userData.paystackSubaccountCode,
          alreadyOnboarded: true,
        },
        { status: 400 }
      );
    }

    // Step 2: Get platform fee percentage from env or default to 5%
    const platformFeePercentage = parseInt(
      process.env.PLATFORM_FEE_PERCENTAGE || '5'
    );
    const sellerPercentage = 100 - platformFeePercentage;

    // Step 3: Create Paystack subaccount
    console.log('Creating Paystack subaccount...');
    let subaccount;
    
    try {
      subaccount = await paystack.subaccounts.create({
        business_name: body.businessName!, // businessName is validated above for non-validation mode
        settlement_bank: body.bankCode,
        account_number: body.accountNumber,
        percentage_charge: sellerPercentage,
        description: `Subaccount for seller: ${userData?.email || body.sellerId}`,
        primary_contact_email: body.primaryContactEmail || userData?.email,
        primary_contact_name: body.primaryContactName || userData?.name,
        primary_contact_phone: body.primaryContactPhone,
        metadata: {
          sellerId: body.sellerId,
          sellerEmail: userData?.email,
          sellerName: userData?.name,
          accountName: accountName,
        },
      });
      
      console.log(`✅ Subaccount created: ${subaccount.subaccount_code}`);
    } catch (error: any) {
      console.error('Subaccount creation failed:', error);
      return NextResponse.json(
        {
          error: 'Failed to create Paystack subaccount',
          details: error.message,
        },
        { status: 500 }
      );
    }

    // Step 4: Store subaccount details in Firestore
    try {
      await firebaseDb.collection('users').doc(body.sellerId).update({
        paystackSubaccountId: subaccount.id,
        paystackSubaccountCode: subaccount.subaccount_code,
        paystackOnboardingComplete: true,
        paystackAccountMeta: {
          businessName: body.businessName,
          bankName: subaccount.settlement_bank,
          bankCode: body.bankCode,
          accountNumber: body.accountNumber.slice(-4), // Store only last 4 digits
          accountName: accountName,
          currency: subaccount.currency || 'ZAR',
        },
        paymentProvider: 'paystack',
        updatedAt: FieldValue.serverTimestamp(),
      });
      
      console.log(`✅ User document updated`);
    } catch (error: any) {
      console.error('Firestore update failed:', error);
      
      // Subaccount was created but we failed to save to Firestore
      // Log this for manual reconciliation
      console.error('⚠️ CRITICAL: Subaccount created but Firestore update failed');
      console.error(`   Seller ID: ${body.sellerId}`);
      console.error(`   Subaccount Code: ${subaccount.subaccount_code}`);
      
      return NextResponse.json(
        {
          error: 'Failed to save subaccount details',
          subaccountCode: subaccount.subaccount_code,
          requiresManualReconciliation: true,
        },
        { status: 500 }
      );
    }

    // Step 5: Return success
    return NextResponse.json({
      success: true,
      message: 'Seller onboarding completed successfully',
      subaccountCode: subaccount.subaccount_code,
      subaccountId: subaccount.id,
      accountName: accountName,
      businessName: body.businessName,
      sellerPercentage: sellerPercentage,
      platformFeePercentage: platformFeePercentage,
    });

  } catch (error: any) {
    console.error('Error in onboard-seller:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/onboard-seller?sellerId=xxx
 * 
 * Get seller onboarding status
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const sellerId = url.searchParams.get('sellerId');

    if (!sellerId) {
      return NextResponse.json(
        { error: 'Missing sellerId' },
        { status: 400 }
      );
    }

    const userDoc = await firebaseDb.collection('users').doc(sellerId).get();
    
    if (!userDoc.exists) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userData = userDoc.data();

    return NextResponse.json({
      success: true,
      onboarded: !!userData?.paystackSubaccountCode,
      onboardingComplete: userData?.paystackOnboardingComplete || false,
      subaccountCode: userData?.paystackSubaccountCode || null,
      accountMeta: userData?.paystackAccountMeta || null,
    });

  } catch (error: any) {
    console.error('Error getting onboarding status:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
