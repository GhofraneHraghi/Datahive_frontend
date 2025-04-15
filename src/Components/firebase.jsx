import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// 📌 Remplacez ces valeurs par celles de votre projet Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDSghreBSs-69hx7vYjr7Vx-L7IJd-2laI",
  authDomain: "register-911d1.firebaseapp.com",
  projectId: "register-911d1",
  storageBucket: "register-911d1.firebasestorage.app",
  messagingSenderId: "234491607982",
  appId: "1:234491607982:web:0c78b979c9b1ee2027663f",
  measurementId: "G-TQ0XXHBJRB"
};

// Initialisation Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Configuration de Google Auth
export const googleProvider = new GoogleAuthProvider();

// Fonction de connexion avec Google
export const signInWithGoogle = async () => {
  try {
    // Request additional profile information
    googleProvider.addScope('profile');
    googleProvider.addScope('email');
    // Optional: Request phone number if available
    googleProvider.addScope('https://www.googleapis.com/auth/user.phonenumbers.read');
    
    const result = await signInWithPopup(auth, googleProvider);
    
    // Get the Google access token
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential.accessToken;
    
    // The signed-in user info
    return result.user;
  } catch (error) {
    console.error("Erreur lors de l'authentification avec Google :", error);
    return null;
  }
};

export default app;