import dsaData from '../../data/mcq/dsa.json';
import dbmsData from '../../data/mcq/dbms.json';
import osData from '../../data/mcq/os.json';
import oopData from '../../data/mcq/oop.json';
import cnData from '../../data/mcq/cn.json';
import mcqBankData from '../../data/mcq/mcqBank.json';

export interface MCQ {
  question: string;
  options: string[];
  correctAnswer: string;
  difficulty?: string;
  category?: string;
}

interface MCQBank {
  [category: string]: {
    [role: string]: MCQ[];
  };
}

const mcqData: Record<string, MCQ[]> = {
  dsa: dsaData as unknown as MCQ[],
  dbms: dbmsData as unknown as MCQ[],
  os: osData as unknown as MCQ[],
  oop: oopData as unknown as MCQ[],
  cn: cnData as unknown as MCQ[],
};

const mcqBank: MCQBank = mcqBankData as unknown as MCQBank;

export const testService = {
  getMCQs(category: string, role: string, count: number = 10): MCQ[] {
    let questions: MCQ[] = [];
    
    const normalizedCategory = category.toLowerCase();
    
    if (mcqData[normalizedCategory]) {
      questions = [...mcqData[normalizedCategory]];
    } else {
      const categoryBank = mcqBank[category];
      if (categoryBank) {
        questions = categoryBank[role] || [];
      }
    }

    if (questions.length >= count) {
      return this.shuffleArray([...questions]).slice(0, count);
    }

    const allQuestions: MCQ[] = [];
    Object.values(mcqData).forEach(qs => allQuestions.push(...qs));
    Object.values(mcqBank).forEach(cat => {
      Object.values(cat).forEach(qs => allQuestions.push(...qs));
    });

    const uniqueQuestions = allQuestions.filter(
      q => !questions.some(eq => eq.question === q.question)
    );

    const combined = [...questions, ...this.shuffleArray(uniqueQuestions)];
    return combined.slice(0, count);
  },

  shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  },

  gradeTest(questions: MCQ[], answers: string[]): { score: number; correct: number; total: number } {
    let correct = 0;
    questions.forEach((q, i) => {
      if (answers[i]?.trim() === q.correctAnswer.trim()) {
        correct++;
      }
    });
    return {
      score: Math.round((correct / questions.length) * 100),
      correct,
      total: questions.length
    };
  },

  getCategories(): string[] {
    return ['DSA', 'DBMS', 'OS', 'OOP', 'CN', 'Tech', 'Aptitude', 'Reasoning'];
  },

  getRoles(): string[] {
    return ['Software Engineer', 'Data Scientist', 'Full Stack Developer', 'Frontend Developer', 'Backend Developer', 'DevOps Engineer'];
  }
};

export default testService;