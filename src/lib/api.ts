import eventService from './eventService';
import jobsService from './jobsService';
import clubsService from './clubsService';
import leaderboardService from './leaderboardService';
import communityService from './communityService';
import testService from './testService';
import interviewService from './interviewService';
import aiService from './aiService';
import adminService from './adminService';
import { applyForJob, registerForEvent, joinClub, saveTestAttempt, saveInterviewAttempt } from './db';
import { 
  collection, 
  getDocs, 
  addDoc, 
  doc, 
  deleteDoc, 
  query, 
  where,
  serverTimestamp,
  limit,
  orderBy
} from 'firebase/firestore';
import { db } from './firebase';

export const fetchOpportunities = async (type?: string) => {
  return jobsService.search(type);
};

export const searchJobs = async (type?: string) => {
  return jobsService.search(type);
};

export const createJob = async (data: any) => {
  return jobsService.create(data);
};

export const updateJob = async (id: string, data: any) => {
  return jobsService.update(id, data);
};

export const deleteJob = async (id: string) => {
  return jobsService.delete(id);
};

export const fetchEvents = async () => {
  return eventService.fetchAll();
};

export const createEvent = async (data: any) => {
  return eventService.create(data);
};

export const updateEvent = async (id: string, data: any) => {
  return eventService.update(id, data);
};

export const deleteEvent = async (id: string) => {
  return eventService.delete(id);
};

export const fetchClubs = async () => {
  return clubsService.fetchAll();
};

export const createClub = async (data: any) => {
  return clubsService.create(data);
};

export const updateClub = async (id: string, data: any) => {
  return clubsService.update(id, data);
};

export const deleteClub = async (id: string) => {
  return clubsService.delete(id);
};

export const fetchCommunity = async () => {
  const realPosts = await communityService.fetchAll();
  const demoPosts = communityService.getDemoPosts();
  return [...realPosts, ...demoPosts];
};

export const createPost = async (data: any) => {
  return communityService.create(data.content, data.authorName, data.authorAvatar);
};

export const likePostApi = async (id: string) => {
  return communityService.like(id);
};

export const replyPostApi = async (id: string, data: any) => {
  return communityService.comment(id);
};

export const deletePost = async (id: string) => {
  return communityService.delete(id);
};

export const fetchLeaderboard = async (filter?: string) => {
  if (filter === 'branch') {
    return leaderboardService.fetchTop(10);
  }
  return leaderboardService.fetchTop(10);
};

export const fetchAdminStats = async () => {
  return adminService.fetchStats();
};

export const fetchAdminUsers = async () => {
  return adminService.fetchUsers();
};

export const updateAdminUser = async (id: string, data: any) => {
  console.log('Update user not implemented in frontend-first mode');
  return null;
};

export const deleteAdminUser = async (id: string) => {
  console.log('Delete user not implemented in frontend-first mode');
  return null;
};

export const updateProfile = async (uid: string, data: any) => {
  console.log('Update profile via Firestore directly');
  return null;
};

let currentInterviewState: any = null;

export const startInterview = (category: string, company: string, role: string) => {
  currentInterviewState = interviewService.startInterview(category, company, role);
  const lastMessage = currentInterviewState.history[currentInterviewState.history.length - 1];
  return { reply: lastMessage.text, isFinished: false };
};

export const getFollowupQuestion = (category: string, company: string, role: string, history: any[]): Promise<{ reply: string; isFinished: boolean; feedback?: any }> => {
  if (!currentInterviewState) {
    currentInterviewState = interviewService.startInterview(category, company, role);
  }
  
  if (history && history.length > 0) {
    history.forEach((h: any) => {
      if (h.role === 'user') {
        currentInterviewState = interviewService.addUserAnswer(currentInterviewState, h.text);
      }
    });
  }
  
  const prevHistoryLength = currentInterviewState.history.length;
  currentInterviewState = interviewService.getNextQuestion(currentInterviewState);
  
  if (currentInterviewState.isFinished) {
    return Promise.resolve({ reply: currentInterviewState.history[currentInterviewState.history.length - 1].text, isFinished: true });
  }
  
  const lastMessage = currentInterviewState.history[currentInterviewState.history.length - 1];
  return Promise.resolve({ reply: lastMessage.text, isFinished: false });
};

export const getInterviewFeedback = (category: string, company: string, role: string, history: any[]): Promise<{ reply: string; isFinished: boolean; feedback: any }> => {
  if (!currentInterviewState) {
    currentInterviewState = interviewService.startInterview(category, company, role);
  }
  
  if (history && history.length > 0) {
    history.forEach((h: any) => {
      if (h.role === 'user') {
        currentInterviewState = interviewService.addUserAnswer(currentInterviewState, h.text);
      }
    });
  }
  
  const feedback = interviewService.generateFeedback(currentInterviewState);
  return Promise.resolve({ 
    reply: 'Interview complete.', 
    isFinished: true, 
    feedback 
  });
};

export const chatAIInterview = (
  category: string, 
  company: string, 
  role: string, 
  history: any[], 
  forceFinish?: boolean
) => {
  if (!history || history.length === 0) {
    return startInterview(category, company, role);
  }
  
  if (forceFinish) {
    return getInterviewFeedback(category, company, role, history);
  }
  
  return getFollowupQuestion(category, company, role, history);
};

export const generateMockTest = (category: string, company: string, role: string) => {
  const questions = testService.getMCQs(category, role, 10);
  return { questions };
};

export const generateAITest = (category: string, company: string, role: string) => {
  return generateMockTest(category, company, role);
};

export const gradeTest = (questions: any[], answers: string[]) => {
  return testService.gradeTest(questions, answers);
};

export const getCareerGuidance = async (uid?: string) => {
  return aiService.getGuidance(uid);
};

export const fetchAICareerInsights = async (uid?: string) => {
  return aiService.getGuidance(uid);
};

export const askAICareerAssistant = async (question: string) => {
  return aiService.askAssistant(question);
};

export const fetchAIJobSuggestions = async (uid: string, skills: string[], branch: string, cgpa: string) => {
  return aiService.getJobSuggestions(skills, branch, cgpa);
};

export const callAI = async (type: string, payload: any) => {
  if (type === 'assistant') {
    return aiService.askAssistant(payload.question);
  }
  if (type === 'job_suggestions') {
    return aiService.getJobSuggestions(payload.skills, payload.branch, payload.cgpa);
  }
  return { answer: 'Unknown AI request type' };
};

export { applyForJob, registerForEvent, joinClub, saveTestAttempt, saveInterviewAttempt };

export const fetchClubMembers = async (clubId?: string, limitCount: number = 100) => {
  try {
    if (clubId) {
      const q = query(
        collection(db, 'club_memberships'), 
        where('clubId', '==', clubId),
        limit(limitCount)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
    // No clubId provided - fetch recent members with limit to prevent overread
    const q = query(
      collection(db, 'club_memberships'),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching club members:', error);
    return [];
  }
};

export const addClubMember = async (data: { userId: string; clubId: string; clubName: string }) => {
  const docRef = await addDoc(collection(db, 'club_memberships'), {
    ...data,
    joinedAt: serverTimestamp()
  });
  return docRef.id;
};

export const removeClubMember = async (id: string) => {
  await deleteDoc(doc(db, 'club_memberships', id));
};

export const createAttendance = async (data: { studentId: string; date: string; status: string; notes?: string }) => {
  const docRef = await addDoc(collection(db, 'attendance'), {
    ...data,
    createdAt: serverTimestamp()
  });
  return docRef.id;
};

export const fetchAttendance = async (studentId?: string, limitCount: number = 100) => {
  try {
    if (studentId) {
      const q = query(
        collection(db, 'attendance'), 
        where('studentId', '==', studentId),
        orderBy('markedAt', 'desc'),
        limit(limitCount)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
    // No studentId - fetch recent records with limit to prevent overread
    const q = query(
      collection(db, 'attendance'),
      orderBy('markedAt', 'desc'),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching attendance:', error);
    return [];
  }
};