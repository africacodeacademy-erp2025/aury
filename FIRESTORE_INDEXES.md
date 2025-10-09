# Firestore Indexes

Firebase requires composite indexes for certain queries. Add these to your `firestore.indexes.json` or create them through the Firebase Console.

## Required Indexes

### Products Collection

1. **Category + Created At**
   - Collection: `products`
   - Fields:
     - `category` (Ascending)
     - `createdAt` (Descending)

2. **Seller + Created At**
   - Collection: `products`
   - Fields:
     - `sellerId` (Ascending)
     - `createdAt` (Descending)

3. **Price Range + Created At**
   - Collection: `products`
   - Fields:
     - `price` (Ascending)
     - `createdAt` (Descending)

### Orders Collection

1. **Seller + Created At**
   - Collection: `orders`
   - Fields:
     - `sellerId` (Ascending)
     - `createdAt` (Descending)

2. **Customer + Created At**
   - Collection: `orders`
   - Fields:
     - `customerId` (Ascending)
     - `createdAt` (Descending)

3. **Status + Created At**
   - Collection: `orders`
   - Fields:
     - `status` (Ascending)
     - `createdAt` (Descending)

### Posts Collection

1. **Author + Created At**
   - Collection: `posts`
   - Fields:
     - `authorId` (Ascending)
     - `createdAt` (Descending)

### Users Collection

1. **Stripe Account Lookup**
   - Collection: `users`
   - Fields:
     - `stripeAccountId` (Ascending)

## Creating Indexes

### Option 1: Through Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Navigate to **Firestore Database** → **Indexes**
4. Click **Create Index**
5. Add the collection and fields as specified above

### Option 2: Using firestore.indexes.json

Create a `firestore.indexes.json` file in your project root:

\`\`\`json
{
  "indexes": [
    {
      "collectionGroup": "products",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "category", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "products",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "sellerId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "products",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "price", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "orders",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "sellerId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "orders",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "customerId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "orders",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "posts",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "authorId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "users",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "stripeAccountId", "order": "ASCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
}
\`\`\`

Then deploy using Firebase CLI:

\`\`\`bash
firebase deploy --only firestore:indexes
\`\`\`

### Option 3: Automatic Creation

When you run queries that require indexes, Firebase will throw an error with a link to create the index automatically. Click the link to create the index.

## Security Rules

Also update your Firestore Security Rules to include the new fields:

\`\`\`javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
      
      // Allow updates to Stripe fields only from server
      allow update: if request.auth != null && 
                      request.auth.uid == userId &&
                      !request.resource.data.diff(resource.data).affectedKeys()
                        .hasAny(['stripeAccountId', 'stripeOnboardingComplete']);
    }
    
    // Products collection
    match /products/{productId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
                              request.auth.uid == resource.data.sellerId;
    }
    
    // Orders collection
    match /orders/{orderId} {
      allow read: if request.auth != null && 
                    (request.auth.uid == resource.data.sellerId || 
                     request.auth.uid == resource.data.customerId);
      allow create: if request.auth != null;
    }
    
    // Platform earnings (admin only)
    match /platformEarnings/{earningId} {
      allow read: if false; // Only through admin SDK
      allow write: if false; // Only through admin SDK
    }
  }
}
\`\`\`
