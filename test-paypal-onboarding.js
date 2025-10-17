#!/usr/bin/env node

/**
 * Test script for PayPal onboarding API
 * 
 * Usage:
 *   node test-paypal-onboarding.js
 * 
 * Or with custom values:
 *   node test-paypal-onboarding.js YOUR_USER_ID your-email@example.com
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

async function testOnboarding() {
  const sellerId = process.argv[2] || 'test-seller-123';
  const paypalEmail = process.argv[3] || 'test@example.com';

  console.log('🧪 Testing PayPal Onboarding API\n');
  console.log(`Seller ID: ${sellerId}`);
  console.log(`PayPal Email: ${paypalEmail}\n`);

  try {
    console.log('📤 Sending POST request to /api/onboard-seller...');
    
    const response = await fetch(`${BASE_URL}/api/onboard-seller`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sellerId: sellerId,
        paypalEmail: paypalEmail,
      }),
    });

    const data = await response.json();

    console.log(`\n📥 Response Status: ${response.status}`);
    console.log('📥 Response Body:', JSON.stringify(data, null, 2));

    if (data.success) {
      console.log('\n✅ SUCCESS! Seller onboarded successfully!');
      
      // Now verify
      console.log('\n🔍 Verifying onboarding status...');
      const verifyResponse = await fetch(
        `${BASE_URL}/api/onboard-seller/verify?sellerId=${sellerId}`
      );
      const verifyData = await verifyResponse.json();
      console.log('📥 Verification Response:', JSON.stringify(verifyData, null, 2));
      
      if (verifyData.success) {
        console.log('\n✅ Verification successful!');
        console.log(`   PayPal Email: ${verifyData.paypalEmail}`);
        console.log(`   Onboarding Complete: ${verifyData.onboardingComplete}`);
      }
    } else {
      console.log('\n❌ FAILED:', data.error);
    }
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
  }
}

testOnboarding();
