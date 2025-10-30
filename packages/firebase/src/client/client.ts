import { initializeApp } from "firebase/app";
import { getFirestore as getFirestoreLite } from "firebase/firestore/lite";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyA30WoNkWKZEcvDHe2O-frSugl-XUtpFM4",
  authDomain: "cograder-ae0cd.firebaseapp.com",
  projectId: "cograder-ae0cd",
  storageBucket: "cograder-ae0cd.firebasestorage.app",
  messagingSenderId: "516952915069",
  appId: "1:516952915069:web:e40a02a1be1ec59fbb0514",
  measurementId: "G-KD4ZSZK1SR",
};

const app = initializeApp(firebaseConfig);
const db = getFirestoreLite(app);
const storage = getStorage(app);

export { app, db, storage };
