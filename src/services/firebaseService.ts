import admin from 'firebase-admin';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
let db: admin.firestore.Firestore | null = null;

try {
  const firebaseConfig = require('../../firebase-applet-config.json');
  if (!admin.apps.length) {
    admin.initializeApp({
      projectId: firebaseConfig.projectId,
      databaseURL: `https://${firebaseConfig.projectId}.firebaseio.com`,
    });
  }
  db = admin.firestore();
} catch (e) {
  console.warn('[Firebase] Admin SDK init failed – will use local fallbacks only.');
}

export { db };

export async function firestoreGet(collection: string, id: string): Promise<any | null> {
  if (!db) return null;
  try {
    const snap = await db.collection(collection).doc(id).get();
    return snap.exists ? snap.data() : null;
  } catch { return null; }
}

export async function firestoreQuery(col: string, filters: [string, any, any][] = []): Promise<any[]> {
  if (!db) return [];
  try {
    let q: any = db.collection(col);
    for (const [field, op, val] of filters) q = q.where(field, op, val);
    const snap = await q.get();
    return snap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
  } catch { return []; }
}

export async function firestoreAdd(col: string, data: any): Promise<string | null> {
  if (!db) return null;
  try {
    const ref = await db.collection(col).add({ ...data, createdAt: admin.firestore.FieldValue.serverTimestamp() });
    return ref.id;
  } catch { return null; }
}

export async function firestoreSet(col: string, id: string, data: any, merge = true): Promise<boolean> {
  if (!db) return false;
  try {
    await db.collection(col).doc(id).set(data, { merge });
    return true;
  } catch { return false; }
}

export async function firestoreUpdate(col: string, id: string, data: any): Promise<boolean> {
  if (!db) return false;
  try {
    await db.collection(col).doc(id).update(data);
    return true;
  } catch { return false; }
}

export async function firestoreDelete(col: string, id: string): Promise<boolean> {
  if (!db) return false;
  try {
    await db.collection(col).doc(id).delete();
    return true;
  } catch { return false; }
}
