export async function fetchOpportunities(type?: string) {
  const url =
    type && type !== "All"
      ? `/api/opportunities?type=${type}`
      : "/api/opportunities";
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch opportunities");
  return res.json();
}

export async function callAI(type: string, payload: any) {
  const res = await fetch("/api/ai", {
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
  const url = filter ? `/api/leaderboard?filter=${encodeURIComponent(filter)}` : "/api/leaderboard";
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch leaderboard");
  return res.json();
}
