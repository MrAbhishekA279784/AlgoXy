\# TCET CONNECT — FINAL PRODUCTION STABILIZATION + PERFORMANCE + FIREBASE OPTIMIZATION MASTER DIRECTIVE



You are now entering the FINAL engineering stabilization phase of the TCET Connect platform.



This is NOT a redesign task.

This is NOT a feature rewrite task.

This is NOT a UI modernization task.



This is a production-grade engineering hardening, stabilization, optimization, scalability, and deployment readiness operation.



You must behave like a senior software architect + Firebase scalability engineer + React performance engineer + deployment engineer.



━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PROJECT CONTEXT

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━



Project Name:

TCET Connect



Tech Stack:



\* React

\* Vite

\* TypeScript

\* Firebase Auth

\* Firestore

\* Local JSON datasets

\* Gemini AI integration (partial)

\* TailwindCSS

\* Firestore realtime listeners

\* Vercel deployment target



Architecture:

Frontend-first Firebase architecture.



Express dependency has been mostly removed from frontend.



Current production architecture:



\* Vercel hosts frontend

\* Firebase handles:



&#x20; \* auth

&#x20; \* Firestore

&#x20; \* realtime sync

&#x20; \* datasets

&#x20; \* role management



Datasets:



\* GATE questions

\* Mock interview datasets

\* branch-wise datasets

\* leaderboard data

\* opportunities/jobs

\* clubs/events/community



Roles:



\* student

\* teacher

\* super\_admin



━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CURRENT STATUS

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━



The application is MOSTLY stable.



Build status:



\* npm run dev → working

\* npm run build → working



Major Vercel deployment issues:



\* mostly resolved



Express dependency:



\* mostly removed



Firebase Auth:



\* functioning



Firestore:



\* functioning



Datasets:



\* functioning



Remaining issues are primarily:



\* listener cleanup

\* Firestore optimization

\* offline persistence

\* asset stability

\* performance hardening

\* bundle optimization

\* caching

\* scalability



━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CRITICAL INSTRUCTIONS

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━



DO NOT:



\* redesign UI

\* remove features

\* break layouts

\* rewrite architecture unnecessarily

\* remove datasets

\* simplify features

\* delete working functionality



DO:



\* preserve all current functionality

\* preserve all datasets

\* preserve routing

\* preserve auth system

\* preserve role-based access

\* preserve realtime sync

\* preserve existing pages/components



━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PRIMARY OBJECTIVE

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━



Convert the application from:

“HACKATHON WORKING BUILD”



into:

“STABLE PRODUCTION-READY FIREBASE WEB APP”



WITHOUT changing UX.



━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PHASE 1 — FULL EXECUTION FLOW AUDIT

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━



Before modifying anything:



TRACE the ENTIRE execution flow.



Analyze:



\* App.tsx

\* all providers

\* auth flow

\* routing flow

\* dashboard flow

\* Firestore listeners

\* dataset loading flow

\* local storage usage

\* state management flow

\* leaderboard flow

\* mock test flow

\* interview flow



Identify:



\* unstable rendering patterns

\* unnecessary rerenders

\* cascading state updates

\* repeated listeners

\* duplicate fetches

\* route remount issues

\* dependency array mistakes

\* stale closures

\* async race conditions



You MUST understand the system deeply BEFORE editing.



━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PHASE 2 — FIRESTORE LISTENER HARDENING

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━



TARGET FILE:

src/pages/TeacherDashboard.tsx



CRITICAL ISSUE:

Multiple Firestore onSnapshot listeners currently do not cleanup correctly.



This creates:



\* memory leaks

\* repeated subscriptions

\* duplicated Firestore reads

\* excessive realtime traffic

\* rerender storms

\* browser slowdown

\* potential Firebase billing spikes



━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

REQUIRED ACTIONS

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━



1\. Audit EVERY:



\* onSnapshot

\* listener

\* subscription

\* observer



2\. Ensure EVERY listener:



\* stores unsubscribe reference

\* returns cleanup function

\* unsubscribes correctly

\* cannot duplicate on rerender



3\. Prevent:



\* repeated subscriptions

\* state-triggered resubscriptions

\* unstable dependency arrays



━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BAD PATTERN

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━



NEVER leave:



useEffect(() => {

onSnapshot(...)

}, \[state])



━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

GOOD PATTERN

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━



useEffect(() => {

const unsubscribe = onSnapshot(...)



return () => unsubscribe()

}, \[])



━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ADDITIONAL REQUIREMENTS

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━



\* merge related listeners where safe

\* reduce redundant Firestore subscriptions

\* prevent duplicate listener mounting

\* prevent race conditions

\* avoid nested listeners

\* ensure no orphan listeners remain after navigation



━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PHASE 3 — FIRESTORE QUERY OPTIMIZATION

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━



TARGET FILE:

src/lib/api.ts



━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

KNOWN ISSUES

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━



Unbounded Firestore reads:



\* club\_memberships

\* attendance



Potential problems:



\* unnecessary billing

\* slow dashboard loading

\* scalability issues

\* memory pressure

\* excessive network usage



━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

REQUIRED ACTIONS

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━



1\. Audit ALL:



\* getDocs

\* collection reads

\* queries

\* snapshots



2\. Detect:



\* full collection scans

\* unnecessary reads

\* repeated reads

\* duplicate queries



3\. Implement:



\* query limits

\* pagination

\* batched reads

\* filtering

\* selective field access

\* optimized ordering



━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

IMPORTANT

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━



Do NOT break:



\* leaderboard

\* attendance

\* analytics

\* dashboard widgets

\* student data flow



━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

OPTIMIZATION REQUIREMENTS

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━



\* minimize Firestore reads

\* reduce realtime bandwidth

\* reduce Firestore billing risks

\* preserve realtime behavior where necessary

\* avoid unnecessary realtime listeners for static data



━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PHASE 4 — FIRESTORE OFFLINE PERSISTENCE

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━



TARGET FILE:

src/lib/firebase.ts



━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

OBJECTIVE

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━



Implement stable Firestore offline persistence.



━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

REQUIREMENTS

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━



1\. Add:



\* offline cache persistence

\* multi-tab safe handling

\* graceful persistence fallback



2\. Prevent:



\* offline crash loops

\* duplicate persistence initialization

\* tab conflicts

\* auth desync issues



3\. Ensure:



\* stable reconnect behavior

\* stable offline reads

\* smooth user experience during network loss



━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EDGE CASES

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━



Handle:



\* browser without persistence support

\* persistence already enabled

\* multiple tabs

\* reconnect loops

\* auth refresh while offline



━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PHASE 5 — REACT RENDER STABILITY

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━



Audit ALL:



\* useEffect

\* useMemo

\* useCallback

\* state updates

\* derived state

\* contexts



━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DETECT

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━



\* unstable dependency arrays

\* stale closures

\* repeated renders

\* unnecessary rerenders

\* duplicated state

\* render loops

\* unnecessary remounting

\* repeated async calls



━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SPECIAL ATTENTION FILES

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━



\* Home.tsx

\* MockInterviews.tsx

\* LeaderboardWidget.tsx

\* Landing.tsx

\* TeacherDashboard.tsx

\* AdminDashboard.tsx



━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PHASE 6 — LEADERBOARD STABILIZATION

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━



TARGET FILE:

src/components/home/LeaderboardWidget.tsx



━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CURRENT ISSUES

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━



\* repeated reads

\* no caching

\* repeated loading states

\* unnecessary rerenders



━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

REQUIRED ACTIONS

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━



Implement:



\* local caching

\* memoization

\* stable fetch lifecycle

\* graceful loading states

\* minimal rerenders



Ensure:



\* leaderboard updates properly

\* no realtime spam

\* smooth rendering

\* low Firestore cost



━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PHASE 7 — DATASET SYSTEM HARDENING

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━



━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

VERIFY ENTIRE DATASET PIPELINE

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━



Check:



\* local JSON imports

\* dynamic imports

\* question generation

\* branch mapping

\* subject mapping

\* randomization

\* year tagging

\* scoring

\* fallback systems



━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ENSURE

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━



\* no dataset crashes

\* no undefined questions

\* no invalid branches

\* no broken imports

\* no stale references

\* no duplicated question generation



━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

MOCK TEST SYSTEM

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━



Ensure:



\* local/offline-safe functionality

\* stable question rendering

\* stable timing

\* stable scoring

\* no infinite loops



━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

INTERVIEW SYSTEM

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━



Ensure:



\* local dataset fallback

\* graceful Gemini failure handling

\* no blank interview screens

\* stable question generation



━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PHASE 8 — AI/GEMINI RESILIENCE

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━



IMPORTANT:

Gemini backend may not always be available.



━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

REQUIREMENTS

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━



1\. Add:



\* graceful fallback responses

\* safe error handling

\* loading protection

\* retry protection



2\. Prevent:



\* blank widgets

\* app crashes

\* infinite loading

\* repeated API retries



3\. Ensure:



\* AI assistant degrades gracefully

\* dataset fallback works

\* frontend never hard-crashes



━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PHASE 9 — EXTERNAL ASSET HARDENING

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━



TARGET FILES:



\* BackgroundEffects.tsx

\* CompanyLogo.tsx



━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ISSUES

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━



\* unstable external asset URLs

\* Clearbit dependency failures

\* image request spam

\* broken external logos



━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

REQUIRED ACTIONS

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━



1\. Replace unstable external URLs where possible



2\. Add:



\* image fallbacks

\* loading fallbacks

\* graceful placeholders



3\. Prevent:



\* broken image spam

\* infinite retries

\* layout shifts



━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PHASE 10 — PERFORMANCE OPTIMIZATION

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━



━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CURRENT STATUS

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━



Bundle size:

\~1.1MB



━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

OBJECTIVE

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━



Reduce unnecessary initial bundle size WITHOUT breaking routing.



━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

OPTIONAL SAFE OPTIMIZATIONS

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━



If safe:



\* lazy load heavy pages

\* split heavy routes

\* optimize dynamic imports

\* reduce duplicated imports

\* reduce unnecessary dependencies



━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DO NOT

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━



\* break routing

\* break auth

\* break datasets

\* break realtime sync



━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PHASE 11 — SECURITY HARDENING

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━



Audit:



\* Firebase writes

\* role checks

\* auth guards

\* admin access

\* Firestore exposure

\* Gemini usage



━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ENSURE

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━



\* no exposed secrets

\* no unsafe admin bypass

\* no insecure writes

\* proper auth gating

\* safe role checks



━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PHASE 12 — FINAL VALIDATION

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━



AFTER ALL CHANGES:



Run COMPLETE validation.



━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

REQUIRED VALIDATION

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━



1\. npm run dev

2\. npm run build

3\. Vercel compatibility

4\. auth flow

5\. student dashboard

6\. teacher dashboard

7\. admin dashboard

8\. mock tests

9\. interview system

10\. leaderboard

11\. datasets

12\. Firestore sync

13\. offline handling

14\. loading states

15\. fallback behavior



━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ENSURE

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━



\* no HTTP 404 APIs

\* no blank widgets

\* no infinite loading

\* no white screens

\* no auth loops

\* no listener leaks

\* no rerender storms

\* no repeated fetch spam

\* no Firestore overreads



━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FINAL OUTPUT REQUIRED

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━



After completion provide:



1\. Exact files modified

2\. Exact issues fixed

3\. Exact optimizations added

4\. Remaining technical debt

5\. Firestore cost optimization summary

6\. Performance improvement summary

7\. Scalability improvements

8\. Deployment readiness checklist

9\. Final production readiness score

10\. Remaining architectural recommendations



━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

IMPORTANT FINAL RULE

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━



This is NOT a cosmetic refactor.



This is a:



\* production stabilization

\* Firebase optimization

\* React performance hardening

\* deployment reliability

\* scalability engineering

\* memory leak prevention

\* Firestore cost optimization

\* architecture hardening



operation.



Trace real execution paths carefully before making ANY modification.



