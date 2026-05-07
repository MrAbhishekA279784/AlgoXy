import express from 'express';
import { fetchAdzuna, fetchGreenhouse, deduplicateJobs, getLocalFallbackJobs } from '../services/jobService';
import { cacheGet, cacheSet, cache, CACHE_TTL } from '../services/cacheService';
import { firestoreQuery, firestoreAdd, firestoreUpdate, firestoreDelete } from '../services/firebaseService';

const router = express.Router();

router.get('/search', async (req, res) => {
  try {
    const { type } = req.query as Record<string, string>;
    const normalizedType = type === 'Internships' ? 'Internship' : type;
    const cacheKey = `jobs:${normalizedType || 'all'}`;
    const cached = cacheGet(cacheKey);
    if (cached) return res.json(cached);

    let jobs: any[] = [];

    const fsJobs = await firestoreQuery('jobs', normalizedType && normalizedType !== 'All' ? [['type', '==', normalizedType]] : []);
    if (fsJobs.length > 0) jobs = fsJobs;

    if (jobs.length < 5) {
      const [adzunaJobs, ghJobs] = await Promise.all([
        fetchAdzuna(normalizedType === 'Internship' ? 'software internship india' : 'software engineer india'),
        normalizedType !== 'Internship' ? fetchGreenhouse() : Promise.resolve([]),
      ]);
      const apiJobs = deduplicateJobs([...adzunaJobs, ...ghJobs]);
      if (apiJobs.length > 0) jobs = [...jobs, ...apiJobs];
    }

    if (jobs.length === 0) {
        jobs = getLocalFallbackJobs(normalizedType);
    } else {
        // Enforce deduplication with local jobs to ensure we have a rich list
        const local = getLocalFallbackJobs(normalizedType);
        jobs = deduplicateJobs([...jobs, ...local]);
    }

    jobs = deduplicateJobs(jobs);
    cacheSet(cacheKey, jobs, CACHE_TTL.jobs);
    res.json(jobs);
  } catch (e: any) {
    res.json(getLocalFallbackJobs(req.query.type as string));
  }
});

router.post('/', async (req, res) => {
  const id = await firestoreAdd('jobs', req.body);
  if (id) {
    for (const k of Array.from(cache.keys())) { if (k.startsWith('jobs:')) cache.delete(k); }
    res.json({ id, ...req.body });
  } else res.status(500).json({ error: 'Failed to create job' });
});

router.put('/:id', async (req, res) => {
  const ok = await firestoreUpdate('jobs', req.params.id, req.body);
  if (ok) {
    for (const k of Array.from(cache.keys())) { if (k.startsWith('jobs:')) cache.delete(k); }
    res.json({ id: req.params.id, ...req.body });
  } else res.status(500).json({ error: 'Failed to update job' });
});

router.delete('/:id', async (req, res) => {
  const ok = await firestoreDelete('jobs', req.params.id);
  if (ok) {
    for (const k of Array.from(cache.keys())) { if (k.startsWith('jobs:')) cache.delete(k); }
    res.json({ success: true });
  } else res.status(500).json({ error: 'Failed to delete job' });
});

export default router;
