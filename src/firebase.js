import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAMJ5hhd87xWnde-LmgV79FIiUvjWXBCOU",
  authDomain: "friengers-2a0a9.firebaseapp.com",
  projectId: "friengers-2a0a9",
  storageBucket: "friengers-2a0a9.firebasestorage.app",
  messagingSenderId: "989723981408",
  appId: "1:989723981408:web:aec8c704a8fa403e4f7505",
  measurementId: "G-DC3G5Z9SNS",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const analytics = getAnalytics(app);

export const db = getFirestore(app);

export const storage =getStorage(app);
