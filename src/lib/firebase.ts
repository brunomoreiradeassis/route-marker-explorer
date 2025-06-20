
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBL-w1LFDs5dNg7YGDx-BIEkMjNzYUGArM",
  authDomain: "logxdelivery.firebaseapp.com",
  projectId: "logxdelivery",
  storageBucket: "logxdelivery.firebasestorage.app",
  messagingSenderId: "54758774266",
  appId: "1:54758774266:web:e02e2bbcc024b8d4814043",
  measurementId: "G-S73HYV41ZK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth, analytics };
export default app;
