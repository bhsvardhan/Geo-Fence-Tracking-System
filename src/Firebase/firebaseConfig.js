import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAboRr3dyPBd1pzX5a4cmsUZma9XlacwMU",
  authDomain: "tracking-system-fd1bf.firebaseapp.com",
  databaseURL: "https://tracking-system-fd1bf-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "tracking-system-fd1bf",
  storageBucket: "http://tracking-system-fd1bf.firebasestorage.app",
  messagingSenderId: "802678586932",
  appId: "1:802678586932:web:9bd80a6673c40b22f2d461",
  measurementId: "G-7CH25GCQHB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database, ref, onValue };
