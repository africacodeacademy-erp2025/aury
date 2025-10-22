/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * POST /api/webhooks/paystack
 * 
 * Handles webhooks from Paystack for payment events.
 * 
 * Important events:
 * - charge.success: Payment completed successfully
 * - charge.failed: Payment failed
 * - transfer.success: Payout completed
 * - transfer.failed: Payout failed
 * - transfer.reversed: Payout was reversed
 * 
 * Security: Verifies webhook signature using PAYSTACK_WEBHOOK_SECRET
 * Idempotency: Uses event ID to prevent duplicate processing
 */

import { NextResponse } from 'next/server';
import { verifyPaystackWebhook } from '@/lib/paystack';
import { firebaseDb } from '@/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import { headers } from 'next/headers';

interface PaystackWebhookEvent {
  event: string;
  data: any;
}

export async function POST(request: Request) {
  try {
    // Get request body as text for signature verification
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('x-paystack-signature');

    if (!signature) {
      console.error('⛔ Missing Paystack signature');
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    const isValid = verifyPaystackWebhook(body, signature);
    
    if (!isValid) {
      console.error('⛔ Invalid Paystack signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Parse event data
    const event: PaystackWebhookEvent = JSON.parse(body);
    const eventId = event.data?.id || `${event.event}_${Date.now()}`;

    console.log(`📨 Webhook received: ${event.event} (ID: ${eventId})`);

    // Check for duplicate event (idempotency)
    const existingLogSnapshot = await firebaseDb
      .collection('webhook_logs')
      .where('eventId', '==', eventId)
      .limit(1)
      .get();

    if (!existingLogSnapshot.empty) {
      const existingLog = existingLogSnapshot.docs[0].data();
      console.log(`⏭️  Event already processed: ${eventId}`);
      
      return NextResponse.json({
        received: true,
        alreadyProcessed: true,
        processedAt: existingLog.processedAt,
      });
    }

    // Log webhook event
    const logRef = await firebaseDb.collection('webhook_logs').add({
      eventId: eventId,
      eventType: event.event,
      payload: event.data,
      processed: false,
      createdAt: FieldValue.serverTimestamp(),
    });

    // Process event based on type
    try {
      switch (event.event) {
        case 'charge.success':
          await handleChargeSuccess(event.data);
          break;

        case 'charge.failed':
          await handleChargeFailed(event.data);
          break;

        case 'transfer.success':
          await handleTransferSuccess(event.data);
          break;

        case 'transfer.failed':
          await handleTransferFailed(event.data);
          break;

        case 'transfer.reversed':
          await handleTransferReversed(event.data);
          break;

        default:
          console.log(`ℹ️  Unhandled event type: ${event.event}`);
      }

      // Mark as processed
      await logRef.update({
        processed: true,
        processedAt: FieldValue.serverTimestamp(),
      });

      console.log(`✅ Webhook processed successfully: ${event.event}`);

    } catch (error: any) {
      console.error(`❌ Error processing webhook:`, error);
      
      // Log error
      await logRef.update({
        error: error.message,
        retryCount: FieldValue.increment(1),
      });

      // Return 200 to prevent Paystack from retrying
      // We'll handle retries internally if needed
      return NextResponse.json({
        received: true,
        error: error.message,
      });
    }

    return NextResponse.json({ received: true });

  } catch (error: any) {
    console.error('❌ Fatal webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

/**
 * Handle successful charge
 */
async function handleChargeSuccess(data: any): Promise<void> {
  console.log(`💰 Processing charge.success: ${data.reference}`);

  const reference = data.reference;

  // Find transaction
  const transactionsSnapshot = await firebaseDb
    .collection('transactions')
    .where('paystackReference', '==', reference)
    .limit(1)
    .get();

  if (transactionsSnapshot.empty) {
    console.warn(`⚠️  Transaction not found for reference: ${reference}`);
    return;
  }

  const transactionDoc = transactionsSnapshot.docs[0];
  const transactionData = transactionDoc.data();

  // Skip if already processed
  if (transactionData.paymentStatus === 'paid') {
    console.log(`⏭️  Transaction already marked as paid: ${reference}`);
    return;
  }

  // Update transaction
  await transactionDoc.ref.update({
    status: 'success',
    paymentStatus: 'paid',
    paystackTransactionId: data.id,
    paystackChannel: data.channel,
    paystackFees: data.fees || 0,
    paystackAuthorization: data.authorization,
    paystackCustomerCode: data.customer?.customer_code,
    gatewayResponse: data.gateway_response,
    paidAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  console.log(`✅ Transaction updated: ${transactionDoc.id}`);

  // Create order if not exists
  const existingOrderSnapshot = await firebaseDb
    .collection('orders')
    .where('transactionId', '==', transactionDoc.id)
    .limit(1)
    .get();

  if (existingOrderSnapshot.empty) {
    await firebaseDb.collection('orders').add({
      transactionId: transactionDoc.id,
      paystackReference: reference,
      
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
    });

    console.log(`✅ Order created`);
  }

  // Update product sales count
  await firebaseDb
    .collection('products')
    .doc(transactionData.productId)
    .update({
      salesCount: FieldValue.increment(1),
    });

  // Track platform earnings
  await firebaseDb.collection('platformEarnings').add({
    transactionId: transactionDoc.id,
    reference: reference,
    
    amount: transactionData.amountKobo,
    applicationFee: transactionData.platformFeeKobo,
    currency: transactionData.currency,
    
    sellerId: transactionData.sellerId,
    sellerName: transactionData.sellerName,
    
    provider: 'paystack',
    paystackChargeId: data.id,
    
    createdAt: FieldValue.serverTimestamp(),
  });

  console.log(`✅ Platform earnings tracked`);
}

/**
 * Handle failed charge
 */
async function handleChargeFailed(data: any): Promise<void> {
  console.log(`❌ Processing charge.failed: ${data.reference}`);

  const reference = data.reference;

  const transactionsSnapshot = await firebaseDb
    .collection('transactions')
    .where('paystackReference', '==', reference)
    .limit(1)
    .get();

  if (transactionsSnapshot.empty) {
    console.warn(`⚠️  Transaction not found for reference: ${reference}`);
    return;
  }

  const transactionDoc = transactionsSnapshot.docs[0];

  await transactionDoc.ref.update({
    status: 'failed',
    paymentStatus: 'failed',
    gatewayResponse: data.gateway_response,
    message: data.message || 'Payment failed',
    updatedAt: FieldValue.serverTimestamp(),
  });

  console.log(`✅ Transaction marked as failed`);
}

/**
 * Handle successful transfer (payout)
 */
async function handleTransferSuccess(data: any): Promise<void> {
  console.log(`💸 Processing transfer.success: ${data.transfer_code}`);

  const transferCode = data.transfer_code;

  // Find payout record
  const payoutsSnapshot = await firebaseDb
    .collection('seller_payouts')
    .where('paystackTransferCode', '==', transferCode)
    .limit(1)
    .get();

  if (payoutsSnapshot.empty) {
    console.warn(`⚠️  Payout not found for transfer: ${transferCode}`);
    return;
  }

  const payoutDoc = payoutsSnapshot.docs[0];

  await payoutDoc.ref.update({
    status: 'success',
    completedAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  console.log(`✅ Payout marked as successful`);
}

/**
 * Handle failed transfer
 */
async function handleTransferFailed(data: any): Promise<void> {
  console.log(`❌ Processing transfer.failed: ${data.transfer_code}`);

  const transferCode = data.transfer_code;

  const payoutsSnapshot = await firebaseDb
    .collection('seller_payouts')
    .where('paystackTransferCode', '==', transferCode)
    .limit(1)
    .get();

  if (payoutsSnapshot.empty) {
    console.warn(`⚠️  Payout not found for transfer: ${transferCode}`);
    return;
  }

  const payoutDoc = payoutsSnapshot.docs[0];

  await payoutDoc.ref.update({
    status: 'failed',
    failureReason: data.message || 'Transfer failed',
    updatedAt: FieldValue.serverTimestamp(),
  });

  console.log(`✅ Payout marked as failed`);
}

/**
 * Handle reversed transfer
 */
async function handleTransferReversed(data: any): Promise<void> {
  console.log(`🔄 Processing transfer.reversed: ${data.transfer_code}`);

  const transferCode = data.transfer_code;

  const payoutsSnapshot = await firebaseDb
    .collection('seller_payouts')
    .where('paystackTransferCode', '==', transferCode)
    .limit(1)
    .get();

  if (payoutsSnapshot.empty) {
    console.warn(`⚠️  Payout not found for transfer: ${transferCode}`);
    return;
  }

  const payoutDoc = payoutsSnapshot.docs[0];

  await payoutDoc.ref.update({
    status: 'reversed',
    failureReason: 'Transfer was reversed',
    updatedAt: FieldValue.serverTimestamp(),
  });

  console.log(`✅ Payout marked as reversed`);
}
