/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';

import { firebaseDb } from '@/firebase/admin';
import { getCurrentUser } from './auth.action';
import { FieldValue } from 'firebase-admin/firestore';

export async function createProduct(params: CreateProductParams) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return {
        success: false,
        message: 'You must be logged in to create a product',
      };
    }

    if (user.role !== 'creator' && user.role !== 'craft-business') {
      return {
        success: false,
        message: 'Only creators and craft businesses can create products',
      };
    }

    const { 
      name, 
      description, 
      price, 
      originalPrice, 
      category, 
      imageUrl, 
      stock,
      materials,
      difficulty,
      tags 
    } = params;

    if (!name.trim() || !description.trim() || price <= 0) {
      return {
        success: false,
        message: 'Please provide valid product information',
      };
    }

    const productData = {
      name: name.trim(),
      description: description.trim(),
      price,
      originalPrice: originalPrice || null,
      category,
      imageUrl: imageUrl || null,
      stock: stock || 0,
      materials: materials || [],
      difficulty: difficulty || 'beginner',
      tags: tags || [],
      sellerId: user.id,
      sellerName: user.name,
      sellerType: user.role,
      rating: 0,
      reviewCount: 0,
      salesCount: 0,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    const docRef = await firebaseDb.collection('products').add(productData);

    return {
      success: true,
      productId: docRef.id,
      message: 'Product created successfully',
    };
  } catch (error) {
    console.error('Error creating product:', error);
    return {
      success: false,
      message: 'Failed to create product. Please try again.',
    };
  }
}

export async function getProducts(filters?: ProductFilters) {
  try {
    let query: FirebaseFirestore.Query = firebaseDb.collection('products');

    // Apply filters
    if (filters?.category && filters.category !== 'All Categories') {
      query = query.where('category', '==', filters.category);
    }

    if (filters?.minPrice !== undefined) {
      query = query.where('price', '>=', filters.minPrice);
    }

    if (filters?.maxPrice !== undefined && filters.maxPrice !== Infinity) {
      query = query.where('price', '<=', filters.maxPrice);
    }

    if (filters?.sellerId) {
      query = query.where('sellerId', '==', filters.sellerId);
    }

    // Apply sorting
    switch (filters?.sortBy) {
      case 'price_asc':
        query = query.orderBy('price', 'asc');
        break;
      case 'price_desc':
        query = query.orderBy('price', 'desc');
        break;
      case 'popular':
        query = query.orderBy('salesCount', 'desc');
        break;
      default:
        query = query.orderBy('createdAt', 'desc');
    }

    const productsSnapshot = await query.limit(50).get();

    const products: Product[] = productsSnapshot.docs.map((doc) => {
      const data = doc.data() as Record<string, unknown>;
      const createdAt = (data?.createdAt as any)?.toDate ? (data as any).createdAt.toDate().toISOString() : null;
      const updatedAt = (data?.updatedAt as any)?.toDate ? (data as any).updatedAt.toDate().toISOString() : null;

      return {
        id: doc.id,
        name: data.name as string,
        description: data.description as string,
        price: data.price as number,
        originalPrice: (data.originalPrice as number) || null,
        category: data.category as string,
        imageUrl: (data.imageUrl as string) || null,
        stock: (data.stock as number) || 0,
        materials: (data.materials as string[]) || [],
        difficulty: (['beginner', 'intermediate', 'advanced'].includes(data.difficulty as string) 
          ? data.difficulty 
          : 'beginner') as 'beginner' | 'intermediate' | 'advanced',
        tags: (data.tags as string[]) || [],
        sellerId: data.sellerId as string,
        sellerName: data.sellerName as string,
        sellerType: data.sellerType as 'creator' | 'craft-business',
        rating: (data.rating as number) || 0,
        reviewCount: (data.reviewCount as number) || 0,
        salesCount: (data.salesCount as number) || 0,
        createdAt,
        updatedAt,
      } as Product;
    });

    return {
      success: true,
      products,
    };
  } catch (error) {
    console.error('Error fetching products:', error);
    return {
      success: false,
      message: 'Failed to load products. Please try again.',
      products: [],
    };
  }
}

export async function getProductById(productId: string) {
  try {
    const doc = await firebaseDb.collection('products').doc(productId).get();
    
    if (!doc.exists) {
      return {
        success: false,
        message: 'Product not found',
      };
    }

    const data = doc.data() as Record<string, unknown>;
    const createdAt = (data?.createdAt as any)?.toDate ? (data as any).createdAt.toDate().toISOString() : null;
    const updatedAt = (data?.updatedAt as any)?.toDate ? (data as any).updatedAt.toDate().toISOString() : null;

    const product: Product = {
      id: doc.id,
      name: data.name as string,
      description: data.description as string,
      price: data.price as number,
      originalPrice: (data.originalPrice as number) || null,
      category: data.category as string,
      imageUrl: (data.imageUrl as string) || null,
      stock: (data.stock as number) || 0,
      materials: (data.materials as string[]) || [],
      difficulty: (['beginner', 'intermediate', 'advanced'].includes(data.difficulty as string)
        ? (data.difficulty as 'beginner' | 'intermediate' | 'advanced')
        : 'beginner'),
      tags: (data.tags as string[]) || [],
      sellerId: data.sellerId as string,
      sellerName: data.sellerName as string,
      sellerType: data.sellerType as 'creator' | 'craft-business',
      rating: (data.rating as number) || 0,
      reviewCount: (data.reviewCount as number) || 0,
      salesCount: (data.salesCount as number) || 0,
      createdAt,
      updatedAt,
    };

    return {
      success: true,
      product,
    };
  } catch (error) {
    console.error('Error fetching product:', error);
    return {
      success: false,
      message: 'Failed to load product. Please try again.',
    };
  }
}

export async function updateProduct(productId: string, params: Partial<CreateProductParams>) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return {
        success: false,
        message: 'You must be logged in to update products',
      };
    }

    // Check if user owns the product
    const productDoc = await firebaseDb.collection('products').doc(productId).get();
    if (!productDoc.exists) {
      return {
        success: false,
        message: 'Product not found',
      };
    }

    const productData = productDoc.data();
    if (productData?.sellerId !== user.id) {
      return {
        success: false,
        message: 'You can only update your own products',
      };
    }

    const updateData = {
      ...params,
      updatedAt: FieldValue.serverTimestamp(),
    };

    await firebaseDb.collection('products').doc(productId).update(updateData);

    return {
      success: true,
      message: 'Product updated successfully',
    };
  } catch (error) {
    console.error('Error updating product:', error);
    return {
      success: false,
      message: 'Failed to update product. Please try again.',
    };
  }
}

export async function deleteProduct(productId: string) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return {
        success: false,
        message: 'You must be logged in to delete products',
      };
    }

    // Check if user owns the product
    const productDoc = await firebaseDb.collection('products').doc(productId).get();
    if (!productDoc.exists) {
      return {
        success: false,
        message: 'Product not found',
      };
    }

    const productData = productDoc.data();
    if (productData?.sellerId !== user.id) {
      return {
        success: false,
        message: 'You can only delete your own products',
      };
    }

    await firebaseDb.collection('products').doc(productId).delete();

    return {
      success: true,
      message: 'Product deleted successfully',
    };
  } catch (error) {
    console.error('Error deleting product:', error);
    return {
      success: false,
      message: 'Failed to delete product. Please try again.',
    };
  }
}