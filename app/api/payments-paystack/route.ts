/**
 * POST /api/payments-paystack
 * 
 * Initialize a Paystack transaction with split payment configuration.
 * Platform takes a configurable commission, remainder goes to seller.
 */

import { NextResponse } from 'next/server';
import { paystack, generateReference, toKobo, calculatePlatformFee } from '@/lib/paystack';
import { firebaseDb } from '@/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

interface PaymentRequest {
  productId: string;
  buyerId?: string;
  buyerEmail?: string;
}

export async function POST(request: Request) {
  try {
    const body: PaymentRequest = await request.json();

    if (!body.productId) {
      return NextResponse.json(
        { error: 'Missing productId' },
        { status: 400 }
      );
    }

    // Get product details
    const productDoc = await firebaseDb
      .collection('products')
      .doc(body.productId)
      .get();

    if (!productDoc.exists) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    const product = productDoc.data();
    if (!product) {
      return NextResponse.json(
        { error: 'Product data is invalid' },
        { status: 404 }
      );
    }

    // Get seller details
    const sellerDoc = await firebaseDb
      .collection('users')
      .doc(product.sellerId)
      .get();

    if (!sellerDoc.exists) {
      return NextResponse.json(
        { error: 'Seller not found' },
        { status: 404 }
      );
    }

    const seller = sellerDoc.data();

    // Verify seller has completed Paystack onboarding
    if (!seller?.paystackSubaccountCode) {
      return NextResponse.json(
        {
          error: 'Seller has not completed Paystack onboarding',
          sellerNotOnboarded: true,
        },
        { status: 422 }
      );
    }

    if (!seller?.paystackOnboardingComplete) {
      return NextResponse.json(
        {
          error: 'Seller onboarding is incomplete',
          sellerNotOnboarded: true,
        },
        { status: 422 }
      );
    }

    // Get buyer email
    let buyerEmail = body.buyerEmail;
    
    if (body.buyerId) {
      const buyerDoc = await firebaseDb
        .collection('users')
        .doc(body.buyerId)
        .get();
      
      if (buyerDoc.exists) {
        buyerEmail = buyerDoc.data()?.email || buyerEmail;
      }
    }

    if (!buyerEmail) {
      return NextResponse.json(
        { error: 'Buyer email is required' },
        { status: 400 }
      );
    }

    // Calculate amounts
    const currency = process.env.DEFAULT_CURRENCY || 'ZAR';
    const amountKobo = toKobo(product.price);
    const platformFeePercentage = parseInt(
      process.env.PLATFORM_FEE_PERCENTAGE || '5'
    );
    
    const { platformFee, sellerAmount } = calculatePlatformFee(
      amountKobo,
      platformFeePercentage
    );

    // Generate unique reference
    const reference = generateReference('AURY');

    // Create transaction record in Firestore first
    const transactionData = {
      reference: reference,
      paystackReference: reference,
      
      buyerId: body.buyerId || 'guest',
      buyerEmail: buyerEmail,
      sellerId: product.sellerId,
      sellerName: seller.name || 'Unknown',
      
      productId: body.productId,
      productName: product.name,
      productType: product.productType || 'physical',
      
      amountKobo: amountKobo,
      platformFeeKobo: platformFee,
      sellerGrossKobo: sellerAmount,
      
      currency: currency,
      
      status: 'pending',
      paymentStatus: 'pending',
      
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      
      metadata: {
        productPrice: product.price,
        platformFeePercentage: platformFeePercentage,
      },
    };

    const transactionRef = await firebaseDb
      .collection('transactions')
      .add(transactionData);

    console.log(`✅ Transaction created: ${transactionRef.id}`);

    // Initialize Paystack transaction
    const baseUrl = process.env.BASE_URL || request.headers.get('origin');
    const callbackUrl = `${baseUrl}/marketplace/paymentResult?reference=${reference}`;

    let paystackResponse;
    
    try {
      paystackResponse = await paystack.transactions.initialize({
        email: buyerEmail,
        amount: amountKobo,
        currency: currency,
        reference: reference,
        callback_url: callbackUrl,
        
        // Split payment configuration
        subaccount: seller.paystackSubaccountCode,
        transaction_charge: platformFee,
        bearer: 'account', // Platform bears Paystack fees
        
        metadata: {
          transactionId: transactionRef.id,
          productId: body.productId,
          productName: product.name,
          sellerId: product.sellerId,
          sellerName: seller.name,
          buyerId: body.buyerId || 'guest',
          platformFee: platformFee,
          sellerAmount: sellerAmount,
        },
        
        channels: ['card', 'bank', 'ussd', 'qr', 'mobile_money'],
      });

      console.log(`✅ Paystack transaction initialized: ${reference}`);
    } catch (error: any) {
      console.error('Paystack initialization failed:', error);
      
      // Update transaction status to failed
      await transactionRef.update({
        status: 'failed',
        message: error.message,
        updatedAt: FieldValue.serverTimestamp(),
      });

      return NextResponse.json(
        {
          error: 'Failed to initialize payment',
          details: error.message,
        },
        { status: 500 }
      );
    }

    // Update transaction with Paystack details
    await transactionRef.update({
      paystackAccessCode: paystackResponse.access_code,
      paystackAuthorizationUrl: paystackResponse.authorization_url,
      updatedAt: FieldValue.serverTimestamp(),
    });

    // Return response for frontend
    return NextResponse.json({
      success: true,
      transactionId: transactionRef.id,
      reference: reference,
      authorizationUrl: paystackResponse.authorization_url,
      accessCode: paystackResponse.access_code,
      amount: product.price,
      amountKobo: amountKobo,
      currency: currency,
      productName: product.name,
    });

  } catch (error: any) {
    console.error('Error in payments-paystack:', error);
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
 * GET /api/payments-paystack
 * 
 * Health check
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Paystack payments API is ready',
    provider: 'paystack',
  });
}
