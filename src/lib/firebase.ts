import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    
    // Check if user document exists
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      let role = "student";
      const email = user.email || "";
      if (email === "admin@tcetmumbai.in") {
        role = "super_admin";
      } else if (email.endsWith("@tcetmumbai.in") || email.endsWith("@faculty.tcetmumbai.in")) {
        role = "teacher";
      }

      await setDoc(userRef, {
        uid: user.uid,
        name: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        branch: "B.Tech CSE", // Default
        year: "3rd Year", // Default
        skills: [],
        cgpa: "0.0",
        attendance_percentage: 75, // Default attendance
        role: role,
        created_at: serverTimestamp()
      });
    } else {
      // Ensure role exists for existing users
      const data = userSnap.data();
      if (!data.role) {
        let role = "student";
        const email = user.email || "";
        if (email === "admin@tcetmumbai.in") {
          role = "super_admin";
        } else if (email.endsWith("@tcetmumbai.in") || email.endsWith("@faculty.tcetmumbai.in")) {
          role = "teacher";
        }
        await setDoc(userRef, { role: role }, { merge: true });
      }
    }
  } catch (error) {
    console.error("Error signing in with Google", error);
  }
};

export const signInWithEmail = async (email: string, password: string) => {
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error("Error signing in with email", error);
    throw error;
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out", error);
  }
};
