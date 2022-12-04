// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: "chatroom-2bf9b.firebaseapp.com",
  databaseURL: "https://chatroom-2bf9b-default-rtdb.firebaseio.com",
  projectId: "chatroom-2bf9b",
  storageBucket: "chatroom-2bf9b.appspot.com",
  messagingSenderId: "559853116196",
  appId: "1:559853116196:web:a57bcfc7da76e0132031b1",
  measurementId: "G-33Q6NPJY03",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const storage = getStorage(app);

export {db, storage};