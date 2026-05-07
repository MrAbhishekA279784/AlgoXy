import { loadDataFile } from './dataCleaner';

const FALLBACK_JOBS = [
  { id: 'seed-1', company: 'Google', role: 'Software Engineer', location: 'Bangalore, India', type: 'Full-time', salary: '₹25,00,000 / year', posted: '1d ago', apply_url: 'https://careers.google.com', skills: ['React', 'Python', 'DSA'] },
  { id: 'seed-2', company: 'Microsoft', role: 'Frontend Developer', location: 'Hyderabad, India', type: 'Full-time', salary: '₹20,00,000 / year', posted: '3d ago', apply_url: 'https://careers.microsoft.com', skills: ['React', 'TypeScript'] },
  { id: 'seed-3', company: 'Amazon', role: 'Backend Developer', location: 'Chennai, India', type: 'Full-time', salary: '₹22,00,000 / year', posted: '2d ago', apply_url: 'https://amazon.jobs', skills: ['Java', 'AWS'] },
  { id: 'seed-4', company: 'Internshala', role: 'Web Development Intern', location: 'Remote', type: 'Internship', salary: '₹15,000 / month', posted: 'Just now', apply_url: 'https://internshala.com', skills: ['HTML', 'CSS', 'JS'] },
  { id: 'seed-5', company: 'LinkedIn', role: 'Product Management Intern', location: 'Mumbai, India', type: 'Internship', salary: '₹40,000 / month', posted: '2h ago', apply_url: 'https://linkedin.com', skills: ['Product', 'Agile'] },
  { id: 'seed-6', company: 'Flipkart', role: 'Data Science Intern', location: 'Bangalore, India', type: 'Internship', salary: '₹30,000 / month', posted: '1d ago', apply_url: 'https://flipkart.com', skills: ['Python', 'ML'] },
  { id: 'seed-7', company: 'TCS', role: 'Systems Engineer', location: 'Mumbai, India', type: 'Full-time', salary: '₹7,00,000 / year', posted: '5d ago', apply_url: 'https://tcs.com/careers', skills: ['Java', 'SQL'] },
  { id: 'seed-8', company: 'Wipro', role: 'Cloud Engineer', location: 'Pune, India', type: 'Full-time', salary: '₹8,50,000 / year', posted: '4d ago', apply_url: 'https://wipro.com/careers', skills: ['AWS', 'Docker'] },
];

const getJobData = () => ({
  internshipBank: loadDataFile('jobs/internshipBank.json') || [],
  fresherJobs: loadDataFile('jobs/fresherJobs.json') || [],
  companies: loadDataFile('jobs/companies.json') || [],
});

export async function fetchAdzuna(keywords: string, country = 'in'): Promise<any[]> {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_API_KEY;
  if (!appId || !appKey) return [];
  try {
    const url = `https://api.adzuna.com/v1/api/jobs/${country}/search/1?app_id=${appId}&app_key=${appKey}&results_per_page=15&what=${encodeURIComponent(keywords)}&content-type=application/json`;
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return [];
    const data: any = await res.json();
    return (data.results || []).map((j: any) => ({
      id: `az-${j.id}`,
      company: j.company?.display_name || 'Unknown',
      role: j.title,
      location: j.location?.display_name || 'India',
      type: j.contract_time === 'part_time' ? 'Internship' : 'Full-time',
      salary: j.salary_min ? `₹${Math.round(j.salary_min / 100000)}L/yr` : 'Competitive',
      posted: 'Recently',
      apply_url: j.redirect_url,
      skills: [],
      source: 'Adzuna',
    }));
  } catch { return []; }
}

export async function fetchGreenhouse(): Promise<any[]> {
  try {
    const res = await fetch('https://boards-api.greenhouse.io/v1/boards/google/jobs?content=true', {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return [];
    const data: any = await res.json();
    return (data.jobs || []).slice(0, 8).map((j: any, i: number) => ({
      id: `gh-${j.id || i}`,
      company: 'Google',
      role: j.title,
      location: j.location?.name || 'India',
      type: 'Full-time',
      salary: 'Competitive',
      posted: 'Recently',
      apply_url: j.absolute_url,
      skills: [],
      source: 'Greenhouse',
    }));
  } catch { return []; }
}

export function deduplicateJobs(jobs: any[]): any[] {
  const seen = new Set<string>();
  return jobs.filter(j => {
    const key = `${j.company}|${j.role}`.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function getLocalFallbackJobs(type: string) {
    const defaultFallbacks = type && type !== 'All'
        ? FALLBACK_JOBS.filter(j => j.type === type)
        : FALLBACK_JOBS;
        
    const data = getJobData();
    let localBank: any[] = [];
    if (type === 'Internship' || type === 'All') {
        localBank.push(...data.internshipBank);
    }
    if (type !== 'Internship' || type === 'All') {
        localBank.push(...data.fresherJobs);
    }
    
    // Mix and deduplicate
    return deduplicateJobs([...localBank, ...defaultFallbacks]);
}
