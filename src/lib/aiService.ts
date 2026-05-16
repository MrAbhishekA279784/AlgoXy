import roleProfilesData from '../../data/career/roleProfiles.json';
import roleSkillMapData from '../../data/career/roleSkillMap.json';

interface RoleProfiles {
  [role: string]: {
    description: string;
    requiredSkills: string[];
    recommendedCourses: string[];
    salary: string;
    growth: string;
  };
}

interface RoleSkillMap {
  [role: string]: {
    required: string[];
    preferred: string[];
  };
}

const roleProfiles: RoleProfiles = roleProfilesData as unknown as RoleProfiles;
const roleSkillMap: RoleSkillMap = roleSkillMapData as unknown as RoleSkillMap;

const FALLBACK_RESPONSES = {
  guidance: "I'm your AI Career Assistant. Here are some tips:\n\n1. **Build strong fundamentals** in Data Structures and Algorithms\n2. **Create projects** that solve real problems\n3. **Practice mock interviews** regularly\n4. **Stay updated** with industry trends\n\nWould you like specific career guidance for a particular role?",
  
  jobSuggestions: "Based on your profile, here are some areas to focus on:\n\n1. **Strengthen core skills** in your domain\n2. **Build a portfolio** of projects\n3. **Prepare for aptitude tests**\n4. **Practice coding** on platforms like LeetCode\n\nKeep improving and you'll land your dream job!",
  
  default: "I'm here to help with your career journey. I can assist with:\n\n- Career guidance and role suggestions\n- Resume tips and interview preparation\n- Skill development recommendations\n- Job search strategies\n\nWhat would you like to know more about?"
};

const SAMPLE_QUESTIONS = [
  "What skills do I need for software engineering?",
  "How do I prepare for placements?",
  "Tips for resume building",
  "Interview preparation guide"
];

export const aiService = {
  async askAssistant(question: string): Promise<{ answer: string }> {
    const lowerQ = question.toLowerCase();

    if (lowerQ.includes('software') || lowerQ.includes('developer') || lowerQ.includes('engineer')) {
      const role = roleProfiles['Software Engineer'];
      if (role) {
        return {
          answer: `For a **Software Engineer** role:\n\n**Required Skills:** ${role.requiredSkills.join(', ')}\n\n**Growth:** ${role.growth}\n**Avg Salary:** ${role.salary}\n\nWould you like more details on how to prepare?`
        };
      }
    }

    if (lowerQ.includes('data') || lowerQ.includes('machine learning') || lowerQ.includes('ai')) {
      const role = roleProfiles['Data Scientist'];
      if (role) {
        return {
          answer: `For a **Data Scientist** role:\n\n**Required Skills:** ${role.requiredSkills.join(', ')}\n\n**Growth:** ${role.growth}\n**Avg Salary:** ${role.salary}\n\nCheck our AI Career Assistant for personalized guidance!`
        };
      }
    }

    if (lowerQ.includes('resume') || lowerQ.includes('cv')) {
      return {
        answer: `**Resume Tips:**\n\n1. Keep it concise (1-2 pages)\n2. Highlight projects and achievements\n3. Use action verbs\n4. Customize for each job\n5. Include relevant skills\n\nNeed more help? Ask the AI Assistant!`
      };
    }

    if (lowerQ.includes('interview') || lowerQ.includes('prepare')) {
      return {
        answer: `**Interview Preparation:**\n\n1. Practice coding problems (LeetCode, GeeksforGeeks)\n2. Prepare for HR questions\n3. Research the company\n4. Practice mock interviews\n5. Be confident and clear\n\nUse our Mock Interview feature to practice!`
      };
    }

    return { answer: FALLBACK_RESPONSES.default };
  },

  async getGuidance(uid?: string): Promise<{ answer: string }> {
    return { answer: FALLBACK_RESPONSES.guidance };
  },

  async getJobSuggestions(skills: string[], branch: string, cgpa: string): Promise<{ answer: string }> {
    const suggestions: string[] = [];

    if (skills.some(s => s.toLowerCase().includes('web') || s.toLowerCase().includes('react'))) {
      suggestions.push('Frontend Developer', 'Full Stack Developer');
    }
    if (skills.some(s => s.toLowerCase().includes('data') || s.toLowerCase().includes('python'))) {
      suggestions.push('Data Analyst', 'Data Scientist');
    }
    if (skills.some(s => s.toLowerCase().includes('java') || s.toLowerCase().includes('node'))) {
      suggestions.push('Backend Developer', 'Software Engineer');
    }

    const suggestionsText = suggestions.length > 0 
      ? suggestions.join(', ') 
      : 'Software Engineer, Web Developer, Data Analyst';

    return {
      answer: `Based on your profile (Branch: ${branch}, CGPA: ${cgpa}), here are suitable roles:\n\n**${suggestionsText}**\n\n${FALLBACK_RESPONSES.jobSuggestions}`
    };
  },

  getSampleQuestions(): string[] {
    return SAMPLE_QUESTIONS;
  },

  isGeminiAvailable(): boolean {
    return !!(import.meta.env.VITE_GEMINI_API_KEY);
  }
};

export default aiService;