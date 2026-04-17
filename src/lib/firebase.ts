import { initializeApp } from 'firebase/app';
<<<<<<< HEAD
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, signInWithEmailAndPassword, signOut } from 'firebase/auth';
=======
<<<<<<< HEAD
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, signInWithEmailAndPassword, signOut } from 'firebase/auth';
=======
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, signOut } from 'firebase/auth';
>>>>>>> 648baa19552d4e19f3f6230e8415d44bb744bf7e
>>>>>>> 58850df9608a9c315f026222dce4eaad0f14e3f8
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 58850df9608a9c315f026222dce4eaad0f14e3f8
const googleProvider = new GoogleAuthProvider();

// Helper to create/update user document after sign-in
async function ensureUserDocument(user: import('firebase/auth').User) {
  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    let role = "student";
    const email = user.email || "";
    if (email === "admin@tcetmumbai.in" || email === "admin@test.com") {
      role = "super_admin";
    } else if (email.endsWith("@tcetmumbai.in") || email.endsWith("@faculty.tcetmumbai.in") || email === "teacher@test.com") {
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
<<<<<<< HEAD
=======
=======
export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    
    // Check if user document exists
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
>>>>>>> 648baa19552d4e19f3f6230e8415d44bb744bf7e
>>>>>>> 58850df9608a9c315f026222dce4eaad0f14e3f8
      let role = "student";
      const email = user.email || "";
      if (email === "admin@tcetmumbai.in" || email === "admin@test.com") {
        role = "super_admin";
      } else if (email.endsWith("@tcetmumbai.in") || email.endsWith("@faculty.tcetmumbai.in") || email === "teacher@test.com") {
        role = "teacher";
      }
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 58850df9608a9c315f026222dce4eaad0f14e3f8
      await setDoc(userRef, { role: role }, { merge: true });
    }
  }
}

// Handle redirect result on app load (for when signInWithRedirect was used)
export const handleGoogleRedirectResult = async () => {
  try {
    const result = await getRedirectResult(auth);
    if (result?.user) {
      await ensureUserDocument(result.user);
    }
  } catch (error: any) {
    console.error("Error handling Google redirect result:", error);
  }
};

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    await ensureUserDocument(result.user);
  } catch (error: any) {
    // If popup was blocked or closed, fall back to redirect
    if (error.code === 'auth/popup-blocked' || error.code === 'auth/popup-closed-by-user') {
      console.log("Popup blocked/closed, falling back to redirect...");
      try {
        await signInWithRedirect(auth, googleProvider);
      } catch (redirectError) {
        console.error("Error with redirect sign-in:", redirectError);
      }
    } else if (error.code === 'auth/cancelled-popup-request') {
      // User clicked the button again while popup was open, ignore
    } else {
      console.error("Error signing in with Google:", error.code, error.message);
      throw error;
    }
<<<<<<< HEAD
=======
=======

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
        if (email === "admin@tcetmumbai.in" || email === "admin@test.com") {
          role = "super_admin";
        } else if (email.endsWith("@tcetmumbai.in") || email.endsWith("@faculty.tcetmumbai.in") || email === "teacher@test.com") {
          role = "teacher";
        }
        await setDoc(userRef, { role: role }, { merge: true });
      }
    }
  } catch (error) {
    console.error("Error signing in with Google", error);
>>>>>>> 648baa19552d4e19f3f6230e8415d44bb744bf7e
>>>>>>> 58850df9608a9c315f026222dce4eaad0f14e3f8
  }
};

export const signInWithEmail = async (email: string, password: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    const user = result.user;

    // Check if user document exists
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      let role = "student";
      if (email === "admin@tcetmumbai.in" || email === "admin@test.com") {
        role = "super_admin";
      } else if (email.endsWith("@tcetmumbai.in") || email.endsWith("@faculty.tcetmumbai.in") || email === "teacher@test.com") {
        role = "teacher";
      }

      await setDoc(userRef, {
        uid: user.uid,
        name: user.displayName || email.split('@')[0],
        email: user.email,
        photoURL: user.photoURL || `https://ui-avatars.com/api/?name=${email.split('@')[0]}&background=random`,
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
        if (email === "admin@tcetmumbai.in" || email === "admin@test.com") {
          role = "super_admin";
        } else if (email.endsWith("@tcetmumbai.in") || email.endsWith("@faculty.tcetmumbai.in") || email === "teacher@test.com") {
          role = "teacher";
        }
        await setDoc(userRef, { role: role }, { merge: true });
      }
    }
    return result;
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

export const getUserData = async (uid: string) => {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    return userSnap.data();
  }
  return null;
<<<<<<< HEAD
};
=======
};
>>>>>>> 58850df9608a9c315f026222dce4eaad0f14e3f8
