import { 
  collection, 
  getDocs, 
  addDoc, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';

export interface Club {
  id?: string;
  name: string;
  description: string;
  imageUrl?: string;
  category: string;
  memberCount?: number;
  meetingTime?: string;
  createdAt?: any;
}

const COLLECTION = 'clubs';

export const clubsService = {
  async fetchAll(): Promise<Club[]> {
    try {
      const q = query(collection(db, COLLECTION), orderBy('name', 'asc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Club[];
    } catch (error) {
      console.error('Error fetching clubs:', error);
      return [];
    }
  },

  async create(data: Omit<Club, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTION), {
      ...data,
      memberCount: 0,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  },

  async update(id: string, data: Partial<Club>): Promise<void> {
    await updateDoc(doc(db, COLLECTION, id), data);
  },

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTION, id));
  },

  async fetchByCategory(category: string): Promise<Club[]> {
    try {
      const q = query(
        collection(db, COLLECTION),
        where('category', '==', category),
        orderBy('name', 'asc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Club[];
    } catch (error) {
      console.error('Error fetching clubs by category:', error);
      return [];
    }
  }
};

export default clubsService;