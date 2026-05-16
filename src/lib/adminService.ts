import { 
  collection, 
  getDocs, 
  query, 
  where,
  count 
} from 'firebase/firestore';
import { db } from './firebase';

export interface AdminStats {
  totalUsers: number;
  totalJobs: number;
  totalEvents: number;
  totalClubs: number;
}

export const adminService = {
  async fetchStats(): Promise<AdminStats> {
    try {
      const [usersSnap, jobsSnap, eventsSnap, clubsSnap] = await Promise.all([
        getDocs(query(collection(db, 'users'))),
        getDocs(query(collection(db, 'jobs'))),
        getDocs(query(collection(db, 'events'))),
        getDocs(query(collection(db, 'clubs')))
      ]);

      return {
        totalUsers: usersSnap.size,
        totalJobs: jobsSnap.size,
        totalEvents: eventsSnap.size,
        totalClubs: clubsSnap.size
      };
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      return {
        totalUsers: 0,
        totalJobs: 0,
        totalEvents: 0,
        totalClubs: 0
      };
    }
  },

  async fetchUsers(role?: string) {
    try {
      let q = query(collection(db, 'users'));
      if (role) {
        q = query(collection(db, 'users'), where('role', '==', role));
      }
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  },

  async fetchStudents() {
    return this.fetchUsers('student');
  },

  async fetchTeachers() {
    return this.fetchUsers('teacher');
  }
};

export default adminService;