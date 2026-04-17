const API_BASE = '';  // same-origin – server serves both frontend and API

// ─── Generic fetch helpers ────────────────────────────────────────────────────
async function apiFetch(url: string, options?: RequestInit) {
  try {
    const res = await fetch(url, options);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch (e: any) {
    console.warn(`[api] ${url} failed:`, e.message);
    throw e;
  }
}

function post(url: string, body: any) {
  return apiFetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
}

function put(url: string, body: any) {
  return apiFetch(url, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
}

function del(url: string) {
  return apiFetch(url, { method: 'DELETE' });
}

// ─── Opportunities / Jobs ─────────────────────────────────────────────────────
export async function fetchOpportunities(type?: string) {
  const url = type && type !== 'All'
    ? `${API_BASE}/api/jobs/search?type=${encodeURIComponent(type)}`
    : `${API_BASE}/api/jobs/search`;
  return apiFetch(url);
}

export async function searchJobs(type?: string) {
  return fetchOpportunities(type);
}

export async function createJob(data: any) { return post(`${API_BASE}/api/jobs`, data); }
export async function updateJob(id: string, data: any) { return put(`${API_BASE}/api/jobs/${id}`, data); }
export async function deleteJob(id: string) { return del(`${API_BASE}/api/jobs/${id}`); }

// ─── Events ──────────────────────────────────────────────────────────────────
export async function fetchEvents() { return apiFetch(`${API_BASE}/api/events`); }
export async function createEvent(data: any) { return post(`${API_BASE}/api/events`, data); }
export async function updateEvent(id: string, data: any) { return put(`${API_BASE}/api/events/${id}`, data); }
export async function deleteEvent(id: string) { return del(`${API_BASE}/api/events/${id}`); }

// ─── Clubs ────────────────────────────────────────────────────────────────────
export async function fetchClubs() { return apiFetch(`${API_BASE}/api/clubs`); }
export async function createClub(data: any) { return post(`${API_BASE}/api/clubs`, data); }
export async function updateClub(id: string, data: any) { return put(`${API_BASE}/api/clubs/${id}`, data); }
export async function deleteClub(id: string) { return del(`${API_BASE}/api/clubs/${id}`); }

// ─── Community ────────────────────────────────────────────────────────────────
export async function fetchCommunity() { return apiFetch(`${API_BASE}/api/community`); }
export async function createPost(data: any) { return post(`${API_BASE}/api/community`, data); }
export async function likePostApi(id: string) { return post(`${API_BASE}/api/community/${id}/like`, {}); }
export async function replyPostApi(id: string, data: any) { return post(`${API_BASE}/api/community/${id}/reply`, data); }
export async function deletePost(id: string) { return del(`${API_BASE}/api/community/${id}`); }

// ─── Leaderboard ─────────────────────────────────────────────────────────────
export async function fetchLeaderboard(filter?: string) {
  const url = filter
    ? `${API_BASE}/api/leaderboard?filter=${encodeURIComponent(filter)}`
    : `${API_BASE}/api/leaderboard`;
  return apiFetch(url);
}

// ─── Admin ────────────────────────────────────────────────────────────────────
export async function fetchAdminStats() { return apiFetch(`${API_BASE}/api/admin/stats`); }
export async function fetchAdminUsers() { return apiFetch(`${API_BASE}/api/admin/users`); }
export async function updateAdminUser(id: string, data: any) { return put(`${API_BASE}/api/admin/users/${id}`, data); }
export async function deleteAdminUser(id: string) { return del(`${API_BASE}/api/admin/users/${id}`); }

// ─── Attendance ───────────────────────────────────────────────────────────────
export async function fetchAttendance(studentId?: string) {
  const url = studentId
    ? `${API_BASE}/api/attendance?studentId=${encodeURIComponent(studentId)}`
    : `${API_BASE}/api/attendance`;
  return apiFetch(url);
}
export async function createAttendance(data: any) { return post(`${API_BASE}/api/attendance`, data); }
export async function updateAttendance(id: string, data: any) { return put(`${API_BASE}/api/attendance/${id}`, data); }

// ─── Club Members ─────────────────────────────────────────────────────────────
export async function fetchClubMembers(clubId?: string) {
  const url = clubId
    ? `${API_BASE}/api/club-members?clubId=${encodeURIComponent(clubId)}`
    : `${API_BASE}/api/club-members`;
  return apiFetch(url);
}
export async function addClubMember(data: any) { return post(`${API_BASE}/api/club-members`, data); }
export async function removeClubMember(id: string) { return del(`${API_BASE}/api/club-members/${id}`); }

// ─── Profile ─────────────────────────────────────────────────────────────────
export async function updateProfile(uid: string, data: any) { return put(`${API_BASE}/api/profile/${uid}`, data); }

// ─── Interview ───────────────────────────────────────────────────────────────
export async function startInterview(category: string, company: string, role: string) {
  return post(`${API_BASE}/api/interview/start`, { category, company, role });
}

export async function getFollowupQuestion(category: string, company: string, role: string, history: any[]) {
  return post(`${API_BASE}/api/interview/followup`, { category, company, role, history });
}

export async function getInterviewFeedback(category: string, company: string, role: string, history: any[]) {
  return post(`${API_BASE}/api/interview/feedback`, { category, company, role, history });
}

// Legacy helpers used by existing pages
export async function chatAIInterview(category: string, company: string, role: string, history: any[], forceFinish?: boolean) {
  if (!history || history.length === 0) return startInterview(category, company, role);
  if (forceFinish) return getInterviewFeedback(category, company, role, history);
  return getFollowupQuestion(category, company, role, history);
}

// ─── Mock Test ────────────────────────────────────────────────────────────────
export async function generateMockTest(category: string, company: string, role: string) {
  return post(`${API_BASE}/api/test/start`, { category, company, role });
}

export async function generateAITest(category: string, company: string, role: string) {
  return generateMockTest(category, company, role);
}

// ─── Career Guidance ─────────────────────────────────────────────────────────
export async function getCareerGuidance(uid?: string) {
  return post(`${API_BASE}/api/career/guidance`, { uid });
}

export async function fetchAICareerInsights(uid?: string) {
  return getCareerGuidance(uid);
}

export async function askAICareerAssistant(question: string) {
  return post(`${API_BASE}/api/ai`, { type: 'assistant', payload: { question } });
}

export async function fetchAIJobSuggestions(uid: string, skills: string[], branch: string, cgpa: string) {
  return post(`${API_BASE}/api/ai`, { type: 'job_suggestions', payload: { uid, skills, branch, cgpa } });
}

// ─── Generic AI passthrough (backwards compat) ───────────────────────────────
export async function callAI(type: string, payload: any) {
  return post(`${API_BASE}/api/ai`, { type, payload });
}