// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCnPVSy47lmw8ni7mdzo9jsmdUuMftpFOs",
  authDomain: "pasoja-bac1d.firebaseapp.com",
  projectId: "pasoja-bac1d",
  storageBucket: "pasoja-bac1d.firebasestorage.app",
  messagingSenderId: "98514801092",
  appId: "1:98514801092:web:ecd64ccb9c38d649099491",
  measurementId: "G-9QSQX4XC1V"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
