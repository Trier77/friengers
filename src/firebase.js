import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAMJ5hhd87xWnde-LmgV79FIiUvjWXBCOU",
  authDomain: "friengers-2a0a9.firebaseapp.com",
  projectId: "friengers-2a0a9",
  storageBucket: "friengers-2a0a9.firebasestorage.app",
  messagingSenderId: "989723981408",
  appId: "1:989723981408:web:aec8c704a8fa403e4f7505",
  measurementId: "G-DC3G5Z9SNS",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ AUTH instance (THIS WAS MISSING)
export const auth = getAuth(app);

// Optional
export const analytics = getAnalytics(app);
