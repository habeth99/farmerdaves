import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  User,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';

// Interface for user data
export interface UserData {
  email: string;
  fullName?: string;
  phoneNumber?: string;
  birthdate?: string;
  userType?: 'member' | 'admin';
  createdAt?: any;
  updatedAt?: any;
}

// Type for sign-in context
export type SignInContext = 'member' | 'admin';

// Admin email list
const ADMIN_EMAILS = ['cshantery7@gmail.com', 'testguy123@gmail.com', 'testadmin1@gmail.com'];

// Check if user is admin
export function isAdmin(email: string | null): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email);
}

// Initialize Google Auth Provider
const googleProvider = new GoogleAuthProvider();

// Create a new user account
export async function signUpUser(
  email: string, 
  password: string, 
  fullName?: string, 
  phoneNumber?: string, 
  birthdate?: string
): Promise<User> {
  try {
    // Create user with email and password
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Store additional user data in Firestore
    const userData: UserData = {
      email: user.email || email,
      fullName,
      phoneNumber,
      birthdate,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    // Save user data to Firestore in 'users' collection
    await setDoc(doc(db, 'users', user.uid), userData);

    console.log('User created successfully:', user.uid);
    return user;
  } catch (error: any) {
    console.error('Error creating user:', error);
    throw new Error(error.message || 'Failed to create user account');
  }
}

// Sign in an existing user
export async function signInUser(email: string, password: string): Promise<User> {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    console.error('Error signing in:', error);
    throw new Error(error.message || 'Failed to sign in');
  }
}

// Sign in user with context validation
export async function signInUserWithContext(
  email: string, 
  password: string, 
  context: SignInContext
): Promise<User> {
  try {
    // First check if it's admin portal and user is not admin
    if (context === 'admin' && !isAdmin(email)) {
      throw new Error('Admin not recognized. Please go to member sign in.');
    }

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Store the sign-in context in localStorage
    localStorage.setItem('signInContext', context);
    
    return userCredential.user;
  } catch (error: any) {
    console.error('Error signing in:', error);
    throw new Error(error.message || 'Failed to sign in');
  }
}

// Sign out current user
export async function signOutUser(): Promise<void> {
  try {
    await signOut(auth);
    // Clear sign-in context when signing out
    localStorage.removeItem('signInContext');
    console.log('User signed out successfully');
  } catch (error: any) {
    console.error('Error signing out:', error);
    throw new Error('Failed to sign out');
  }
}

// Get user profile data
export async function getUserProfile(userId: string): Promise<UserData | null> {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return userDoc.data() as UserData;
    } else {
      console.log('No user document found');
      return null;
    }
  } catch (error: any) {
    console.error('Error fetching user profile:', error);
    throw new Error('Failed to fetch user profile');
  }
}

// Get current authenticated user
export function getCurrentUser(): Promise<User | null> {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
}

// Update user profile data
export async function updateUserProfile(userId: string, userData: Partial<UserData>): Promise<void> {
  try {
    const userDocRef = doc(db, 'users', userId);
    
    // Add updatedAt timestamp
    const updateData = {
      ...userData,
      updatedAt: serverTimestamp()
    };

    await setDoc(userDocRef, updateData, { merge: true });
    console.log('User profile updated successfully');
  } catch (error: any) {
    console.error('Error updating user profile:', error);
    throw new Error('Failed to update profile');
  }
}

// Get current sign-in context
export function getSignInContext(): SignInContext | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('signInContext') as SignInContext | null;
}

// Set sign-in context
export function setSignInContext(context: SignInContext): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('signInContext', context);
  }
}

// Sign in with Google
export async function signInWithGoogle(): Promise<User> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Check if user document already exists
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      // Create new user document with member userType
      const userData: UserData = {
        email: user.email || '',
        fullName: user.displayName || '',
        userType: 'member', // All Google sign-ins get member status
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await setDoc(userDocRef, userData);
      console.log('New Google user created with member status:', user.uid);
    } else {
      // Update existing user's last sign-in time
      await setDoc(userDocRef, {
        updatedAt: serverTimestamp()
      }, { merge: true });
    }

    // Set sign-in context to member for Google users
    setSignInContext('member');
    
    return user;
  } catch (error: any) {
    console.error('Error signing in with Google:', error);
    throw new Error(error.message || 'Failed to sign in with Google');
  }
} 