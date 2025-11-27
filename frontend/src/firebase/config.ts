
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCT_kLj7WVOD1CEMNhJRSJQ4nJQLEHapSA",
  authDomain: "tfg-daniel-santos.firebaseapp.com",
  projectId: "tfg-daniel-santos",
  storageBucket: "tfg-daniel-santos.firebasestorage.app",
  messagingSenderId: "1053974580011",
  appId: "1:1053974580011:web:14ef4627e33448a532d36e",
  measurementId: "G-K4CDDJ2N0K"
};


const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);