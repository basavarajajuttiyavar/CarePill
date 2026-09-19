import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDZ3U_yP6jF7w1b8pW_-A8iu9GsEKm-R6A",
  authDomain: "family-medicine-tracker-76396.firebaseapp.com",
  projectId: "family-medicine-tracker-76396",
  storageBucket: "family-medicine-tracker-76396.firebasestorage.app",
  messagingSenderId: "844116457159",
  appId: "1:844116457159:web:34425b9c3aaea31a3330e2",
  measurementId: "G-9G42BBNJ1Z"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);