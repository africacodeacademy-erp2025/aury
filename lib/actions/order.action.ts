/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';

import { firebaseDb } from '@/firebase/admin';
import { getCurrentUser } from './auth.action';
import { FieldValue } from 'firebase-admin/firestore';

const COMMISSION_RATE = 0.05; // 5% platform commission
const TAX_RATE = 0.15; // 15% VAT for South Africa
const SHIPPING_RATE = 50; // R50 flat shipping rate

export async function createOrder(
  cartItems: CartItem[],
  shippingAddress?: ShippingAddress
): Promise<CreateOrderResult> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, message: 'You must be logged in to create an order' };
    }

    if (!cartItems || cartItems.length === 0) {
      return { success: false, message: 'Cart is empty' };
    }

    // Validate stock for physical products
    for (const item of cartItems) {
      const productDoc = await firebaseDb.collection('products').doc(item.productId).get();
      if (!productDoc.exists) {
        return { success: false, message: `Product ${item.productName} not found` };
      }
      
      const productData = productDoc.data()!;
      if (productData.stock !== undefined && productData.stock < item.quantity) {
        return { success: false, message: `Insufficient stock for ${item.productName}` };
      }
    }

    // Calculate totals
    const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    const hasPhysicalItems = cartItems.some(item => item.productType === 'physical');
    const shipping = hasPhysicalItems ? SHIPPING_RATE : 0;
    const tax = (subtotal + shipping) * TAX_RATE;
    const totalAmount = subtotal + shipping + tax;

    // Create order items
    const orderItems: OrderItem[] = cartItems.map(item => ({
      productId: item.productId,
      productName: item.productName,
      productImage: item.productImage,
      quantity: item.quantity,
      price: item.price,
      sellerId: item.sellerId,
      sellerName: item.sellerName,
      productType: item.productType,
    }));

    // Create order
    const orderData = {
      userId: user.id,
      userEmail: user.email,
      userName: user.name,
      items: orderItems,
      totalAmount,
      subtotal,
      tax,
      shipping,
      status: 'pending',
      paymentStatus: 'pending',
      shippingAddress: shippingAddress || null,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    const orderRef = await firebaseDb.collection('orders').add(orderData);
    
    // Create order object for response
    const order: Order = {
      id: orderRef.id,
      ...orderData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as Order;

    return { 
      success: true, 
      order,
      message: 'Order created successfully'
    };
  } catch (error) {
    console.error('Error creating order:', error);
    return { success: false, message: 'Failed to create order' };
  }
}

export async function updateOrderStatus(
  orderId: string, 
  status: Order['status'],
  trackingNumber?: string
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
    
    // Check if user is the seller of any items in the order or admin
    const userCanUpdate = orderData.items.some((item: any) => item.sellerId === user.id);
    
    if (!userCanUpdate) {
      return { success: false, message: 'You are not authorized to update this order' };
    }

    const updateData: any = {
      status,
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (trackingNumber) {
      updateData.trackingNumber = trackingNumber;
    }

    if (status === 'delivered') {
      updateData.deliveredAt = FieldValue.serverTimestamp();
    }

    await firebaseDb.collection('orders').doc(orderId).update(updateData);

    // If order is completed, update seller earnings
    if (status === 'delivered' && orderData.paymentStatus === 'paid') {
      await updateSellerEarnings(orderId);
    }

    return { success: true, message: 'Order status updated successfully' };
  } catch (error) {
    console.error('Error updating order status:', error);
    return { success: false, message: 'Failed to update order status' };
  }
}

export async function getOrders(
  page: number = 1,
  limit: number = 10,
  status?: Order['status']
): Promise<GetOrdersResult> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, message: 'You must be logged in', orders: [] };
    }

    let query = firebaseDb.collection('orders').where('userId', '==', user.id);
    
    if (status) {
      query = query.where('status', '==', status);
    }

    const totalQuery = await query.count().get();
    const total = totalQuery.data().count;

    const ordersSnapshot = await query
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .offset((page - 1) * limit)
      .get();

    const orders: Order[] = ordersSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        deliveredAt: data.deliveredAt?.toDate?.()?.toISOString() || undefined,
      } as Order;
    });

    return {
      success: true,
      orders,
      pagination: {
        page,
        limit,
        total,
        hasMore: page * limit < total,
      },
    };
  } catch (error) {
    console.error('Error getting orders:', error);
    return { success: false, message: 'Failed to get orders', orders: [] };
  }
}

export async function getSellerOrders(
  page: number = 1,
  limit: number = 10,
  status?: Order['status']
): Promise<GetOrdersResult> {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'creator' && user.role !== 'craft-business')) {
      return { success: false, message: 'You must be a seller to view seller orders', orders: [] };
    }

    // Get orders that contain items from this seller
    const ordersCollection = firebaseDb.collection('orders');
    let ordersQuery: FirebaseFirestore.Query = ordersCollection;

    if (status) {
      ordersQuery = ordersQuery.where('status', '==', status);
    }

    const ordersSnapshot = await ordersQuery
      .orderBy('createdAt', 'desc')
      .limit(limit * 5) // Get more to filter by seller
      .get();

    // Filter orders that contain items from this seller
    const sellerOrders: Order[] = [];
    
    for (const doc of ordersSnapshot.docs) {
      const data = doc.data();
      const hasSellerItems = data.items.some((item: any) => item.sellerId === user.id);
      
      if (hasSellerItems) {
        // Filter items to only show this seller's items
        const sellerItems = data.items.filter((item: any) => item.sellerId === user.id);
        
        sellerOrders.push({
          id: doc.id,
          ...data,
          items: sellerItems,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          deliveredAt: data.deliveredAt?.toDate?.()?.toISOString() || undefined,
        } as Order);
      }
    }

    // Paginate the filtered results
    const startIndex = (page - 1) * limit;
    const paginatedOrders = sellerOrders.slice(startIndex, startIndex + limit);

    return {
      success: true,
      orders: paginatedOrders,
      pagination: {
        page,
        limit,
        total: sellerOrders.length,
        hasMore: startIndex + limit < sellerOrders.length,
      },
    };
  } catch (error) {
    console.error('Error getting seller orders:', error);
    return { success: false, message: 'Failed to get seller orders', orders: [] };
  }
}

async function updateSellerEarnings(orderId: string) {
  try {
    const orderDoc = await firebaseDb.collection('orders').doc(orderId).get();
    if (!orderDoc.exists) return;

    const orderData = orderDoc.data()!;
    
    // Group items by seller
    const sellerItems: { [sellerId: string]: OrderItem[] } = {};
    orderData.items.forEach((item: OrderItem) => {
      if (!sellerItems[item.sellerId]) {
        sellerItems[item.sellerId] = [];
      }
      sellerItems[item.sellerId].push(item);
    });

    // Update earnings for each seller
    for (const [sellerId, items] of Object.entries(sellerItems)) {
      const sellerRevenue = items.reduce((total, item) => total + (item.price * item.quantity), 0);
      const commission = sellerRevenue * COMMISSION_RATE;
      const netAmount = sellerRevenue - commission;

      // Create transaction record
      await firebaseDb.collection('transactions').add({
        orderId,
        sellerId,
        amount: sellerRevenue,
        commission,
        netAmount,
        type: 'sale',
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

      if (earningsQuery.empty) {
        // Create new earnings record
        await firebaseDb.collection('seller_earnings').add({
          sellerId,
          totalEarnings: netAmount,
          availableBalance: netAmount,
          pendingBalance: 0,
          totalSales: sellerRevenue,
          totalOrders: 1,
          commissionRate: COMMISSION_RATE,
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        });
      } else {
        // Update existing earnings
        const earningsRef = earningsQuery.docs[0].ref;
        const earningsData = earningsQuery.docs[0].data();
        
        await earningsRef.update({
          totalEarnings: earningsData.totalEarnings + netAmount,
          availableBalance: earningsData.availableBalance + netAmount,
          totalSales: earningsData.totalSales + sellerRevenue,
          totalOrders: earningsData.totalOrders + 1,
          updatedAt: FieldValue.serverTimestamp(),
        });
      }

      // Update product sales count
      for (const item of items) {
        await firebaseDb.collection('products').doc(item.productId).update({
          salesCount: FieldValue.increment(item.quantity),
          updatedAt: FieldValue.serverTimestamp(),
        });

        // Update stock for physical products
        const productDoc = await firebaseDb.collection('products').doc(item.productId).get();
        if (productDoc.exists) {
          const productData = productDoc.data()!;
          if (productData.stock !== undefined) {
            await firebaseDb.collection('products').doc(item.productId).update({
              stock: FieldValue.increment(-item.quantity),
            });
          }
        }
      }
    }
  } catch (error) {
    console.error('Error updating seller earnings:', error);
  }
}

export async function getOrderById(orderId: string): Promise<{ success: boolean; order?: Order; message?: string }> {
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
    
    // Check if user can view this order (customer or seller)
    const canView = orderData.userId === user.id || 
                   orderData.items.some((item: any) => item.sellerId === user.id);
    
    if (!canView) {
      return { success: false, message: 'You are not authorized to view this order' };
    }

    const order: Order = {
      id: orderDoc.id,
      ...orderData,
      createdAt: orderData.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      updatedAt: orderData.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      deliveredAt: orderData.deliveredAt?.toDate?.()?.toISOString() || undefined,
    } as Order;

    return { success: true, order };
  } catch (error) {
    console.error('Error getting order:', error);
    return { success: false, message: 'Failed to get order' };
  }
}