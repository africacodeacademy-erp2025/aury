/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';

import { firebaseDb } from '@/firebase/admin';
import { getCurrentUser } from './auth.action';
import { FieldValue } from 'firebase-admin/firestore';

export async function getSellerEarnings(): Promise<EarningsResult> {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'creator' && user.role !== 'craft-business')) {
      return { success: false, message: 'You must be a seller to view earnings' };
    }

    // Get earnings record
    const earningsQuery = await firebaseDb
      .collection('seller_earnings')
      .where('sellerId', '==', user.id)
      .limit(1)
      .get();

    let earnings: SellerEarnings;
    
    if (earningsQuery.empty) {
      // Create default earnings record
      earnings = {
        id: '',
        sellerId: user.id,
        totalEarnings: 0,
        availableBalance: 0,
        pendingBalance: 0,
        totalSales: 0,
        totalOrders: 0,
        commissionRate: 0.05,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    } else {
      const earningsDoc = earningsQuery.docs[0];
      const earningsData = earningsDoc.data();
      
      earnings = {
        id: earningsDoc.id,
        sellerId: earningsData.sellerId,
        totalEarnings: earningsData.totalEarnings || 0,
        availableBalance: earningsData.availableBalance || 0,
        pendingBalance: earningsData.pendingBalance || 0,
        totalSales: earningsData.totalSales || 0,
        totalOrders: earningsData.totalOrders || 0,
        commissionRate: earningsData.commissionRate || 0.05,
        lastPayoutAt: earningsData.lastPayoutAt?.toDate?.()?.toISOString(),
        createdAt: earningsData.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: earningsData.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      };
    }

    // Get recent transactions
    const transactionsSnapshot = await firebaseDb
      .collection('transactions')
      .where('sellerId', '==', user.id)
      .orderBy('createdAt', 'desc')
      .limit(20)
      .get();

    const transactions: Transaction[] = transactionsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        orderId: data.orderId,
        sellerId: data.sellerId,
        amount: data.amount,
        commission: data.commission,
        netAmount: data.netAmount,
        type: data.type,
        status: data.status,
        paymentIntentId: data.paymentIntentId,
        payoutId: data.payoutId,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        processedAt: data.processedAt?.toDate?.()?.toISOString(),
      };
    });

    return { success: true, earnings, transactions };
  } catch (error) {
    console.error('Error getting seller earnings:', error);
    return { success: false, message: 'Failed to get earnings data' };
  }
}

export async function requestPayout(
  amount: number,
  paymentMethod: string,
  paymentDetails: Record<string, any>
): Promise<PayoutResult> {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'creator' && user.role !== 'craft-business')) {
      return { success: false, message: 'You must be a seller to request payouts' };
    }

    // Get current earnings
    const earningsQuery = await firebaseDb
      .collection('seller_earnings')
      .where('sellerId', '==', user.id)
      .limit(1)
      .get();

    if (earningsQuery.empty) {
      return { success: false, message: 'No earnings record found' };
    }

    const earningsDoc = earningsQuery.docs[0];
    const earningsData = earningsDoc.data();

    if (earningsData.availableBalance < amount) {
      return { success: false, message: 'Insufficient available balance' };
    }

    const minimumPayout = 100; // R100 minimum payout
    if (amount < minimumPayout) {
      return { success: false, message: `Minimum payout amount is P${minimumPayout}` };
    }

    // Create payout request
    const payoutData = {
      sellerId: user.id,
      amount,
      status: 'pending',
      paymentMethod,
      paymentDetails,
      createdAt: FieldValue.serverTimestamp(),
    };

    const payoutRef = await firebaseDb.collection('payouts').add(payoutData);

    // Update seller earnings (move from available to pending)
    await earningsDoc.ref.update({
      availableBalance: FieldValue.increment(-amount),
      pendingBalance: FieldValue.increment(amount),
      updatedAt: FieldValue.serverTimestamp(),
    });

    // Create transaction record
    await firebaseDb.collection('transactions').add({
      sellerId: user.id,
      amount: -amount,
      commission: 0,
      netAmount: -amount,
      type: 'payout',
      status: 'pending',
      payoutId: payoutRef.id,
      createdAt: FieldValue.serverTimestamp(),
    });

    const payout: Payout = {
      id: payoutRef.id,
      ...payoutData,
      createdAt: new Date().toISOString(),
    } as Payout;

    return { success: true, payout, message: 'Payout request submitted successfully' };
  } catch (error) {
    console.error('Error requesting payout:', error);
    return { success: false, message: 'Failed to request payout' };
  }
}

export async function getPayoutHistory(
  page: number = 1,
  limit: number = 10
): Promise<{ success: boolean; payouts?: Payout[]; message?: string }> {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'creator' && user.role !== 'craft-business')) {
      return { success: false, message: 'You must be a seller to view payout history' };
    }

    const payoutsSnapshot = await firebaseDb
      .collection('payouts')
      .where('sellerId', '==', user.id)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .offset((page - 1) * limit)
      .get();

    const payouts: Payout[] = payoutsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        sellerId: data.sellerId,
        amount: data.amount,
        status: data.status,
        paymentMethod: data.paymentMethod,
        paymentDetails: data.paymentDetails,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        processedAt: data.processedAt?.toDate?.()?.toISOString(),
        failureReason: data.failureReason,
      };
    });

    return { success: true, payouts };
  } catch (error) {
    console.error('Error getting payout history:', error);
    return { success: false, message: 'Failed to get payout history' };
  }
}

export async function getEarningsAnalytics(
  startDate?: string,
  endDate?: string
): Promise<{
  success: boolean;
  analytics?: {
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
    topProducts: Array<{ productId: string; productName: string; revenue: number; orders: number }>;
    monthlyEarnings: Array<{ month: string; revenue: number; orders: number }>;
  };
  message?: string;
}> {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'creator' && user.role !== 'craft-business')) {
      return { success: false, message: 'You must be a seller to view analytics' };
    }

    // Get transactions for the date range
    let query = firebaseDb
      .collection('transactions')
      .where('sellerId', '==', user.id)
      .where('type', '==', 'sale')
      .where('status', '==', 'completed');

    if (startDate) {
      query = query.where('createdAt', '>=', new Date(startDate));
    }
    if (endDate) {
      query = query.where('createdAt', '<=', new Date(endDate));
    }

    const transactionsSnapshot = await query.get();
    const transactions = transactionsSnapshot.docs.map(doc => doc.data());

    // Calculate analytics
    const totalRevenue = transactions.reduce((sum, t) => sum + t.amount, 0);
    const totalOrders = transactions.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Get product performance (simplified - in production you'd want more detailed tracking)
    const productRevenue: { [productId: string]: { revenue: number; orders: number; name: string } } = {};
    
    for (const transaction of transactions) {
      // Get order details to extract product information
      const orderDoc = await firebaseDb.collection('orders').doc(transaction.orderId).get();
      if (orderDoc.exists) {
        const orderData = orderDoc.data()!;
        const sellerItems = orderData.items.filter((item: any) => item.sellerId === user.id);
        
        for (const item of sellerItems) {
          if (!productRevenue[item.productId]) {
            productRevenue[item.productId] = {
              revenue: 0,
              orders: 0,
              name: item.productName,
            };
          }
          productRevenue[item.productId].revenue += item.price * item.quantity;
          productRevenue[item.productId].orders += 1;
        }
      }
    }

    const topProducts = Object.entries(productRevenue)
      .map(([productId, data]) => ({
        productId,
        productName: data.name,
        revenue: data.revenue,
        orders: data.orders,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Calculate monthly earnings (simplified)
    const monthlyEarnings: { [month: string]: { revenue: number; orders: number } } = {};
    
    for (const transaction of transactions) {
      const date = transaction.createdAt?.toDate ? transaction.createdAt.toDate() : new Date(transaction.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyEarnings[monthKey]) {
        monthlyEarnings[monthKey] = { revenue: 0, orders: 0 };
      }
      monthlyEarnings[monthKey].revenue += transaction.amount;
      monthlyEarnings[monthKey].orders += 1;
    }

    const monthlyEarningsArray = Object.entries(monthlyEarnings)
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => a.month.localeCompare(b.month));

    return {
      success: true,
      analytics: {
        totalRevenue,
        totalOrders,
        averageOrderValue,
        topProducts,
        monthlyEarnings: monthlyEarningsArray,
      },
    };
  } catch (error) {
    console.error('Error getting earnings analytics:', error);
    return { success: false, message: 'Failed to get analytics data' };
  }
}