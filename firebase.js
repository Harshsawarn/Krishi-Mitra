import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";



// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCOnocwRlMIzHEh0tGLgc1ek3WX_lemh58",
  authDomain: "bihar-agri-market.firebaseapp.com",
  projectId: "bihar-agri-market",
  storageBucket: "bihar-agri-market.firebasestorage.app",
  messagingSenderId: "410117426701",
  appId: "1:410117426701:web:8d80bb7a20215f481f0f44"
};



const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);