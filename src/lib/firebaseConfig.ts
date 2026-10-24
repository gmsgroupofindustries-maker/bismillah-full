/**
 * ------------------------------------------------------------------
 * BISMILLAH MOTORS - FIREBASE CONFIGURATION
 * ------------------------------------------------------------------
 * Easy manual Firebase API key configuration for cPanel (Apache)
 * and static website hosting.
 *
 * HOW TO USE ON CPANEL / HOSTING:
 * 1. Go to Firebase Console: https://console.firebase.google.com/
 * 2. Open Project Settings -> General -> "Your apps" -> Web app (</>)
 * 3. Copy your project credentials and paste them below in `manualFirebaseConfig`.
 * 4. If left blank, it will automatically fall back to VITE_ environment
 *    variables or the bundled project config.
 */

import appletConfig from '../../firebase-applet-config.json';

export interface FirebaseAppConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  firestoreDatabaseId: string;
  measurementId?: string;
  oAuthClientId?: string;
}

// >>> PASTE YOUR FIREBASE KEYS HERE IF DEPLOYING MANUALLY <<<
export const manualFirebaseConfig: Partial<FirebaseAppConfig> = {
  apiKey: '', // e.g. "AIzaSy..."
  authDomain: '', // e.g. "your-app.firebaseapp.com"
  projectId: '', // e.g. "your-app-id"
  storageBucket: '', // e.g. "your-app.appspot.com"
  messagingSenderId: '', // e.g. "123456789012"
  appId: '', // e.g. "1:123456789012:web:abcdef..."
  firestoreDatabaseId: '(default)', // Default is "(default)" unless custom named
};

// Check if manual keys are entered
const hasManualKey = Boolean(
  manualFirebaseConfig.apiKey &&
  manualFirebaseConfig.apiKey.trim() !== '' &&
  manualFirebaseConfig.apiKey !== 'YOUR_API_KEY'
);

// Resolve final configuration with prioritized fallbacks
export const resolvedFirebaseConfig: FirebaseAppConfig = {
  apiKey: hasManualKey
    ? manualFirebaseConfig.apiKey!
    : (import.meta.env.VITE_FIREBASE_API_KEY || appletConfig.apiKey || ''),
  authDomain: hasManualKey && manualFirebaseConfig.authDomain
    ? manualFirebaseConfig.authDomain
    : (import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || appletConfig.authDomain || ''),
  projectId: hasManualKey && manualFirebaseConfig.projectId
    ? manualFirebaseConfig.projectId
    : (import.meta.env.VITE_FIREBASE_PROJECT_ID || appletConfig.projectId || ''),
  storageBucket: hasManualKey && manualFirebaseConfig.storageBucket
    ? manualFirebaseConfig.storageBucket
    : (import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || appletConfig.storageBucket || ''),
  messagingSenderId: hasManualKey && manualFirebaseConfig.messagingSenderId
    ? manualFirebaseConfig.messagingSenderId
    : (import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || appletConfig.messagingSenderId || ''),
  appId: hasManualKey && manualFirebaseConfig.appId
    ? manualFirebaseConfig.appId
    : (import.meta.env.VITE_FIREBASE_APP_ID || appletConfig.appId || ''),
  firestoreDatabaseId: hasManualKey && manualFirebaseConfig.firestoreDatabaseId
    ? manualFirebaseConfig.firestoreDatabaseId
    : (import.meta.env.VITE_FIREBASE_DATABASE_ID || appletConfig.firestoreDatabaseId || '(default)'),
  measurementId: appletConfig.measurementId || '',
  oAuthClientId: appletConfig.oAuthClientId || '',
};

export default resolvedFirebaseConfig;
