import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  User
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';

// Interface for user data
export interface UserData {
  email: string;
  createdAt?: any;
  updatedAt?: any;
}

// Create a new user account
export async function signUpUser(email: string, password: string): Promise<User> {
  try {
    // Create user with email and password
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Store additional user data in Firestore
    const userData: UserData = {
      email: user.email || email,
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
    throw new Error(error.message || 'Failed to sign out');
  }
} 