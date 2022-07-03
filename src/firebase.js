import { initializeApp } from "firebase/app";
import firebase from 'firebase/compat/app'
import { getAnalytics } from "firebase/analytics";
// import "firebase/auth";
import "firebase/compat/database";
import "firebase/compat/storage"
import 'firebase/compat/auth';
import 'firebase/compat/firestore';


const firebaseConfig = {
  apiKey: "AIzaSyDlMZGxbS-Lj9vvfvYvITsY0hbBdVWI2Us",
  authDomain: "react-slack-clone-d60bc.firebaseapp.com",
  projectId: "react-slack-clone-d60bc",
  storageBucket: "react-slack-clone-d60bc.appspot.com",
  messagingSenderId: "708282051844",
  appId: "1:708282051844:web:b127ac5db101d434fe7451",
  measurementId: "G-X9CVY96XT4"
};

const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

firebase.initializeApp(firebaseConfig)

export default firebase;        