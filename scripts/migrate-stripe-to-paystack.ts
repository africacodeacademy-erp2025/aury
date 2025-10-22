/**
 * Migration Script: Stripe to Paystack
 * 
 * This script migrates existing Stripe data to the new Paystack structure.
 * It is idempotent and can be run multiple times safely.
 * 
 * Usage: npm run migrate:paystack
 */

// Load environment variables FIRST before any other imports
import { config } from 'dotenv';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env.local file
const result = config({ path: resolve(__dirname, '../.env.local') });

if (result.error) {
  console.error('❌ Error loading .env.local:', result.error.message);
  console.error('⚠️  Make sure .env.local exists in the root directory');
  process.exit(1);
}

console.log('✅ Environment variables loaded from .env.local');

// Verify required environment variables
if (!process.env.FIREBASE_PROJECT_ID) {
  console.error('❌ Error: FIREBASE_PROJECT_ID is not set in .env.local');
  process.exit(1);
}

if (!process.env.FIREBASE_CLIENT_EMAIL) {
  console.error('❌ Error: FIREBASE_CLIENT_EMAIL is not set in .env.local');
  process.exit(1);
}

if (!process.env.FIREBASE_PRIVATE_KEY) {
  console.error('❌ Error: FIREBASE_PRIVATE_KEY is not set in .env.local');
  process.exit(1);
}

console.log('✅ Firebase credentials verified\n');

// Main migration function with dynamic imports
async function runMigration() {
  // Import Firebase modules AFTER environment variables are loaded
  const { firebaseDb } = await import('../firebase/admin.js');
  const { FieldValue } = await import('firebase-admin/firestore');

  console.log('╔════════════════════════════════════════════╗');
  console.log('║   Stripe to Paystack Migration Script     ║');
  console.log('╚════════════════════════════════════════════╝\n');

  interface MigrationStats {
    usersProcessed: number;
    usersUpdated: number;
    usersSkipped: number;
    ordersProcessed: number;
    transactionsCreated: number;
    errors: Array<{ id: string; error: string }>;
  }

  async function migrateUsers(): Promise<MigrationStats> {
    console.log('🔄 Starting user migration...\n');

    const stats: MigrationStats = {
      usersProcessed: 0,
      usersUpdated: 0,
      usersSkipped: 0,
      ordersProcessed: 0,
      transactionsCreated: 0,
      errors: [],
    };

    try {
      // Get all users with Stripe accounts
      const usersSnapshot = await firebaseDb
        .collection('users')
        .where('stripeAccountId', '!=', null)
        .get();

      console.log(`Found ${usersSnapshot.size} users with Stripe accounts\n`);

      for (const userDoc of usersSnapshot.docs) {
        stats.usersProcessed++;
        const userId = userDoc.id;
        const userData = userDoc.data();

        try {
          // Check if already migrated
          if (userData.paymentProvider === 'paystack') {
            console.log(`⏭️  User ${userId} already migrated, skipping...`);
            stats.usersSkipped++;
            continue;
          }

          // Prepare update data
          const updateData: any = {
            // Keep existing Stripe data for historical reference
            // Add Paystack fields
            paystackOnboardingComplete: false, // Seller needs to re-onboard with Paystack
            paymentProvider: 'paystack',
            migratedAt: FieldValue.serverTimestamp(),
          };

          // Update user document
          await firebaseDb.collection('users').doc(userId).update(updateData);

          console.log(`✅ Migrated user ${userId} (${userData.email})`);
          stats.usersUpdated++;
        } catch (error: any) {
          console.error(`❌ Error migrating user ${userId}:`, error.message);
          stats.errors.push({ id: userId, error: error.message });
        }
      }

      console.log('\n📊 User Migration Summary:');
      console.log(`   Processed: ${stats.usersProcessed}`);
      console.log(`   Updated: ${stats.usersUpdated}`);
      console.log(`   Skipped: ${stats.usersSkipped}`);
      console.log(`   Errors: ${stats.errors.length}\n`);

      return stats;
    } catch (error) {
      console.error('❌ Fatal error in user migration:', error);
      throw error;
    }
  }

  async function migrateOrders(stats: MigrationStats): Promise<void> {
    console.log('🔄 Starting order migration...\n');

    try {
      // Get all orders
      const ordersSnapshot = await firebaseDb
        .collection('orders')
        .orderBy('createdAt', 'desc')
        .get();

      console.log(`Found ${ordersSnapshot.size} orders\n`);

      for (const orderDoc of ordersSnapshot.docs) {
        stats.ordersProcessed++;
        const orderId = orderDoc.id;
        const orderData = orderDoc.data();

        try {
          // Check if already migrated
          if (orderData.paymentProvider) {
            stats.usersSkipped++;
            continue;
          }

          // Update order to mark as Stripe for historical tracking
          await firebaseDb.collection('orders').doc(orderId).update({
            paymentProvider: 'stripe',
            stripeSessionId: orderData.sessionId || null,
          });

          // Create a transaction record for historical reference
          if (orderData.status === 'paid' || orderData.paymentStatus === 'paid') {
            const transactionData = {
              reference: `MIGRATED_STRIPE_${orderId}`,
              paystackReference: `MIGRATED_STRIPE_${orderId}`,
              
              buyerId: orderData.customerId || 'unknown',
              buyerEmail: orderData.customerEmail || '',
              sellerId: orderData.sellerId || '',
              sellerName: orderData.sellerName || '',
              
              productId: orderData.productId || '',
              productName: orderData.productName || '',
              productType: orderData.productType || 'physical',
              
              amountKobo: Math.round((orderData.amount || 0) * 100),
              platformFeeKobo: Math.round((orderData.amount || 0) * 0.05 * 100),
              sellerGrossKobo: Math.round((orderData.amount || 0) * 0.95 * 100),
              
              currency: orderData.currency?.toUpperCase() || 'ZAR',
              
              status: 'success',
              paymentStatus: 'paid',
              
              createdAt: orderData.createdAt || FieldValue.serverTimestamp(),
              paidAt: orderData.createdAt || FieldValue.serverTimestamp(),
              updatedAt: FieldValue.serverTimestamp(),
              
              migratedFrom: 'stripe',
              stripePaymentIntentId: orderData.paymentIntentId || null,
              stripeSessionId: orderData.sessionId || null,
              
              metadata: {
                orderId: orderId,
                migrated: true,
              },
            };

            await firebaseDb.collection('transactions').add(transactionData);
            stats.transactionsCreated++;
          }

          if (stats.ordersProcessed % 10 === 0) {
            console.log(`   Processed ${stats.ordersProcessed} orders...`);
          }
        } catch (error: any) {
          console.error(`❌ Error migrating order ${orderId}:`, error.message);
          stats.errors.push({ id: orderId, error: error.message });
        }
      }

      console.log('\n📊 Order Migration Summary:');
      console.log(`   Processed: ${stats.ordersProcessed}`);
      console.log(`   Transactions created: ${stats.transactionsCreated}`);
      console.log(`   Skipped: ${stats.usersSkipped}\n`);
    } catch (error) {
      console.error('❌ Fatal error in order migration:', error);
      throw error;
    }
  }

  async function createIndexes(): Promise<void> {
    console.log('📇 Creating Firestore indexes...\n');
    
    console.log('⚠️  Firestore indexes must be created manually or via Firebase CLI.');
    console.log('   Required indexes:\n');
    
    console.log('   1. Collection: transactions');
    console.log('      Fields: sellerId (Ascending), status (Ascending), createdAt (Descending)\n');
    
    console.log('   2. Collection: transactions');
    console.log('      Fields: buyerId (Ascending), status (Ascending), createdAt (Descending)\n');
    
    console.log('   3. Collection: transactions');
    console.log('      Fields: paystackReference (Ascending)\n');
    
    console.log('   4. Collection: webhook_logs');
    console.log('      Fields: eventId (Ascending)\n');
    
    console.log('   5. Collection: webhook_logs');
    console.log('      Fields: processed (Ascending), createdAt (Descending)\n');
    
    console.log('   Run: firebase deploy --only firestore:indexes');
    console.log('   Or create them in the Firebase Console\n');
  }

  const startTime = Date.now();

  try {
    // Step 1: Migrate users
    const stats = await migrateUsers();

    // Step 2: Migrate orders and create transaction records
    await migrateOrders(stats);

    // Step 3: Display index creation instructions
    await createIndexes();

    // Final summary
    const duration = Math.round((Date.now() - startTime) / 1000);
    
    console.log('\n╔════════════════════════════════════════════╗');
    console.log('║           Migration Completed!             ║');
    console.log('╚════════════════════════════════════════════╝\n');
    
    console.log('📊 Final Statistics:');
    console.log(`   Users processed: ${stats.usersProcessed}`);
    console.log(`   Users updated: ${stats.usersUpdated}`);
    console.log(`   Orders processed: ${stats.ordersProcessed}`);
    console.log(`   Transactions created: ${stats.transactionsCreated}`);
    console.log(`   Errors: ${stats.errors.length}`);
    console.log(`   Duration: ${duration}s\n`);

    if (stats.errors.length > 0) {
      console.log('⚠️  Errors encountered:');
      stats.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error.id}: ${error.error}`);
      });
      console.log('');
    }

    console.log('✅ Next steps:');
    console.log('   1. Create Firestore indexes (see instructions above)');
    console.log('   2. Configure Paystack environment variables');
    console.log('   3. Test seller onboarding flow');
    console.log('   4. Test checkout flow with Paystack test cards');
    console.log('   5. Notify sellers to complete Paystack onboarding\n');

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
runMigration()
  .then(() => {
    console.log('✨ Migration script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Migration script failed:', error);
    process.exit(1);
  });
