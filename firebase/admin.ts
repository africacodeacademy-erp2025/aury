// firebase/admin.ts
import { cert, getApps, initializeApp, App } from "firebase-admin/app";
import { getAuth, Auth } from "firebase-admin/auth";
import { getFirestore, Firestore } from "firebase-admin/firestore";

interface FirebaseAdmin {
  auth: Auth;
  db: Firestore;
}

const initFirebaseAdmin = (): FirebaseAdmin => {
  // Check if Firebase Admin is already initialized
  let app: App;
  if (!getApps().length) {
    app = initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Replace escaped newlines with real ones
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
      // Optional: add databaseURL if needed
      databaseURL: process.env.FIREBASE_DATABASE_URL,
    });
  } else {
    app = getApps()[0];
  }

  return {
    auth: getAuth(app),
    db: getFirestore(app),
  };
};

// Export singleton instances for use in API routes
export const { auth: firebaseAuth, db: firebaseDb } = initFirebaseAdmin();
