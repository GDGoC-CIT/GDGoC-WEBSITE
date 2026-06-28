import { initializeApp, getApps } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyBRCgQm9CmBq0qJq-SDM23yupD8MkkOQ0E",
  authDomain: "gdgoc-cit.firebaseapp.com",
  projectId: "gdgoc-cit",
  storageBucket: "gdgoc-cit.firebasestorage.app",
  messagingSenderId: "257364338268",
  appId: "1:257364338268:web:c904b18de646151eb16899",
  measurementId: "G-XK1CTHHRW4"
};

// Prevent duplicate initialization in Next.js hot reload
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export default app;
