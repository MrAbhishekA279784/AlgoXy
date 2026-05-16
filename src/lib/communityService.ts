import { 
  collection, 
  getDocs, 
  addDoc, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy,
  increment,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { auth } from './firebase';

export interface CommunityPost {
  id?: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  likesCount: number;
  comments: number;
  createdAt: any;
}

const COLLECTION = 'community_posts';

export const communityService = {
  async fetchAll(): Promise<CommunityPost[]> {
    try {
      const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        time: doc.data().createdAt?.toMillis 
          ? formatTimeAgo(doc.data().createdAt)
          : 'Just now'
      })) as unknown as CommunityPost[];
    } catch (error) {
      console.error('Error fetching community posts:', error);
      return [];
    }
  },

  async create(content: string, authorName: string, authorAvatar: string): Promise<string> {
    if (!auth.currentUser) throw new Error('Not authenticated');
    
    const docRef = await addDoc(collection(db, COLLECTION), {
      authorId: auth.currentUser.uid,
      authorName,
      authorAvatar,
      content,
      likesCount: 0,
      comments: 0,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  },

  async like(postId: string): Promise<void> {
    if (postId.startsWith('demo-')) return;
    await updateDoc(doc(db, COLLECTION, postId), {
      likesCount: increment(1)
    });
  },

  async comment(postId: string): Promise<void> {
    if (postId.startsWith('demo-')) return;
    await updateDoc(doc(db, COLLECTION, postId), {
      comments: increment(1)
    });
  },

  async delete(postId: string): Promise<void> {
    if (postId.startsWith('demo-')) return;
    await deleteDoc(doc(db, COLLECTION, postId));
  },

  getDemoPosts(): CommunityPost[] {
    return [
      {
        id: 'demo-post-1',
        authorId: 'demo',
        authorName: 'Rahul Sharma',
        authorAvatar: 'https://i.pravatar.cc/150?u=rahul',
        content: 'Just cleared the first round of TCS Digital! The AI mock interviews here really helped me prepare for the technical questions. Anyone else interviewing next week?',
        likesCount: 24,
        comments: 5,
        createdAt: { toMillis: () => Date.now() - 7200000 }
      },
      {
        id: 'demo-post-2',
        authorId: 'demo',
        authorName: 'Priya Patel',
        authorAvatar: 'https://i.pravatar.cc/150?u=priya',
        content: 'Looking for teammates for the upcoming Smart India Hackathon. We need someone strong in React and Node.js. DM if interested!',
        likesCount: 15,
        comments: 8,
        createdAt: { toMillis: () => Date.now() - 18000000 }
      }
    ];
  }
};

function formatTimeAgo(timestamp: any): string {
  if (!timestamp) return 'Just now';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default communityService;