"use client"; 

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBuLBjRt5FxqJCCe7uNnsB_5HoyFSG0WFw",
  authDomain: "aury-19a45.firebaseapp.com",
  projectId: "aury-19a45",
  storageBucket: "aury-19a45.firebasestorage.app",
  messagingSenderId: "276320016112",
  appId: "1:276320016112:web:01825aa5fe8b5a3d6c9435",
  measurementId: "G-RJVJH56HW8"
};

// Initialize Firebase only once
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Export auth and firestore
export const auth = getAuth(app);
export const db = getFirestore(app);
