// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBidX4_0wL52C2PM6ZFo9vOCRviES8SUWQ",
  authDomain: "webcaytrong-19dc6.firebaseapp.com",
  projectId: "webcaytrong-19dc6",
  storageBucket: "webcaytrong-19dc6.firebasestorage.app",
  messagingSenderId: "504348565941",
  appId: "1:504348565941:web:5ce265ef3a4a0438e2b9fc",
  measurementId: "G-B7RFJWHBY6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);