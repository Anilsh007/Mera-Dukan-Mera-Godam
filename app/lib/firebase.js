import { initializeApp } from "firebase/app";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAk-8zmrfXiXMS2tFaqoY7RvSB82u-afxs",
  authDomain: "my-shop-31c96.firebaseapp.com",
  projectId: "my-shop-31c96",
  storageBucket: "my-shop-31c96.firebasestorage.app",
  messagingSenderId: "271437476922",
  appId: "1:271437476922:web:5ae996f20db4beda47b103",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();

// 🔥 Offline Persistence Enable
enableIndexedDbPersistence(db).catch((err) => {
  console.log("Offline error:", err);
});