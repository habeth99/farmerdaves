import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin SDK for server-side operations
const firebaseAdminConfig = {
  projectId: "farmerdaves-e97a7",
  // For production, you'll want to use a service account key
  // For development, we'll use the project ID and rely on default credentials
};

// Initialize the admin app if it hasn't been initialized yet
const adminApp = getApps().length === 0 
  ? initializeApp(firebaseAdminConfig, 'admin')
  : getApps()[0];

// Get Firestore instance for server-side operations
export const adminDb = getFirestore(adminApp);

export default adminApp; 