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

export interface Job {
  id?: string;
  title: string;
  company: string;
  location: string;
  type: string;
  description: string;
  requirements: string[];
  skills: string[];
  salary?: string;
  applyLink?: string;
  postedDate?: string;
  expiresAt?: string;
  createdAt?: any;
}

const COLLECTION = 'jobs';

export const jobsService = {
  async fetchAll(): Promise<Job[]> {
    try {
      const q = query(collection(db, COLLECTION), orderBy('postedDate', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Job[];
    } catch (error) {
      console.error('Error fetching jobs:', error);
      return [];
    }
  },

  async search(type?: string): Promise<Job[]> {
    try {
      if (type && type !== 'All') {
        const q = query(
          collection(db, COLLECTION),
          where('type', '==', type),
          orderBy('postedDate', 'desc')
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Job[];
      }
      return this.fetchAll();
    } catch (error) {
      console.error('Error searching jobs:', error);
      return [];
    }
  },

  async create(data: Omit<Job, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTION), {
      ...data,
      postedDate: new Date().toISOString(),
      createdAt: serverTimestamp()
    });
    return docRef.id;
  },

  async update(id: string, data: Partial<Job>): Promise<void> {
    await updateDoc(doc(db, COLLECTION, id), data);
  },

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTION, id));
  },

  async fetchByCompany(company: string): Promise<Job[]> {
    try {
      const q = query(
        collection(db, COLLECTION),
        where('company', '==', company),
        orderBy('postedDate', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Job[];
    } catch (error) {
      console.error('Error fetching jobs by company:', error);
      return [];
    }
  }
};

export default jobsService;