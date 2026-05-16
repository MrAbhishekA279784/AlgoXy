import interviewBankData from '../../data/interview/interviewBank.json';
import companyQuestionsData from '../../data/interview/companyQuestions.json';
import behavioralQuestionsData from '../../data/interview/behavioralQuestions.json';

interface InterviewData {
  [category: string]: {
    [company: string]: {
      [role: string]: string[];
    };
  } | string[];
  generic?: string[];
}

interface CompanyQuestions {
  [company: string]: string[];
}

interface BehavioralQuestions {
  [key: string]: string[];
}

const interviewBank: InterviewData = interviewBankData as unknown as InterviewData;
const companyQuestions: CompanyQuestions = companyQuestionsData as unknown as CompanyQuestions;
const behavioralQuestions: BehavioralQuestions = behavioralQuestionsData as unknown as BehavioralQuestions;

export interface InterviewState {
  category: string;
  company: string;
  role: string;
  questions: string[];
  currentIndex: number;
  history: { role: string; text: string }[];
  isFinished: boolean;
}

export const interviewService = {
  startInterview(category: string, company: string, role: string): InterviewState {
    const questions = this.getQuestionsFromBank(category, company, role);
    const firstQuestion = questions[0] || `Tell me about yourself and your interest in the ${role} role at ${company}.`;

    return {
      category,
      company,
      role,
      questions,
      currentIndex: 0,
      history: [
        { 
          role: 'ai', 
          text: `Hello! I'm your AI interviewer for the ${role} position at ${company}. We'll go through 10 questions today. Let's begin!\n\n**Question 1:** ${firstQuestion}`
        }
      ],
      isFinished: false
    };
  },

  getQuestionsFromBank(category: string, company: string, role: string): string[] {
    const companyKey = company.toLowerCase().trim();
    const companyQ = companyQuestions[companyKey] || [];

    const categoryBank = interviewBank[category] || {};
    const companyBank = categoryBank[company] || {};
    const roleQ = companyBank[role] || interviewBank.generic || [];

    const behavioralQ: string[] = [];
    Object.values(behavioralQuestions).forEach(qs => {
      if (Array.isArray(qs)) behavioralQ.push(...qs);
    });

    const allQuestions: string[] = [
      ...this.shuffleArray(companyQ).slice(0, 3),
      ...this.shuffleArray(roleQ).slice(0, 5),
      ...this.shuffleArray(behavioralQ).slice(0, 2)
    ];

    let index = 0;
    while (allQuestions.length < 10 && index < roleQ.length) {
      if (!allQuestions.includes(roleQ[index])) {
        allQuestions.push(roleQ[index]);
      }
      index++;
    }

    if (allQuestions.length < 10 && interviewBank.generic) {
      allQuestions.push(...interviewBank.generic.slice(0, 10 - allQuestions.length));
    }

    return allQuestions;
  },

  getNextQuestion(state: InterviewState): InterviewState {
    const nextIndex = state.currentIndex + 1;
    const nextQ = state.questions[nextIndex];

    if (!nextQ) {
      return {
        ...state,
        isFinished: true,
        history: [
          ...state.history,
          { role: 'ai', text: 'Thank you for answering all questions. Click "End Session" to get your feedback.' }
        ]
      };
    }

    return {
      ...state,
      currentIndex: nextIndex,
      history: [
        ...state.history,
        { role: 'ai', text: `**Question ${nextIndex + 1}:** ${nextQ}` }
      ]
    };
  },

  addUserAnswer(state: InterviewState, answer: string): InterviewState {
    return {
      ...state,
      history: [...state.history, { role: 'user', text: answer }]
    };
  },

  generateFeedback(state: InterviewState): { 
    score: number; 
    strengths: string[]; 
    weaknesses: string[]; 
    suggestedLearning: string[] 
  } {
    const answerCount = state.history.filter(h => h.role === 'user').length;
    const score = Math.min(95, 45 + answerCount * 5);

    return {
      score,
      strengths: [
        'Completed the interview session',
        'Showed initiative in applying',
        'Demonstrated willingness to learn'
      ],
      weaknesses: [
        'Provide more specific technical examples',
        'Elaborate with real project experience',
        'Practice STAR method for behavioral questions'
      ],
      suggestedLearning: [
        'System Design Fundamentals',
        'Data Structures & Algorithms',
        'Problem Solving with LeetCode'
      ]
    };
  },

  shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  },

  getCategories(): string[] {
    return ['Tech', 'Management', 'Core', 'HR', 'Behavioral'];
  },

  getCompanies(): string[] {
    return Object.keys(companyQuestions);
  },

  getRoles(): string[] {
    return ['Software Engineer', 'Data Scientist', 'Full Stack Developer', 'Frontend Developer', 'Backend Developer', 'Product Manager'];
  }
};

export default interviewService;