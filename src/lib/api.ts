export async function fetchOpportunities(type?: string) {
  const url =
    type && type !== "All"
      ? `/api/opportunities?type=${type}`
      : "/api/opportunities";
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch opportunities");
  return res.json();
}

export async function fetchAICareerInsights(uid?: string) {
  const url = uid ? `/api/ai/career-insights?uid=${uid}` : "/api/ai/career-insights";
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch AI insights");
  return res.json();
}

export async function fetchLeaderboard(filter?: string) {
  const url = filter ? `/api/leaderboard?filter=${encodeURIComponent(filter)}` : "/api/leaderboard";
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch leaderboard");
  return res.json();
}

export async function askAICareerAssistant(question: string) {
  const res = await fetch("/api/ai/ask", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ question }),
  });
  if (!res.ok) throw new Error("Failed to ask AI");
  return res.json();
}

export async function generateAITest(category: string, company: string, role: string) {
  const res = await fetch("/api/ai/generate-test", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ category, company, role }),
  });
  if (!res.ok) throw new Error("Failed to generate test");
  return res.json();
}

export async function chatAIInterview(category: string, company: string, role: string, history: any[], forceFinish?: boolean) {
  const res = await fetch("/api/ai/interview-chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ category, company, role, history, forceFinish }),
  });
  if (!res.ok) throw new Error("Failed to chat with AI");
  return res.json();
}
