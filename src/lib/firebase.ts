import { initializeApp } from "firebase/app"
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, signOut } from "firebase/auth"
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyCEvBTGmGSlGquQSHK2RFXd8-ig1bAXgJo",
  authDomain: "tcet-connect.firebaseapp.com",
  projectId: "tcet-connect",
  storageBucket: "tcet-connect.firebasestorage.app",
  messagingSenderId: "121489070687",
  appId: "1:121489070687:web:741eb4165477f0c96e19ea"
}

// initialize firebase
const app = initializeApp(firebaseConfig)

// services
export const auth = getAuth(app)
export const db = getFirestore(app)


// GOOGLE LOGIN
export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider()

  try {
    const result = await signInWithPopup(auth, provider)

    const user = result.user

    const userRef = doc(db, "users", user.uid)

    const userSnap = await getDoc(userRef)

    if (!userSnap.exists()) {

      let role = "student"

      const email = user.email || ""

      if (email === "admin@tcetmumbai.in") {
        role = "super_admin"
      }
      else if (
        email.endsWith("@tcetmumbai.in") ||
        email.endsWith("@faculty.tcetmumbai.in")
      ) {
        role = "teacher"
      }

      await setDoc(userRef, {
        uid: user.uid,
        name: user.displayName,
        email: user.email,
        photoURL: user.photoURL,

        branch: "B.Tech CSE",
        year: "3rd Year",
        skills: [],

        cgpa: 0,
        attendance_percentage: 75,

        role: role,

        created_at: serverTimestamp()
      })
    }

  } catch (error) {

    console.error("Google login error", error)

  }
}



// EMAIL LOGIN
export const signInWithEmail = async (
  email: string,
  password: string
) => {

  try {

    await signInWithEmailAndPassword(
      auth,
      email,
      password
    )

  } catch (error) {

    console.error("Email login error", error)

    throw error

  }

}



// LOGOUT
export const logout = async () => {

  try {

    await signOut(auth)

  }

  catch (error) {

    console.error("Logout error", error)

  }

}