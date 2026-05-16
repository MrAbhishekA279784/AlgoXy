import { 
  collection, 
  getDocs, 
  query, 
  where,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from './firebase';

export interface LeaderboardUser {
  uid: string;
  name: string;
  email: string;
  photoURL?: string;
  points: number;
  role: string;
  branch?: string;
  year?: number;
}

export const leaderboardService = {
  async fetchTop(top: number = 10): Promise<LeaderboardUser[]> {
    try {
      const q = query(
        collection(db, 'users'),
        where('role', '==', 'student'),
        orderBy('points', 'desc'),
        limit(top)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as LeaderboardUser));
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }
  },

  async fetchByBranch(branch: string, top: number = 10): Promise<LeaderboardUser[]> {
    try {
      const q = query(
        collection(db, 'users'),
        where('role', '==', 'student'),
        where('branch', '==', branch),
        orderBy('points', 'desc'),
        limit(top)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as LeaderboardUser));
    } catch (error) {
      console.error('Error fetching branch leaderboard:', error);
      return [];
    }
  },

  async fetchByYear(year: number, top: number = 10): Promise<LeaderboardUser[]> {
    try {
      const q = query(
        collection(db, 'users'),
        where('role', '==', 'student'),
        where('year', '==', year),
        orderBy('points', 'desc'),
        limit(top)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as LeaderboardUser));
    } catch (error) {
      console.error('Error fetching year leaderboard:', error);
      return [];
    }
  }
};

export default leaderboardService;