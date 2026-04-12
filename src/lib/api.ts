const API_BASE = "https://algoxy.onrender.com/api"

export async function fetchOpportunities(type?: string) {
  const url =
    type && type !== "All"
      ? `${API_BASE}/opportunities?type=${type}`
      : `${API_BASE}/opportunities`

  const res = await fetch(url)

  if (!res.ok) throw new Error("Failed to fetch opportunities")

  return res.json()
}

export async function fetchAICareerInsights(uid?: string) {
  const url =
    uid
      ? `${API_BASE}/ai/career-insights?uid=${uid}`
      : `${API_BASE}/ai/career-insights`

  const res = await fetch(url)

  if (!res.ok) throw new Error("Failed to fetch AI insights")

  return res.json()
}

export async function fetchLeaderboard(filter?: string) {
  const url =
    filter
      ? `${API_BASE}/leaderboard?filter=${encodeURIComponent(filter)}`
      : `${API_BASE}/leaderboard`

  const res = await fetch(url)

  if (!res.ok) throw new Error("Failed to fetch leaderboard")

  return res.json()
}

export async function askAICareerAssistant(question: string) {
  const res = await fetch(`${API_BASE}/ai/ask`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ question })
  })

  if (!res.ok) throw new Error("Failed to ask AI")

  return res.json()
}

export async function generateAITest(category: string, company: string, role: string) {
  const res = await fetch(`${API_BASE}/ai/generate-test`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      category,
      company,
      role
    })
  })

  if (!res.ok) throw new Error("Failed to generate test")

  return res.json()
}

export async function chatAIInterview(category: string, company: string, role: string, history: any[], forceFinish?: boolean) {
  const res = await fetch(`${API_BASE}/ai/interview-chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      category,
      company,
      role,
      history,
      forceFinish
    })
  })

  if (!res.ok) throw new Error("Failed to chat with AI")

  return res.json()
}