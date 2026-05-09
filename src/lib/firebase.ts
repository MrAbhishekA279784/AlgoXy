import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';

import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from 'firebase/firestore';

import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

const googleProvider = new GoogleAuthProvider();

async function ensureUserDocument(user: any) {
  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    let role = 'student';
    const email = user.email || '';

    if (
      email === 'admin@tcetmumbai.in' ||
      email === 'admin@test.com'
    ) {
      role = 'super_admin';
    } else if (
      email.endsWith('@tcetmumbai.in') ||
      email.endsWith('@faculty.tcetmumbai.in') ||
      email === 'teacher@test.com'
    ) {
      role = 'teacher';
    }

    await setDoc(userRef, {
      uid: user.uid,
      name: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
      role,
      created_at: serverTimestamp()
    });
  }
}

export const handleGoogleRedirectResult = async () => {
  try {
    const result = await getRedirectResult(auth);

    if (result?.user) {
      await ensureUserDocument(result.user);
    }
  } catch (error) {
    console.error(error);
  }
};

export const signInWithGoogle = async () => {
  const result = await signInWithPopup(auth, googleProvider);
  await ensureUserDocument(result.user);
};

export const signInWithEmail = async (
  email: string,
  password: string
) => {
  return await signInWithEmailAndPassword(
    auth,
    email,
    password
  );
};

export const logout = async () => {
  await signOut(auth);
};

export const getUserData = async (uid: string) => {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    return userSnap.data();
  }

  return null;
};