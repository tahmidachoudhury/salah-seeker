import { initializeApp } from "firebase/app";
//firebase SDKs
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

//firebase config that identifies the firebase project salah-seeker 👍🏾👍🏾
const firebaseConfig = {
  apiKey: "AIzaSyC7s9zhb0wF6psdTAseUWvCJ1MVkeeB_Gg",
  authDomain: "salah-seeker.firebaseapp.com",
  projectId: "salah-seeker",
  storageBucket: "salah-seeker.firebasestorage.app",
  messagingSenderId: "445009979303",
  appId: "1:445009979303:web:0c8e0910f6c58359a33882",
  measurementId: "G-V14JJTPXYD",
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
//export the variables to be used outside
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
