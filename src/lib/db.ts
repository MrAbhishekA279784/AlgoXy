import { collection, addDoc, serverTimestamp, query, where, getDocs, orderBy, doc, updateDoc, increment } from 'firebase/firestore';
import { db, auth } from './firebase';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const applyForJob = async (jobId: string, jobTitle: string, company: string) => {
  if (!auth.currentUser) throw new Error("Not authenticated");
  
  const path = 'applications';
  try {
    await addDoc(collection(db, path), {
      userId: auth.currentUser.uid,
      jobId,
      jobTitle,
      company,
      status: 'applied',
      createdAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const registerForEvent = async (eventId: string, eventTitle: string, formData: any) => {
  if (!auth.currentUser) throw new Error("Not authenticated");
  
  const path = 'event_registrations';
  try {
    await addDoc(collection(db, path), {
      userId: auth.currentUser.uid,
      eventId,
      eventTitle,
      formData,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const joinClub = async (clubId: string, clubName: string) => {
  if (!auth.currentUser) throw new Error("Not authenticated");
  
  const path = 'club_memberships';
  try {
    await addDoc(collection(db, path), {
      userId: auth.currentUser.uid,
      clubId,
      clubName,
      joinedAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const createCommunityPost = async (content: string, authorName: string, authorAvatar: string) => {
  if (!auth.currentUser) throw new Error("Not authenticated");
  
  const path = 'community_posts';
  try {
    await addDoc(collection(db, path), {
      authorId: auth.currentUser.uid,
      authorName,
      authorAvatar,
      content,
      likesCount: 0,
      comments: 0,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const saveTestAttempt = async (testId: string, testTitle: string, score: number, timeTaken?: number) => {
  if (!auth.currentUser) throw new Error("Not authenticated");
  
  const path = 'test_attempts';
  try {
    await addDoc(collection(db, path), {
      userId: auth.currentUser.uid,
      testId,
      testTitle,
      score,
      timeTaken: timeTaken || 0,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const saveInterviewAttempt = async (company: string, role: string, category: string, history: any[], feedback: any) => {
  if (!auth.currentUser) throw new Error("Not authenticated");
  
  const path = 'ai_interviews';
  try {
    await addDoc(collection(db, path), {
      userId: auth.currentUser.uid,
      company,
      role,
      category,
      questions: history.filter(h => h.role === 'ai').map(h => h.text),
      answers: history.filter(h => h.role === 'user').map(h => h.text),
      finalScore: feedback.score || 0,
      feedback,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const getCommunityPosts = async () => {
  const path = 'community_posts';
  try {
    const q = query(collection(db, path), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const realPosts = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      time: doc.data().createdAt ? formatTimeAgo(doc.data().createdAt) : 'Just now'
    }));

    // Demo data
    const demoPosts = [
      {
        id: 'demo-post-1',
        authorName: 'Rahul Sharma',
        authorAvatar: 'https://i.pravatar.cc/150?u=rahul',
        content: 'Just cleared the first round of TCS Digital! The AI mock interviews here really helped me prepare for the technical questions. Anyone else interviewing next week?',
        likesCount: 24,
        comments: 5,
        time: '2h ago'
      },
      {
        id: 'demo-post-2',
        authorName: 'Priya Patel',
        authorAvatar: 'https://i.pravatar.cc/150?u=priya',
        content: 'Looking for teammates for the upcoming Smart India Hackathon. We need someone strong in React and Node.js. DM if interested!',
        likesCount: 15,
        comments: 8,
        time: '5h ago'
      }
    ];

    return [...realPosts, ...demoPosts];
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return []; // Should not reach here due to throw in handleFirestoreError
  }
};

export const likePost = async (postId: string) => {
  if (postId.startsWith('demo-')) return; // Ignore likes on demo posts
  if (!auth.currentUser) throw new Error("Not authenticated");
  const path = `community_posts/${postId}`;
  try {
    const postRef = doc(db, 'community_posts', postId);
    await updateDoc(postRef, {
      likesCount: increment(1)
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};

export const replyPost = async (postId: string, content: string, authorName: string, authorAvatar: string) => {
  if (postId.startsWith('demo-')) return; // Ignore replies on demo posts
  if (!auth.currentUser) throw new Error("Not authenticated");
  const path = `community_posts/${postId}`;
  try {
    const postRef = doc(db, 'community_posts', postId);
    await updateDoc(postRef, {
      comments: increment(1)
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};

const formatTimeAgo = (timestamp: any) => {
  if (!timestamp) return 'Just now';
  const date = timestamp.toDate();
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

export const getUserActivity = async () => {
  if (!auth.currentUser) return [];
  
  const userId = auth.currentUser.uid;
  const activities: any[] = [];

  try {
    // Fetch applications
    const appQuery = query(collection(db, 'applications'), where('userId', '==', userId));
    const appDocs = await getDocs(appQuery);
    appDocs.forEach(doc => {
      activities.push({ id: doc.id, type: 'application', ...doc.data() });
    });

    // Fetch event registrations
    const eventQuery = query(collection(db, 'event_registrations'), where('userId', '==', userId));
    const eventDocs = await getDocs(eventQuery);
    eventDocs.forEach(doc => {
      activities.push({ id: doc.id, type: 'event', ...doc.data() });
    });

    // Fetch club memberships
    const clubQuery = query(collection(db, 'club_memberships'), where('userId', '==', userId));
    const clubDocs = await getDocs(clubQuery);
    clubDocs.forEach(doc => {
      activities.push({ id: doc.id, type: 'club', ...doc.data() });
    });

    // Fetch test attempts
    const testQuery = query(collection(db, 'test_attempts'), where('userId', '==', userId));
    const testDocs = await getDocs(testQuery);
    testDocs.forEach(doc => {
      activities.push({ id: doc.id, type: 'test', ...doc.data() });
    });

    // Fetch AI interviews
    const interviewQuery = query(collection(db, 'ai_interviews'), where('userId', '==', userId));
    const interviewDocs = await getDocs(interviewQuery);
    interviewDocs.forEach(doc => {
      activities.push({ id: doc.id, type: 'interview', ...doc.data() });
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'user_activity');
  }

  // Add demo data if no real data exists for tests/interviews
  const hasTests = activities.some(a => a.type === 'test');
  const hasInterviews = activities.some(a => a.type === 'interview');

  if (!hasTests) {
    activities.push({
      id: 'demo-test-1',
      type: 'test',
      testTitle: 'TCS - Software Engineer',
      score: 85,
      createdAt: { toMillis: () => Date.now() - 86400000, toDate: () => new Date(Date.now() - 86400000) }
    });
  }

  if (!hasInterviews) {
    activities.push({
      id: 'demo-interview-1',
      type: 'interview',
      company: 'NVIDIA',
      role: 'Embedded Systems Engineer',
      finalScore: 78,
      createdAt: { toMillis: () => Date.now() - 172800000, toDate: () => new Date(Date.now() - 172800000) }
    });
  }

  // Sort by createdAt descending
  return activities.sort((a, b) => {
    const timeA = a.createdAt?.toMillis() || 0;
    const timeB = b.createdAt?.toMillis() || 0;
    return timeB - timeA;
  });
};
