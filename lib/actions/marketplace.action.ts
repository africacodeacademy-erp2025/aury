/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';

import { firebaseDb } from '@/firebase/admin';
import { Product } from '@/types';

export async function searchProducts(params: MarketplaceSearchParams): Promise<SearchResult> {
  try {
    const {
      query,
      category,
      minPrice,
      maxPrice,
      sellerType,
      sellerId,
      productType,
      tags,
      sortBy = 'newest',
      page = 1,
      limit = 12,
    } = params;

    let firestoreQuery: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> = firebaseDb.collection('products');

    // Apply filters
    if (category && category !== 'All Categories') {
      firestoreQuery = firestoreQuery.where('category', '==', category);
    }

    if (sellerType) {
      firestoreQuery = firestoreQuery.where('sellerType', '==', sellerType);
    }

    if (sellerId) {
      firestoreQuery = firestoreQuery.where('sellerId', '==', sellerId);
    }

    if (minPrice !== undefined) {
      firestoreQuery = firestoreQuery.where('price', '>=', minPrice);
    }

    if (maxPrice !== undefined && maxPrice !== Infinity) {
      firestoreQuery = firestoreQuery.where('price', '<=', maxPrice);
    }

    // Apply sorting
    switch (sortBy) {
      case 'price_asc':
        firestoreQuery = firestoreQuery.orderBy('price', 'asc');
        break;
      case 'price_desc':
        firestoreQuery = firestoreQuery.orderBy('price', 'desc');
        break;
      case 'popular':
        firestoreQuery = firestoreQuery.orderBy('salesCount', 'desc');
        break;
      case 'rating':
        firestoreQuery = firestoreQuery.orderBy('rating', 'desc');
        break;
      default:
        firestoreQuery = firestoreQuery.orderBy('createdAt', 'desc');
    }

    // Get total count for pagination
    const totalSnapshot = await firestoreQuery.count().get();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const total = totalSnapshot.data().count;

    // Get paginated results
    const productsSnapshot = await firestoreQuery
      .limit(limit)
      .offset((page - 1) * limit)
      .get();

    let products: Product[] = productsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        description: data.description,
        price: data.price,
        originalPrice: data.originalPrice || null,
        category: data.category,
        imageUrl: data.imageUrl || null,
        stock: data.stock || 0,
        materials: data.materials || [],
        difficulty: data.difficulty || 'beginner',
        tags: data.tags || [],
        sellerId: data.sellerId,
        sellerName: data.sellerName,
        sellerType: data.sellerType,
        rating: data.rating || 0,
        reviewCount: data.reviewCount || 0,
        salesCount: data.salesCount || 0,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null,
      } as Product;
    });

    // Apply additional filters that can't be done in Firestore
    if (query) {
      const searchTerm = query.toLowerCase();
      products = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm) ||
        (product.tags ?? []).some(tag => tag.toLowerCase().includes(searchTerm)) ||
        (product.materials ?? []).some(material => material.toLowerCase().includes(searchTerm))
      );
    }

    if (productType) {
      products = products.filter(product => {
        const isPattern = product.category === 'Crochet Patterns';
        return productType === 'pattern' ? isPattern : !isPattern;
      });
    }

    if (tags && tags.length > 0) {
      products = products.filter(product =>
        tags.some(tag => (product.tags ?? []).includes(tag))
      );
    }

    // Get filter options for the UI
    const allProductsSnapshot = await firebaseDb.collection('products').get();
    const allProducts = allProductsSnapshot.docs.map(doc => doc.data());

    const categories = [...new Set(allProducts.map(p => p.category))];
    const priceRange = {
      min: Math.min(...allProducts.map(p => p.price)),
      max: Math.max(...allProducts.map(p => p.price)),
    };
    const sellers = [...new Set(allProducts.map(p => ({
      id: p.sellerId,
      name: p.sellerName,
      type: p.sellerType,
    })))];

    return {
      success: true,
      products,
      pagination: {
        page,
        limit,
        total: products.length, // Use filtered count
        hasMore: page * limit < products.length,
      },
      filters: {
        categories,
        priceRange,
        sellers,
      },
    };
  } catch (error) {
    console.error('Error searching products:', error);
    return {
      success: false,
      message: 'Failed to search products',
      products: [],
    };
  }
}

export async function getProductRecommendations(
  productId?: string,
  userId?: string,
  limit: number = 8
): Promise<{ success: boolean; products?: Product[]; message?: string }> {
  try {
    const productsCollection = firebaseDb.collection('products');
    let productsQuery: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> = productsCollection;

    if (productId) {
      // Get similar products based on category and tags
      const productDoc = await productsCollection.doc(productId).get();
      if (productDoc.exists) {
        const productData = productDoc.data()!;
        productsQuery = productsQuery.where('category', '==', productData.category);
      }
    }

    // Get popular products as recommendations
    const productsSnapshot = await productsQuery
      .orderBy('salesCount', 'desc')
      .limit(limit * 2) // Get more to filter out the current product
      .get();

    const products: Product[] = productsSnapshot.docs
      .filter(doc => doc.id !== productId) // Exclude current product
      .slice(0, limit)
      .map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          description: data.description,
          price: data.price,
          originalPrice: data.originalPrice || null,
          category: data.category,
          imageUrl: data.imageUrl || null,
          stock: data.stock || 0,
          materials: data.materials || [],
          difficulty: data.difficulty || 'beginner',
          tags: data.tags || [],
          sellerId: data.sellerId,
          sellerName: data.sellerName,
          sellerType: data.sellerType,
          rating: data.rating || 0,
          reviewCount: data.reviewCount || 0,
          salesCount: data.salesCount || 0,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null,
        } as Product;
      });

    return { success: true, products };
  } catch (error) {
    console.error('Error getting product recommendations:', error);
    return { success: false, message: 'Failed to get recommendations' };
  }
}

export async function updateProductAnalytics(
  productId: string,
  action: 'view' | 'like' | 'cart_add' | 'purchase',
  quantity: number = 1
): Promise<{ success: boolean; message?: string }> {
  try {
    const analyticsRef = firebaseDb.collection('product_analytics').doc(productId);
    const analyticsDoc = await analyticsRef.get();

    if (!analyticsDoc.exists) {
      // Create new analytics record
      await analyticsRef.set({
        productId,
        views: action === 'view' ? 1 : 0,
        likes: action === 'like' ? 1 : 0,
        cartAdds: action === 'cart_add' ? 1 : 0,
        purchases: action === 'purchase' ? quantity : 0,
        revenue: 0, // Will be updated when purchase is completed
        conversionRate: 0,
        lastUpdated: new Date().toISOString(),
      });
    } else {
      // Update existing analytics
      const updates: any = {
        lastUpdated: new Date().toISOString(),
      };

      switch (action) {
        case 'view':
          updates.views = (analyticsDoc.data()?.views || 0) + 1;
          break;
        case 'like':
          updates.likes = (analyticsDoc.data()?.likes || 0) + 1;
          break;
        case 'cart_add':
          updates.cartAdds = (analyticsDoc.data()?.cartAdds || 0) + 1;
          break;
        case 'purchase':
          updates.purchases = (analyticsDoc.data()?.purchases || 0) + quantity;
          break;
      }

      await analyticsRef.update(updates);
    }

    return { success: true };
  } catch (error) {
    console.error('Error updating product analytics:', error);
    return { success: false, message: 'Failed to update analytics' };
  }
}

export async function getFeaturedProducts(limit: number = 6): Promise<{ success: boolean; products?: Product[]; message?: string }> {
  try {
    // Get products with high ratings and sales
    const productsSnapshot = await firebaseDb
      .collection('products')
      .where('rating', '>=', 4.0)
      .orderBy('rating', 'desc')
      .orderBy('salesCount', 'desc')
      .limit(limit)
      .get();

    const products: Product[] = productsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        description: data.description,
        price: data.price,
        originalPrice: data.originalPrice || null,
        category: data.category,
        imageUrl: data.imageUrl || null,
        stock: data.stock || 0,
        materials: data.materials || [],
        difficulty: data.difficulty || 'beginner',
        tags: data.tags || [],
        sellerId: data.sellerId,
        sellerName: data.sellerName,
        sellerType: data.sellerType,
        rating: data.rating || 0,
        reviewCount: data.reviewCount || 0,
        salesCount: data.salesCount || 0,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null,
      } as Product;
    });

    return { success: true, products };
  } catch (error) {
    console.error('Error getting featured products:', error);
    return { success: false, message: 'Failed to get featured products' };
  }
}