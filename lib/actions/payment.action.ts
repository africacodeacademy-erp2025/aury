/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';

import { firebaseDb } from '@/firebase/admin';
import { getCurrentUser } from './auth.action';
import { FieldValue } from 'firebase-admin/firestore';

// Note: In a real implementation, you would use Stripe SDK
// This is a simplified version for demonstration

export async function createPaymentIntent(
  orderId: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  amount: number
): Promise<{ success: boolean; clientSecret?: string; message?: string }> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, message: 'You must be logged in to create payment' };
    }

    // Verify order belongs to user
    const orderDoc = await firebaseDb.collection('orders').doc(orderId).get();
    if (!orderDoc.exists) {
      return { success: false, message: 'Order not found' };
    }

    const orderData = orderDoc.data()!;
    if (orderData.userId !== user.id) {
      return { success: false, message: 'Unauthorized to pay for this order' };
    }

    // In a real implementation, you would create a Stripe PaymentIntent here
    // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    // const paymentIntent = await stripe.paymentIntents.create({
    //   amount: Math.round(amount * 100), // Convert to cents
    //   currency: 'zar',
    //   metadata: { orderId },
    // });

    // For demo purposes, we'll simulate a payment intent
    const mockClientSecret = `pi_mock_${orderId}_secret_${Date.now()}`;

    // Update order with payment intent ID
    await firebaseDb.collection('orders').doc(orderId).update({
      paymentIntentId: `pi_mock_${orderId}`,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return {
      success: true,
      clientSecret: mockClientSecret,
    };
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return { success: false, message: 'Failed to create payment intent' };
  }
}

export async function confirmPayment(
  orderId: string,
  paymentIntentId: string
): Promise<{ success: boolean; message?: string }> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, message: 'You must be logged in' };
    }

    // Verify order and payment intent
    const orderDoc = await firebaseDb.collection('orders').doc(orderId).get();
    if (!orderDoc.exists) {
      return { success: false, message: 'Order not found' };
    }

    const orderData = orderDoc.data()!;
    if (orderData.userId !== user.id) {
      return { success: false, message: 'Unauthorized' };
    }

    if (orderData.paymentIntentId !== paymentIntentId) {
      return { success: false, message: 'Invalid payment intent' };
    }

    // In a real implementation, you would verify the payment with Stripe
    // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    // const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    // if (paymentIntent.status !== 'succeeded') {
    //   return { success: false, message: 'Payment not completed' };
    // }

    // Update order status
    await firebaseDb.collection('orders').doc(orderId).update({
      paymentStatus: 'paid',
      status: 'processing',
      updatedAt: FieldValue.serverTimestamp(),
    });

    // Clear user's cart
    const cartQuery = await firebaseDb
      .collection('carts')
      .where('userId', '==', user.id)
      .limit(1)
      .get();

    if (!cartQuery.empty) {
      await cartQuery.docs[0].ref.delete();
    }

    // Generate download URLs for digital products
    await generateDigitalProductDownloads(orderId);

    return { success: true, message: 'Payment confirmed successfully' };
  } catch (error) {
    console.error('Error confirming payment:', error);
    return { success: false, message: 'Failed to confirm payment' };
  }
}

async function generateDigitalProductDownloads(orderId: string) {
  try {
    const orderDoc = await firebaseDb.collection('orders').doc(orderId).get();
    if (!orderDoc.exists) return;

    const orderData = orderDoc.data()!;
    const digitalItems = orderData.items.filter((item: any) => item.productType === 'pattern');

    if (digitalItems.length === 0) return;

    // Generate download URLs for digital products
    const updatedItems = orderData.items.map((item: any) => {
      if (item.productType === 'pattern') {
        // In a real implementation, you would generate secure download URLs
        // For demo purposes, we'll create a mock download URL
        return {
          ...item,
          downloadUrl: `https://downloads.aury.com/patterns/${item.productId}?token=${Date.now()}`,
        };
      }
      return item;
    });

    await firebaseDb.collection('orders').doc(orderId).update({
      items: updatedItems,
      updatedAt: FieldValue.serverTimestamp(),
    });

    // Send email with download links (in a real implementation)
    // await sendDigitalProductEmail(orderData.userEmail, digitalItems);
  } catch (error) {
    console.error('Error generating digital product downloads:', error);
  }
}

export async function processRefund(
  orderId: string,
  amount?: number,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  reason?: string
): Promise<{ success: boolean; message?: string }> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, message: 'You must be logged in' };
    }

    const orderDoc = await firebaseDb.collection('orders').doc(orderId).get();
    if (!orderDoc.exists) {
      return { success: false, message: 'Order not found' };
    }

    const orderData = orderDoc.data()!;
    
    // Check if user can process refund (customer or seller)
    const canRefund = orderData.userId === user.id || 
                     orderData.items.some((item: any) => item.sellerId === user.id);
    
    if (!canRefund) {
      return { success: false, message: 'Unauthorized to refund this order' };
    }

    if (orderData.paymentStatus !== 'paid') {
      return { success: false, message: 'Order has not been paid' };
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const refundAmount = amount || orderData.totalAmount;

    // In a real implementation, you would process the refund with Stripe
    // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    // const refund = await stripe.refunds.create({
    //   payment_intent: orderData.paymentIntentId,
    //   amount: Math.round(refundAmount * 100),
    //   reason: 'requested_by_customer',
    // });

    // Update order status
    await firebaseDb.collection('orders').doc(orderId).update({
      status: 'refunded',
      paymentStatus: 'refunded',
      updatedAt: FieldValue.serverTimestamp(),
    });

    // Create refund transaction records for sellers
    const sellerItems: { [sellerId: string]: any[] } = {};
    orderData.items.forEach((item: any) => {
      if (!sellerItems[item.sellerId]) {
        sellerItems[item.sellerId] = [];
      }
      sellerItems[item.sellerId].push(item);
    });

    for (const [sellerId, items] of Object.entries(sellerItems)) {
      const sellerRefundAmount = items.reduce((total: number, item: any) => 
        total + (item.price * item.quantity), 0
      );
      const commission = sellerRefundAmount * 0.05; // 5% commission
      const netRefund = sellerRefundAmount - commission;

      // Create refund transaction
      await firebaseDb.collection('transactions').add({
        orderId,
        sellerId,
        amount: -sellerRefundAmount,
        commission: -commission,
        netAmount: -netRefund,
        type: 'refund',
        status: 'completed',
        createdAt: FieldValue.serverTimestamp(),
        processedAt: FieldValue.serverTimestamp(),
      });

      // Update seller earnings
      const earningsQuery = await firebaseDb
        .collection('seller_earnings')
        .where('sellerId', '==', sellerId)
        .limit(1)
        .get();

      if (!earningsQuery.empty) {
        const earningsRef = earningsQuery.docs[0].ref;
        await earningsRef.update({
          totalEarnings: FieldValue.increment(-netRefund),
          availableBalance: FieldValue.increment(-netRefund),
          totalSales: FieldValue.increment(-sellerRefundAmount),
          updatedAt: FieldValue.serverTimestamp(),
        });
      }
    }

    return { success: true, message: 'Refund processed successfully' };
  } catch (error) {
    console.error('Error processing refund:', error);
    return { success: false, message: 'Failed to process refund' };
  }
}

export async function getPaymentMethods(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  userId?: string
): Promise<{ success: boolean; paymentMethods?: any[]; message?: string }> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, message: 'You must be logged in' };
    }

    // In a real implementation, you would fetch saved payment methods from Stripe
    // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    // const customer = await stripe.customers.list({ email: user.email });
    // if (customer.data.length > 0) {
    //   const paymentMethods = await stripe.paymentMethods.list({
    //     customer: customer.data[0].id,
    //     type: 'card',
    //   });
    //   return { success: true, paymentMethods: paymentMethods.data };
    // }

    // For demo purposes, return empty array
    return { success: true, paymentMethods: [] };
  } catch (error) {
    console.error('Error getting payment methods:', error);
    return { success: false, message: 'Failed to get payment methods' };
  }
}