'use server';

import { firebaseDb } from '@/firebase/admin';
import { getCurrentUser } from './auth.action';
import { FieldValue } from 'firebase-admin/firestore';
import { PatternProductParams } from '@/types';

export async function createPatternProduct(params: PatternProductParams) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return {
        success: false,
        message: 'You must be logged in to create a pattern product',
      };
    }

    if (user.role !== 'creator' && user.role !== 'craft-business') {
      return {
        success: false,
        message: 'Only creators and craft businesses can create pattern products',
      };
    }

    const { 
      name, 
      description, 
      price, 
      category, 
      imageUrl, 
      materials,
      difficulty,
      tags,
      patternContent,
      patternData
    } = params;

    if (!name.trim() || !description.trim() || price <= 0 || !patternContent.trim()) {
      return {
        success: false,
        message: 'Please provide valid pattern information',
      };
    }

    const productData = {
      name: name.trim(),
      description: description.trim(),
      price,
      originalPrice: null,
      category: category || 'crochet pattern',
      imageUrl: imageUrl || null,
      // Don't include stock field for digital pattern products
      materials: materials || [],
      difficulty: difficulty || 'beginner',
      tags: tags || [],
      sellerId: user.id,
      sellerName: user.name,
      sellerType: user.role,
      rating: 0,
      reviewCount: 0,
      salesCount: 0,
      productType: 'pattern', // Mark as digital pattern
      patternContent: patternContent, // Store the actual pattern
      patternData: patternData, // Store pattern metadata
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    const docRef = await firebaseDb.collection('products').add(productData);

    return {
      success: true,
      productId: docRef.id,
      message: 'Pattern added to marketplace successfully',
    };
  } catch (error) {
    console.error('Error creating pattern product:', error);
    return {
      success: false,
      message: 'Failed to add pattern to marketplace. Please try again.',
    };
  }
}