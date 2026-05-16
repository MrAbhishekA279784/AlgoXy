import { initializeApp } from 'firebase/app';

import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  signOut,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';

import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
// Explicitly set persistence
setPersistence(auth, browserLocalPersistence).catch(console.error);

export const db = getFirestore(app);

export const googleProvider = new GoogleAuthProvider();

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
      name: user.displayName || email.split('@')[0],
      email: user.email,
      photoURL: user.photoURL || null,
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
  try {
    const result = await signInWithPopup(
      auth,
      googleProvider
    );

    await ensureUserDocument(result.user);

    return result;
  } catch (error: any) {
    if (
      error.code === 'auth/popup-blocked' ||
      error.code === 'auth/popup-closed-by-user'
    ) {
      await signInWithRedirect(auth, googleProvider);
    } else {
      console.error(error);
      throw error;
    }
  }
};

export const signInWithEmail = async (
  email: string,
  password: string
) => {
  const result = await signInWithEmailAndPassword(
    auth,
    email,
    password
  );
  await ensureUserDocument(result.user);
  return result;
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