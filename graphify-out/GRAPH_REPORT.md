# Graph Report - .  (2026-05-16)

## Corpus Check
- Corpus is ~31,518 words - fits in a single context window. You may not need a graph.

## Summary
- 240 nodes · 417 edges · 34 communities (18 shown, 16 thin omitted)
- Extraction: 90% EXTRACTED · 10% INFERRED · 0% AMBIGUOUS · INFERRED: 42 edges (avg confidence: 0.8)
- Token cost: 500 input · 200 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Backend Services & AI Integration|Backend Services & AI Integration]]
- [[_COMMUNITY_Client API Layer & Home Components|Client API Layer & Home Components]]
- [[_COMMUNITY_Admin & Teacher Dashboards|Admin & Teacher Dashboards]]
- [[_COMMUNITY_Interview & Test Persistence|Interview & Test Persistence]]
- [[_COMMUNITY_UI Utilities & Profile|UI Utilities & Profile]]
- [[_COMMUNITY_Authentication & Landing|Authentication & Landing]]
- [[_COMMUNITY_Opportunities & Jobs|Opportunities & Jobs]]
- [[_COMMUNITY_Clubs Module|Clubs Module]]
- [[_COMMUNITY_Events Module|Events Module]]
- [[_COMMUNITY_Main Application Shell & Theme|Main Application Shell & Theme]]
- [[_COMMUNITY_Data Cleaning Utilities|Data Cleaning Utilities]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]

## God Nodes (most connected - your core abstractions)
1. `cn()` - 19 edges
2. `post()` - 18 edges
3. `apiFetch()` - 13 edges
4. `handleFirestoreError()` - 11 edges
5. `loadDataFile()` - 9 edges
6. `put()` - 8 edges
7. `del()` - 8 edges
8. `fetchOpportunities()` - 7 edges
9. `getCareerData()` - 7 edges
10. `createJob()` - 6 edges

## Surprising Connections (you probably didn't know these)
- `handleSubmit()` --calls--> `joinClub()`  [INFERRED]
  src/components/home/ActiveClubs.tsx → src/lib/db.ts
- `handleSubmit()` --calls--> `registerForEvent()`  [INFERRED]
  src/components/home/UpcomingEvents.tsx → src/lib/db.ts
- `loadData()` --calls--> `fetchOpportunities()`  [INFERRED]
  src/pages/Opportunities.tsx → src/lib/api.ts
- `handleCreateJob()` --calls--> `createJob()`  [INFERRED]
  src/pages/AdminDashboard.tsx → src/lib/api.ts
- `handleCreateJob()` --calls--> `createJob()`  [INFERRED]
  src/pages/TeacherDashboard.tsx → src/lib/api.ts

## Communities (34 total, 16 thin omitted)

### Community 0 - "Backend Services & AI Integration"
Cohesion: 0.11
Nodes (29): cacheGet(), cacheSet(), saveCache(), calculateReadinessScore(), detectIntentAndAnswer(), generateLocalCareerGuidance(), getBestRole(), getCareerData() (+21 more)

### Community 1 - "Client API Layer & Home Components"
Cohesion: 0.1
Nodes (30): handleSubmit(), addClubMember(), apiFetch(), askAICareerAssistant(), callAI(), createPost(), fetchAdminStats(), fetchAdminUsers() (+22 more)

### Community 2 - "Admin & Teacher Dashboards"
Cohesion: 0.1
Nodes (28): createAttendance(), createClub(), createEvent(), createJob(), del(), deleteAdminUser(), deleteClub(), deleteEvent() (+20 more)

### Community 3 - "Interview & Test Persistence"
Cohesion: 0.14
Nodes (20): chatAIInterview(), getFollowupQuestion(), getInterviewFeedback(), startInterview(), createCommunityPost(), getCommunityPosts(), getUserActivity(), handleFirestoreError() (+12 more)

### Community 4 - "UI Utilities & Profile"
Cohesion: 0.1
Nodes (9): fetchLeaderboard(), calculatePlacementCategory(), getCategoryBadgeStyles(), getJuniorMotivationHint(), cn(), loadLeaders(), addSkill(), handleUpdateProfile() (+1 more)

### Community 5 - "Authentication & Landing"
Cohesion: 0.26
Nodes (6): ensureUserDocument(), handleGoogleRedirectResult(), logout(), signInWithEmail(), signInWithGoogle(), handleEmailLogin()

### Community 6 - "Opportunities & Jobs"
Cohesion: 0.36
Nodes (5): fetchOpportunities(), searchJobs(), applyForJob(), handleApply(), loadData()

### Community 7 - "Clubs Module"
Cohesion: 0.36
Nodes (5): handleSubmit(), fetchClubs(), joinClub(), handleJoin(), loadData()

### Community 8 - "Events Module"
Cohesion: 0.38
Nodes (3): handleSubmit(), registerForEvent(), handleRegister()

## Knowledge Gaps
- **14 isolated node(s):** `TCET CONNECT`, `TCET Connect â€” Project Progress Report`, `TCET Connect â€” AI-Powered Training & Placement Platform`, `Placement Eligibility System`, `AI Career Assistant` (+9 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **16 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `UI Utilities & Profile` to `Client API Layer & Home Components`, `Admin & Teacher Dashboards`, `Interview & Test Persistence`, `Opportunities & Jobs`, `Clubs Module`, `Events Module`, `Main Application Shell & Theme`?**
  _High betweenness centrality (0.186) - this node is a cross-community bridge._
- **Why does `joinClub()` connect `Clubs Module` to `Interview & Test Persistence`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `loadDataFile()` (e.g. with `getCareerData()` and `getInterviewData()`) actually correct?**
  _`loadDataFile()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `TCET CONNECT`, `TCET Connect â€” Project Progress Report`, `TCET Connect â€” AI-Powered Training & Placement Platform` to the rest of the system?**
  _14 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Backend Services & AI Integration` be split into smaller, more focused modules?**
  _Cohesion score 0.11 - nodes in this community are weakly interconnected._
- **Should `Client API Layer & Home Components` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._
- **Should `Admin & Teacher Dashboards` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._