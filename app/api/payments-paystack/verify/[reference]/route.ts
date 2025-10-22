/**
 * GET /api/payments-paystack/verify/[reference]
 * 
 * Verifies a Paystack transaction and updates the database accordingly.
 * Called after buyer completes payment or from webhook.
 */

import { NextResponse } from 'next/server';
import { paystack } from '@/lib/paystack';
import { firebaseDb } from '@/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function GET(
  request: Request,
  props: { params: Promise<{ reference: string }> }
) {
  try {
    const params = await props.params;
    const reference = params.reference;

    if (!reference) {
      return NextResponse.json(
        { error: 'Missing transaction reference' },
        { status: 400 }
      );
    }

    // Get transaction from Firestore
    const transactionsSnapshot = await firebaseDb
      .collection('transactions')
      .where('paystackReference', '==', reference)
      .limit(1)
      .get();

    if (transactionsSnapshot.empty) {
      return NextResponse.json(
        { error: 'Transaction not found in database' },
        { status: 404 }
      );
    }

    const transactionDoc = transactionsSnapshot.docs[0];
    const transactionData = transactionDoc.data();

    // If already verified as success, return cached data
    if (transactionData.paymentStatus === 'paid') {
      return NextResponse.json({
        success: true,
        transaction: {
          id: transactionDoc.id,
          reference: reference,
          status: transactionData.status,
          paymentStatus: transactionData.paymentStatus,
          amount: transactionData.amountKobo / 100,
          currency: transactionData.currency,
          productName: transactionData.productName,
          paidAt: transactionData.paidAt,
        },
        alreadyVerified: true,
      });
    }

    // Verify transaction with Paystack
    let paystackData;
    
    try {
      paystackData = await paystack.transactions.verify(reference);
      console.log(`✅ Transaction verified with Paystack: ${reference}`);
    } catch (error: any) {
      console.error('Paystack verification failed:', error);
      return NextResponse.json(
        {
          error: 'Failed to verify transaction with Paystack',
          details: error.message,
        },
        { status: 500 }
      );
    }

    // Determine transaction status
    const isSuccess = paystackData.status === 'success';
    const isFailed = paystackData.status === 'failed';
    const isAbandoned = paystackData.status === 'abandoned';

    // Prepare update data
    const updateData: any = {
      paystackTransactionId: paystackData.id,
      paystackChannel: paystackData.channel,
      paystackFees: paystackData.fees || 0,
      gatewayResponse: paystackData.gateway_response,
      message: paystackData.message || null,
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (isSuccess) {
      updateData.status = 'success';
      updateData.paymentStatus = 'paid';
      updateData.paidAt = FieldValue.serverTimestamp();
      updateData.paystackAuthorization = paystackData.authorization;
      updateData.paystackCustomerCode = paystackData.customer?.customer_code;
    } else if (isFailed) {
      updateData.status = 'failed';
      updateData.paymentStatus = 'failed';
    } else if (isAbandoned) {
      updateData.status = 'abandoned';
      updateData.paymentStatus = 'pending';
    }

    // Update transaction in Firestore
    await transactionDoc.ref.update(updateData);
    console.log(`✅ Transaction updated in Firestore: ${transactionDoc.id}`);

    // If successful, create order and update product sales
    if (isSuccess) {
      await handleSuccessfulPayment(transactionDoc.id, transactionData, paystackData);
    }

    // Return response
    return NextResponse.json({
      success: true,
      transaction: {
        id: transactionDoc.id,
        reference: reference,
        status: isSuccess ? 'success' : isFailed ? 'failed' : 'abandoned',
        paymentStatus: isSuccess ? 'paid' : isFailed ? 'failed' : 'pending',
        amount: transactionData.amountKobo / 100,
        currency: transactionData.currency,
        productName: transactionData.productName,
        channel: paystackData.channel,
        paidAt: isSuccess ? new Date().toISOString() : null,
        gatewayResponse: paystackData.gateway_response,
      },
      paystackData: {
        id: paystackData.id,
        status: paystackData.status,
        channel: paystackData.channel,
        fees: paystackData.fees,
        card: paystackData.authorization ? {
          brand: paystackData.authorization.brand,
          last4: paystackData.authorization.last4,
          bank: paystackData.authorization.bank,
        } : null,
      },
    });

  } catch (error: any) {
    console.error('Error in verify payment:', error);
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
 * Handle successful payment:
 * - Create order record
 * - Update product sales count
 * - Track platform earnings
 */
async function handleSuccessfulPayment(
  transactionId: string,
  transactionData: any,
  paystackData: any
): Promise<void> {
  try {
    // Create order record
    const orderData = {
      transactionId: transactionId,
      paystackReference: transactionData.paystackReference,
      
      productId: transactionData.productId,
      productName: transactionData.productName,
      productType: transactionData.productType,
      
      sellerId: transactionData.sellerId,
      sellerName: transactionData.sellerName,
      
      customerId: transactionData.buyerId,
      customerEmail: transactionData.buyerEmail,
      
      amount: transactionData.amountKobo,
      currency: transactionData.currency,
      
      status: 'paid',
      paymentStatus: 'paid',
      paymentProvider: 'paystack',
      
      createdAt: FieldValue.serverTimestamp(),
    };

    await firebaseDb.collection('orders').add(orderData);
    console.log(`✅ Order created for transaction: ${transactionId}`);

    // Update product sales count
    await firebaseDb
      .collection('products')
      .doc(transactionData.productId)
      .update({
        salesCount: FieldValue.increment(1),
      });
    console.log(`✅ Product sales count updated`);

    // Track platform earnings
    const earningsData = {
      transactionId: transactionId,
      reference: transactionData.paystackReference,
      
      amount: transactionData.amountKobo,
      applicationFee: transactionData.platformFeeKobo,
      currency: transactionData.currency,
      
      sellerId: transactionData.sellerId,
      sellerName: transactionData.sellerName,
      
      provider: 'paystack',
      paystackChargeId: paystackData.id,
      paystackSubaccountCode: paystackData.subaccount?.subaccount_code,
      
      createdAt: FieldValue.serverTimestamp(),
    };

    await firebaseDb.collection('platformEarnings').add(earningsData);
    console.log(`✅ Platform earnings tracked`);

  } catch (error) {
    console.error('Error handling successful payment:', error);
    // Don't throw - transaction is already successful, this is just bookkeeping
  }
}
