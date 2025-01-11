import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDCccVPOp-ZvmbH7xFkfz5zfwg7LzUc8js",
  authDomain: "free2ed.firebaseapp.com",
  projectId: "free2ed",
  storageBucket: "free2ed.appspot.com",
  messagingSenderId: "178155858660",
  appId: "1:178155858660:web:31725fcd9fa401164e1af1",
  measurementId: "G-MGYV3M5Z0L"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Add Google Auth Provider
export const provider = new GoogleAuthProvider();

// Add signInWithGoogle function
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google: ", error);
    throw error;
  }
};
