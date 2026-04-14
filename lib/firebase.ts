/**
 * Firebase Configuration
 * Initialize Firebase for push notifications
 * 
 * To use this in production:
 * 1. Create a Firebase project at https://firebase.google.com
 * 2. Get your config from Firebase Console > Project Settings
 * 3. Add config values to environment variables
 */

import { initializeApp } from "firebase/app"
import { getMessaging, onMessage } from "firebase/messaging"

// Firebase config - in production, use environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBxxxxxxxxx",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "safe-space-xxxx.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "safe-space-xxxx",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "safe-space-xxxx.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:123456789:web:abcdef123456",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

let app: any = null
let messaging: any = null

/**
 * Initialize Firebase
 */
export function initializeFirebase() {
  if (typeof window === "undefined") return null

  if (!app) {
    try {
      app = initializeApp(firebaseConfig)
      messaging = getMessaging(app)
      console.log("Firebase initialized successfully")
    } catch (error) {
      console.error("Failed to initialize Firebase:", error)
    }
  }

  return app
}

/**
 * Get Firebase Messaging instance
 */
export function getFirebaseMessaging() {
  if (!messaging && typeof window !== "undefined") {
    initializeFirebase()
  }
  return messaging
}

/**
 * Listen for foreground messages
 */
export function listenForMessages(callback: (payload: any) => void) {
  const firebaseMessaging = getFirebaseMessaging()
  if (!firebaseMessaging) {
    console.warn("Firebase Messaging not available")
    return () => {}
  }

  try {
    return onMessage(firebaseMessaging, callback)
  } catch (error) {
    console.error("Error setting up message listener:", error)
    return () => {}
  }
}

export { initializeApp } from "firebase/app"
export { getMessaging } from "firebase/messaging"
