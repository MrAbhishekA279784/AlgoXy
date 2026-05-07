import { loadDataFile } from './dataCleaner';

const getInterviewData = () => ({
  interviewBank: loadDataFile('interview/interviewBank.json') || {},
  companyQuestions: loadDataFile('interview/companyQuestions.json') || {},
  behavioralQuestions: loadDataFile('interview/behavioralQuestions.json') || {},
  followupQuestions: loadDataFile('interview/followupQuestions.json') || {},
});

export function getInterviewQuestionsFromBank(category: string, company: string, role: string): string[] {
  const data = getInterviewData();
  let questions: string[] = [];

  const companyBankStr = company.toLowerCase().trim();
  let companyQ: string[] = [];
  for (const [k, v] of Object.entries(data.companyQuestions)) {
      if (k.toLowerCase() === companyBankStr) {
          companyQ = v as string[]; break;
      }
  }

  const categoryBank = (data.interviewBank[category] || {}) as any;
  const companyBank = (categoryBank[company] || {}) as any;
  const roleQ: string[] = (companyBank[role] || data.interviewBank.generic || []);
  
  // Flatten behavioral
  let behavioralQ: string[] = [];
  for (const v of Object.values(data.behavioralQuestions)) {
       if (Array.isArray(v)) behavioralQ.push(...v);
  }

  const shuffle = (arr: any[]) => [...arr].sort(() => 0.5 - Math.random());

  questions.push(...shuffle(companyQ).slice(0, 3));
  questions.push(...shuffle(roleQ).slice(0, 5));
  questions.push(...shuffle(behavioralQ).slice(0, 2));

  while (questions.length < 10 && roleQ.length > 0) {
      const q = roleQ[Math.floor(Math.random() * roleQ.length)];
      if (!questions.includes(q)) questions.push(q);
      else break; 
  }

  if (questions.length < 10) {
      questions.push(...(data.interviewBank?.generic || []).slice(0, 10 - questions.length));
  }
  if (questions.length === 0) {
      questions = ["Tell me about yourself.", "Why should we hire you?"];
  }

  return questions;
}

export function buildInitialInterviewMessage(category: string, company: string, role: string): { reply: string, questions: string[] } {
  const questions = getInterviewQuestionsFromBank(category, company, role);
  const q = questions[0] || `Tell me about yourself and your interest in the ${role} role at ${company}.`;
  return {
    reply: `Hello! I'm your AI interviewer for the ${role} position at ${company}. We'll go through 10 questions today. Let's begin!\n\n**Question 1:** ${q}`,
    questions
  };
}

export function getNextQuestionFromBank(category: string, company: string, role: string, questionIndex: number): string | null {
  const questions = getInterviewQuestionsFromBank(category, company, role);
  if (questionIndex < questions.length) return questions[questionIndex];
  return null;
}
