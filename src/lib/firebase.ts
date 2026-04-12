import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyCEvBTGmGSlGquQSHK2RFXd8-ig1bAXgJo",
  authDomain: "tcet-connect.firebaseapp.com",
  projectId: "tcet-connect",
  storageBucket: "tcet-connect.firebasestorage.app",
  messagingSenderId: "121489070687",
  appId: "1:121489070687:web:741eb4165477f0c96e19ea"
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)

export const db = getFirestore(app)