import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA3diCvWY_Jgt4a_sRo_FMOfDXLQDNpNKI",
  authDomain: "chat-application-fad22.firebaseapp.com",
  projectId: "chat-application-fad22",
  storageBucket: "chat-application-fad22.firebasestorage.app",
  messagingSenderId: "125197941547",
  appId: "1:125197941547:web:4d4f6863f82e9a332ae36e",
  measurementId: "G-8Q2ZED27Z7"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
