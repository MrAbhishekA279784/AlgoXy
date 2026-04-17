import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

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
};