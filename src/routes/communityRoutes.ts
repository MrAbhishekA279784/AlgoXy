import express from 'express';
import { firestoreQuery, firestoreAdd, firestoreUpdate } from '../services/firebaseService';
import admin from 'firebase-admin';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const posts = await firestoreQuery('community_posts', []);
    // Sort by createdAt descending (manual since firestoreQuery is basic)
    posts.sort((a, b) => {
      const tA = a.createdAt?._seconds || 0;
      const tB = b.createdAt?._seconds || 0;
      return tB - tA;
    });

    const demoPosts = [
      {
        id: 'demo-post-1',
        authorName: 'Rahul Sharma',
        authorAvatar: 'https://i.pravatar.cc/150?u=rahul',
        content: 'Just cleared the first round of TCS Digital! The AI mock interviews here really helped me prepare for the technical questions.',
        likesCount: 24,
        comments: 5,
        time: '2h ago'
      }
    ];

    res.json([...posts, ...demoPosts]);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { content, authorName, authorAvatar } = req.body;
    const id = await firestoreAdd('community_posts', {
      content,
      authorName,
      authorAvatar,
      likesCount: 0,
      comments: 0
    });
    res.json({ id, content, authorName });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/:id/like', async (req, res) => {
  try {
    await firestoreUpdate('community_posts', req.params.id, {
      likesCount: admin.firestore.FieldValue.increment(1)
    });
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
