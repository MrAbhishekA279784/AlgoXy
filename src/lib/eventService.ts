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

export interface Event {
  id?: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: string;
  imageUrl?: string;
  registrationLink?: string;
  createdAt?: any;
}

const COLLECTION = 'events';

export const eventService = {
  async fetchAll(): Promise<Event[]> {
    try {
      const q = query(collection(db, COLLECTION), orderBy('date', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Event[];
    } catch (error) {
      console.error('Error fetching events:', error);
      return [];
    }
  },

  async create(data: Omit<Event, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTION), {
      ...data,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  },

  async update(id: string, data: Partial<Event>): Promise<void> {
    await updateDoc(doc(db, COLLECTION, id), data);
  },

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTION, id));
  },

  async fetchByCategory(category: string): Promise<Event[]> {
    try {
      const q = query(
        collection(db, COLLECTION),
        where('category', '==', category),
        orderBy('date', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Event[];
    } catch (error) {
      console.error('Error fetching events by category:', error);
      return [];
    }
  }
};

export default eventService;