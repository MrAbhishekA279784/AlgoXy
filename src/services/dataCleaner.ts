import { readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../../data'); // src/services -> ../../ -> AlgoXy-main -> data

const filesToClean = [
  'career/roleProfiles.json',
  'career/roleSkillMap.json',
  'career/roadmapTemplates.json',
  'career/projectSuggestions.json',
  'career/careerFAQ.json',
  'career/resumeTips.json',
  'career/intentMap.json',
  'career/synonymMap.json',
  'interview/interviewBank.json',
  'interview/companyQuestions.json',
  'interview/behavioralQuestions.json',
  'interview/followupQuestions.json',
  'mcq/mcqBank.json',
  'mcq/dsa.json',
  'mcq/dbms.json',
  'mcq/os.json',
  'mcq/oop.json',
  'mcq/cn.json',
  'jobs/internshipBank.json',
  'jobs/fresherJobs.json',
  'jobs/companies.json',
];

function isInvalid(val: any): boolean {
  if (val === null || val === undefined) return true;
  if (typeof val === 'string') {
    const v = val.trim().toLowerCase();
    return v === '' || v === 'unknown' || v === 'n/a';
  }
  return false;
}

function repairJobs(jobs: any[], roleMap: any, companiesMap: any) {
  const companyLocations: Record<string, string> = {};
  jobs.forEach(j => {
    if (!isInvalid(j.company) && !isInvalid(j.location)) {
      companyLocations[j.company] = j.location;
    }
  });

  return jobs.map(j => {
    let company = j.company;
    let location = j.location;
    let role = j.role;
    let skills = j.skills || [];

    if (isInvalid(location)) {
      if (!isInvalid(company) && companyLocations[company]) {
        location = companyLocations[company];
      } else {
        location = "Bangalore"; 
      }
    }

    if (isInvalid(company)) {
      company = "Tech Startup"; 
      if (typeof role === 'string' && role.toLowerCase().includes('nvidia')) company = 'Nvidia';
    }

    if (isInvalid(role)) {
      role = "Software Engineer";
    }

    if (!Array.isArray(skills) || skills.length === 0) {
      if (roleMap && roleMap[role] && roleMap[role].required) {
        skills = roleMap[role].required;
      } else {
        skills = ["JavaScript", "HTML", "CSS", "Problem Solving"];
      }
    }
    
    company = company.trim();
    location = location.trim();
    role = role.trim();

    return { ...j, company, location, role, skills };
  });
}

function repairMCQ(mcqs: any[]) {
  return mcqs.filter(q => {
    if (!q || typeof q !== 'object') return false;
    if (isInvalid(q.question)) return false;
    return true;
  }).map(q => {
    let options = q.options || [];
    if (!Array.isArray(options)) options = [];
    if (options.length < 2) {
      options = ["True", "False"];
      q.correctAnswer = q.correctAnswer || "True";
    }
    
    let answer = q.correctAnswer;
    if (isInvalid(answer)) {
      answer = options[0] || "A"; 
    }

    if (!options.includes(answer) && options.length > 0) {
      answer = options[0]; 
    }

    let diff = q.difficulty;
    if (isInvalid(diff)) diff = "Medium";

    return { ...q, options, correctAnswer: answer, difficulty: diff };
  });
}

function repairGenericObject(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(repairGenericObject).filter(Boolean);
  } else if (obj !== null && typeof obj === 'object') {
    const newObj: any = {};
    for (const [k, v] of Object.entries(obj)) {
      const val = repairGenericObject(v);
      if (!isInvalid(val)) {
        newObj[k] = val;
      }
    }
    return newObj;
  } else if (typeof obj === 'string') {
    if (isInvalid(obj)) return "Default Value"; 
    return obj.replace(/\s+/g, ' ').trim();
  }
  return obj;
}

export function cleanAndRepairData() {
  console.log("🛠️ Starting Data Cleaning Layer...");
  const cache: Record<string, any> = {};

  filesToClean.forEach(file => {
    try {
      const p = path.join(DATA_DIR, file);
      const data = JSON.parse(readFileSync(p, 'utf-8'));
      cache[file] = data;
    } catch (e) {
      cache[file] = [];
    }
  });

  const roleSkillMap = cache['career/roleSkillMap.json'] || {};

  filesToClean.forEach(file => {
    let raw = cache[file];
    let cleaned: any;

    if (file === 'jobs/fresherJobs.json' || file === 'jobs/internshipBank.json') {
      cleaned = repairJobs(raw, roleSkillMap, cache['jobs/companies.json']);
    } else if (file === 'interview/interviewBank.json' || file === 'mcq/mcqBank.json') {
      const repairLevel = (obj: any, depth: number): any => {
        if (depth <= 0 || Array.isArray(obj)) return Array.isArray(obj) ? repairMCQ(obj) : obj;
        if (obj === null || typeof obj !== 'object') return obj;
        const newObj: any = {};
        for (const [k, v] of Object.entries(obj)) {
          newObj[k] = repairLevel(v, depth - 1);
        }
        return newObj;
      };
      // interviewBank: Category -> Company -> Role -> Array (depth 3)
      // mcqBank: Category -> Role -> Array (depth 2)
      cleaned = repairLevel(raw, file.includes('interview') ? 3 : 2);
    } else if (file.startsWith('mcq/')) {
      if (Array.isArray(raw)) {
        cleaned = repairMCQ(raw);
      } else {
        cleaned = repairGenericObject(raw);
      }
    } else {
      cleaned = repairGenericObject(raw);
    }

    if (Array.isArray(cleaned)) {
      const seen = new Set();
      cleaned = cleaned.filter(item => {
        const str = JSON.stringify(item);
        if (seen.has(str)) return false;
        seen.add(str);
        return true;
      });
    }

    try{
        writeFileSync(path.join(DATA_DIR, file), JSON.stringify(cleaned, null, 2));
    } catch(err) {
        console.error("Failed to repair " + file, err);
    }
    cache[file] = cleaned;
  });
  console.log("✅ Data Cleaning Layer Complete.");
}

export function loadDataFile(file: string) {
  try {
    return JSON.parse(readFileSync(path.join(DATA_DIR, file), 'utf-8'));
  } catch {
    return null;
  }
}
