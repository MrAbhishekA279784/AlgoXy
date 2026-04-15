const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export async function fetchOpportunities(type?: string) {
  const url =
    type && type !== "All"
      ? `${API_BASE}/api/opportunities?type=${type}`
      : `${API_BASE}/api/opportunities`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch opportunities");
  return res.json();
}

export async function fetchEvents() {
  const res = await fetch(`${API_BASE}/api/events`);
  if (!res.ok) throw new Error("Failed to fetch events");
  return res.json();
}

export async function fetchClubs() {
  const res = await fetch(`${API_BASE}/api/clubs`);
  if (!res.ok) throw new Error("Failed to fetch clubs");
  return res.json();
}

export async function fetchCommunity() {
  const res = await fetch(`${API_BASE}/api/community`);
  if (!res.ok) throw new Error("Failed to fetch community feed");
  return res.json();
}

export async function callAI(type: string, payload: any) {
  const res = await fetch(`${API_BASE}/api/ai`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ type, payload }),
  });

  if (!res.ok) throw new Error("AI request failed");

  return res.json();
}

export async function fetchAICareerInsights(uid?: string) {
  return callAI("career", { uid });
}

export async function askAICareerAssistant(question: string) {
  return callAI("assistant", { question });
}

export async function generateAITest(category: string, company: string, role: string) {
  return callAI("test", { category, company, role });
}

export async function chatAIInterview(category: string, company: string, role: string, history: any[], forceFinish?: boolean) {
  return callAI("interview", { category, company, role, history, forceFinish });
}

export async function fetchAIJobSuggestions(uid: string, skills: string[], branch: string, cgpa: string) {
  return callAI("job_suggestions", { uid, skills, branch, cgpa });
}

export async function fetchLeaderboard(filter?: string) {
  const url = filter ? `${API_BASE}/api/leaderboard?filter=${encodeURIComponent(filter)}` : `${API_BASE}/api/leaderboard`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch leaderboard");
  return res.json();
}
