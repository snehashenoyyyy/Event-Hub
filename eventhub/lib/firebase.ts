// lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AiZaSyAvQZN-ru_g9K87lPCiDTbgn3ycDnfZHbc",
  authDomain: "eventhub-16a50.firebaseapp.com",
  projectId: "eventhub-16a50",
  storageBucket: "eventhub-16a50.firebasestorage.app",
  messagingSenderId: "1009225618999",
  appId: "1:1009225618999:web:b58adf07a6b5094213d1b2"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);