import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDdTFeXOSrCHcJ76_IZWKDjSZmErsyEYfk",
    authDomain: "taxirate-2f843.firebaseapp.com",
    projectId: "taxirate-2f843",
    storageBucket: "taxirate-2f843.firebasestorage.app",
    messagingSenderId: "320293875416",
    appId: "1:320293875416:web:8d81e2fdd958ed2e64b1ad",
    measurementId: "G-5NLLP8WF5W"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
