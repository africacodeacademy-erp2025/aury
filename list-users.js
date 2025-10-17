#!/usr/bin/env node

/**
 * List users from Firebase to find a seller ID for testing
 * 
 * Usage:
 *   node list-users.js
 */

const admin = require('firebase-admin');
const fs = require('fs');

// Load environment variables manually
const envContent = fs.readFileSync('.env.local', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length) {
    env[key.trim()] = valueParts.join('=').trim();
  }
});

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: env.FIREBASE_PROJECT_ID,
      clientEmail: env.FIREBASE_CLIENT_EMAIL,
      privateKey: env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = admin.firestore();

async function listUsers() {
  try {
    console.log('🔍 Fetching users from Firebase...\n');
    
    const usersSnapshot = await db.collection('users').limit(10).get();
    
    if (usersSnapshot.empty) {
      console.log('❌ No users found in the database.');
      console.log('\n💡 You need to create a user first before testing PayPal onboarding.');
      console.log('   Sign up through your app, or create a user manually in Firebase console.');
      return;
    }
    
    console.log(`✅ Found ${usersSnapshot.size} users:\n`);
    
    usersSnapshot.forEach((doc, index) => {
      const data = doc.data();
      console.log(`${index + 1}. User ID: ${doc.id}`);
      console.log(`   Name: ${data.name || 'N/A'}`);
      console.log(`   Email: ${data.email || 'N/A'}`);
      console.log(`   Role: ${data.role || 'N/A'}`);
      console.log(`   PayPal Email: ${data.paypalEmail || 'Not set'}`);
      console.log(`   Onboarding Complete: ${data.onboardingComplete || false}`);
      console.log('');
    });
    
    const firstUser = usersSnapshot.docs[0];
    const firstUserData = firstUser.data();
    
    console.log('\n💡 To test with the first user, run:');
    console.log(`   node test-paypal-onboarding.js ${firstUser.id} your-paypal@example.com`);
    
    if (firstUserData.role === 'creator' || firstUserData.role === 'craft-business') {
      console.log('\n✅ This user is a seller, perfect for testing!');
    } else {
      console.log('\n⚠️  Note: This user is a customer. PayPal onboarding is typically for sellers.');
      console.log('   It will still work for testing purposes.');
    }
    
  } catch (error) {
    console.error('❌ Error fetching users:', error.message);
  }
}

listUsers();
