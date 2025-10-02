/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';

import { firebaseDb } from '@/firebase/admin';
import { getCurrentUser } from './auth.action';
import { FieldValue } from 'firebase-admin/firestore';

export async function addToCart(productId: string, quantity: number = 1): Promise<CartResult> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, message: 'You must be logged in to add items to cart' };
    }

    // Get product details
    const productDoc = await firebaseDb.collection('products').doc(productId).get();
    if (!productDoc.exists) {
      return { success: false, message: 'Product not found' };
    }

    const productData = productDoc.data()!;
    
    // Check stock for physical products
    if (productData.stock !== undefined && productData.stock < quantity) {
      return { success: false, message: 'Insufficient stock available' };
    }

    // Get or create user's cart
    const cartQuery = await firebaseDb
      .collection('carts')
      .where('userId', '==', user.id)
      .limit(1)
      .get();

    let cartRef;
    let cartData: any = {
      userId: user.id,
      items: [],
      totalAmount: 0,
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (cartQuery.empty) {
      // Create new cart
      cartData.createdAt = FieldValue.serverTimestamp();
      cartRef = await firebaseDb.collection('carts').add(cartData);
    } else {
      // Use existing cart
      cartRef = cartQuery.docs[0].ref;
      cartData = cartQuery.docs[0].data();
    }

    // Check if item already exists in cart
    const existingItemIndex = cartData.items.findIndex((item: any) => item.productId === productId);
    
    if (existingItemIndex >= 0) {
      // Update quantity
      cartData.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      const cartItem = {
        id: `${productId}_${Date.now()}`,
        productId,
        quantity,
        price: productData.price,
        productName: productData.name,
        productImage: productData.imageUrl || null,
        sellerId: productData.sellerId,
        sellerName: productData.sellerName,
        productType: productData.category === 'crochet pattern' ? 'pattern' : 'physical',
      };
      cartData.items.push(cartItem);
    }

    // Recalculate total
    cartData.totalAmount = cartData.items.reduce((total: number, item: any) => 
      total + (item.price * item.quantity), 0
    );
    cartData.updatedAt = FieldValue.serverTimestamp();

    await cartRef.update(cartData);

    // Get updated cart
    const updatedCart = await cartRef.get();
    const cart = { id: updatedCart.id, ...updatedCart.data() } as Cart;

    return { success: true, cart };
  } catch (error) {
    console.error('Error adding to cart:', error);
    return { success: false, message: 'Failed to add item to cart' };
  }
}

export async function removeFromCart(productId: string): Promise<CartResult> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, message: 'You must be logged in' };
    }

    const cartQuery = await firebaseDb
      .collection('carts')
      .where('userId', '==', user.id)
      .limit(1)
      .get();

    if (cartQuery.empty) {
      return { success: false, message: 'Cart not found' };
    }

    const cartRef = cartQuery.docs[0].ref;
    const cartData = cartQuery.docs[0].data();

    // Remove item from cart
    cartData.items = cartData.items.filter((item: any) => item.productId !== productId);
    
    // Recalculate total
    cartData.totalAmount = cartData.items.reduce((total: number, item: any) => 
      total + (item.price * item.quantity), 0
    );
    cartData.updatedAt = FieldValue.serverTimestamp();

    await cartRef.update(cartData);

    const cart = { id: cartRef.id, ...cartData } as Cart;
    return { success: true, cart };
  } catch (error) {
    console.error('Error removing from cart:', error);
    return { success: false, message: 'Failed to remove item from cart' };
  }
}

export async function updateCartItemQuantity(productId: string, quantity: number): Promise<CartResult> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, message: 'You must be logged in' };
    }

    if (quantity <= 0) {
      return removeFromCart(productId);
    }

    const cartQuery = await firebaseDb
      .collection('carts')
      .where('userId', '==', user.id)
      .limit(1)
      .get();

    if (cartQuery.empty) {
      return { success: false, message: 'Cart not found' };
    }

    const cartRef = cartQuery.docs[0].ref;
    const cartData = cartQuery.docs[0].data();

    // Find and update item
    const itemIndex = cartData.items.findIndex((item: any) => item.productId === productId);
    if (itemIndex === -1) {
      return { success: false, message: 'Item not found in cart' };
    }

    // Check stock
    const productDoc = await firebaseDb.collection('products').doc(productId).get();
    if (productDoc.exists) {
      const productData = productDoc.data()!;
      if (productData.stock !== undefined && productData.stock < quantity) {
        return { success: false, message: 'Insufficient stock available' };
      }
    }

    cartData.items[itemIndex].quantity = quantity;
    
    // Recalculate total
    cartData.totalAmount = cartData.items.reduce((total: number, item: any) => 
      total + (item.price * item.quantity), 0
    );
    cartData.updatedAt = FieldValue.serverTimestamp();

    await cartRef.update(cartData);

    const cart = { id: cartRef.id, ...cartData } as Cart;
    return { success: true, cart };
  } catch (error) {
    console.error('Error updating cart:', error);
    return { success: false, message: 'Failed to update cart' };
  }
}

export async function getCart(): Promise<CartResult> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, message: 'You must be logged in' };
    }

    const cartQuery = await firebaseDb
      .collection('carts')
      .where('userId', '==', user.id)
      .limit(1)
      .get();

    if (cartQuery.empty) {
      // Return empty cart
      const emptyCart: Cart = {
        id: '',
        userId: user.id,
        items: [],
        totalAmount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return { success: true, cart: emptyCart };
    }

    const cartDoc = cartQuery.docs[0];
    const cartData = cartDoc.data();
    
    const cart: Cart = {
      id: cartDoc.id,
      userId: cartData.userId,
      items: cartData.items || [],
      totalAmount: cartData.totalAmount || 0,
      createdAt: cartData.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      updatedAt: cartData.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    };

    return { success: true, cart };
  } catch (error) {
    console.error('Error getting cart:', error);
    return { success: false, message: 'Failed to get cart' };
  }
}

export async function clearCart(): Promise<CartResult> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, message: 'You must be logged in' };
    }

    const cartQuery = await firebaseDb
      .collection('carts')
      .where('userId', '==', user.id)
      .limit(1)
      .get();

    if (!cartQuery.empty) {
      await cartQuery.docs[0].ref.delete();
    }

    return { success: true };
  } catch (error) {
    console.error('Error clearing cart:', error);
    return { success: false, message: 'Failed to clear cart' };
  }
}