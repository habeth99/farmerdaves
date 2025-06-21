// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAMPk1zW0Wk8EFaOlOu8mNyu7PPGQw744Q",
  authDomain: "farmerdaves-e97a7.firebaseapp.com",
  projectId: "farmerdaves-e97a7",
  storageBucket: "farmerdaves-e97a7.firebasestorage.app",
  messagingSenderId: "833721238593",
  appId: "1:833721238593:web:b8a1fac28d9559be8bb2c0",
  measurementId: "G-LJ9EMQCYWB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);

// Initialize Analytics (only in browser environment)
let analytics;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export { analytics };
