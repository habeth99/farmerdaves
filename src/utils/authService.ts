import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
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
  createdAt?: any;
  updatedAt?: any;
}

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

// Sign out current user
export async function signOutUser(): Promise<void> {
  try {
    await signOut(auth);
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