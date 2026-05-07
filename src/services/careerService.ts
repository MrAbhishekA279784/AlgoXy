import { loadDataFile } from './dataCleaner';
import { callGemini, isGeminiAvailable, genAI } from '../utils/gemini';
import { firestoreGet, firestoreQuery } from './firebaseService';

const getCareerData = () => ({
  roleProfiles: loadDataFile('career/roleProfiles.json') || {},
  roleSkillMap: loadDataFile('career/roleSkillMap.json') || {},
  intentMap: loadDataFile('career/intentMap.json') || {},
  synonymMap: loadDataFile('career/synonymMap.json') || {},
  careerFAQ: loadDataFile('career/careerFAQ.json') || [],
  roadmapTemplates: loadDataFile('career/roadmapTemplates.json') || [],
  projectSuggestions: loadDataFile('career/projectSuggestions.json') || [],
  resumeTips: loadDataFile('career/resumeTips.json') || [],
});

export function normalizeRole(role: string): string {
  if (!role) return 'Software Engineer';
  const norm = role.toLowerCase().trim();
  const map = getCareerData().synonymMap;
  for (const [standard, synonyms] of Object.entries(map as Record<string, string[]>)) {
      if (standard.toLowerCase() === norm || synonyms.map(s=>s.toLowerCase()).includes(norm)) {
          return standard;
      }
  }
  return role;
}

export function getBestRole(userSkills: string[], cgpa: number): string {
  let best = 'Software Engineer';
  let bestScore = -1;
  const roleSkillMap = getCareerData().roleSkillMap;
  for (const [role, data] of Object.entries(roleSkillMap as any)) {
    const { score } = calculateReadinessScore(userSkills, role);
    const meetsMin = cgpa >= ((data as any).minCGPA || 0);
    const weighted = score * (meetsMin ? 1.2 : 0.8);
    if (weighted > bestScore) { bestScore = weighted; best = role; }
  }
  return best;
}

export function calculateReadinessScore(userSkills: string[], targetRole: string): { score: number; missing: string[]; matched: string[] } {
  targetRole = normalizeRole(targetRole);
  const roleData = getCareerData().roleSkillMap[targetRole];
  if (!roleData) return { score: 50, missing: [], matched: userSkills };
  const required: string[] = roleData.required || [];
  const preferred: string[] = roleData.preferred || [];
  const matched = required.filter((s: string) => userSkills.some(us => us.toLowerCase().includes(s.toLowerCase())));
  const matchedPref = preferred.filter((s: string) => userSkills.some(us => us.toLowerCase().includes(s.toLowerCase())));
  const missing = required.filter((s: string) => !matched.includes(s));
  const score = Math.round(
    ((matched.length / Math.max(required.length, 1)) * 70) +
    ((matchedPref.length / Math.max(preferred.length, 1)) * 30)
  );
  return { score, missing, matched };
}

export function generateLocalCareerGuidance(userProfile: any, testData: any[], interviewData: any[]) {
  const skills = userProfile.skills || [];
  const cgpa = parseFloat(userProfile.cgpa || '0');
  const attendance = parseFloat(userProfile.attendance || '0');

  const topRole = getBestRole(skills, cgpa);
  const { missing, score } = calculateReadinessScore(skills, topRole);
  const profile = getCareerData().roleProfiles[topRole];

  let placementCat = 'Not Eligible';
  if (cgpa >= 8.5 && attendance >= 75) placementCat = 'Category 1';
  else if (cgpa >= 7.5 && attendance >= 60) placementCat = 'Category 2';
  else if (cgpa >= 7.0 && attendance >= 60) placementCat = 'Category 3';

  const avgTestScore = testData.length > 0
    ? Math.round(testData.reduce((a: number, t: any) => a + (t.score || 0), 0) / testData.length)
    : null;

  const skillTip = missing.length > 0
    ? `Focus on learning ${missing.slice(0, 2).join(' and ')} to strengthen your profile for ${topRole}.`
    : `You have the core skills for ${topRole}. Now build real projects to stand out.`;

  const interviewTip = avgTestScore !== null
    ? `Your average mock test score is ${avgTestScore}%. ${avgTestScore < 60 ? 'Practice more DSA problems daily.' : 'Great performance! Try a hard interview round next.'}`
    : 'Start with a Tech mock interview to benchmark your preparation.';

  const defaultRoadmap = [
    'Build core technical skills',
    'Complete 2-3 projects',
    'Practice aptitude tests',
    'Apply to campus drives',
  ];

  let roadmap = profile?.roadmap || defaultRoadmap;
  let roadmapEnriched = getCareerData().roadmapTemplates.find((rt: any) => normalizeRole(rt.role) === normalizeRole(topRole));
  if (roadmapEnriched && roadmapEnriched.phases) {
      roadmap = roadmapEnriched.phases.map((p:any) => typeof p === 'string' ? p : p.focus || p.title || p.name);
  }

  return {
    skillSuggestion: skillTip,
    topRole,
    interviewPrep: interviewTip,
    placementAdvice: `You are in ${placementCat}. ${cgpa < 8.5 ? `Raise CGPA to 8.5+ for Category 1.` : 'Maintain your CGPA and apply early to top companies.'}`,
    readinessScore: score,
    roadmap,
    topCompanies: profile?.topCompanies || [],
    certifications: profile?.certifications || [],
  };
}

export function detectIntentAndAnswer(question: string, context?: any): string | null {
    const q = question.toLowerCase();
    const data = getCareerData();
    let matchedIntent = null;
    
    for (const [intent, keywords] of Object.entries(data.intentMap as Record<string, string[]>)) {
        if (keywords.some(kw => q.includes(kw.toLowerCase()))) {
            matchedIntent = intent;
            break;
        }
    }

    if (!matchedIntent) return null;

    if (matchedIntent === 'roadmap') {
        const topRole = context?.topRole || 'Software Engineer';
        const rt = data.roadmapTemplates.find((r: any) => normalizeRole(r.role) === normalizeRole(topRole));
        if (rt && rt.phases) {
            return `Here is a roadmap for ${topRole}:\n\n` + rt.phases.map((p:any) => `- **${p.month || p.title || p.focus || 'Phase'}**: ${p.description || p.goals?.join(', ')}`).join('\n');
        }
    }

    if (matchedIntent === 'projects') {
        const topRole = context?.topRole || 'Software Engineer';
        const ps = data.projectSuggestions.find((p: any) => normalizeRole(p.role) === normalizeRole(topRole));
        if (ps && ps.projects) {
             return `Project ideas for ${topRole}:\n\n` + ps.projects.map((p:any) => `- **${p.title}** (${p.difficulty}): ${p.description}`).join('\n');
        }
    }

    if (matchedIntent === 'resume') {
        if (data.resumeTips.length > 0) {
            const tip = data.resumeTips[Math.floor(Math.random() * data.resumeTips.length)];
            return `Here's a resume tip: ${tip.tip || tip}`;
        }
    }

    if (matchedIntent === 'faq' || matchedIntent === 'interview' || matchedIntent === 'general') {
        // Find best FAQ match
        for (const faq of data.careerFAQ) {
            if (q.includes(faq.question.toLowerCase())) {
                return faq.answer;
            }
        }
    }
    
    return null;
}
