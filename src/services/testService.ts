import { loadDataFile } from './dataCleaner';

const getTestData = () => ({
  mcqBank: loadDataFile('mcq/mcqBank.json') || {},
  dsa: loadDataFile('mcq/dsa.json') || [],
  dbms: loadDataFile('mcq/dbms.json') || [],
  os: loadDataFile('mcq/os.json') || [],
  oop: loadDataFile('mcq/oop.json') || [],
  cn: loadDataFile('mcq/cn.json') || [],
});

export function getMCQsFromBank(category: string, role: string, count = 10): any[] {
  const data = getTestData();
  let roleQuestions: any[] = [];
  
  if (category.toLowerCase() === 'dsa') roleQuestions = data.dsa;
  else if (category.toLowerCase() === 'dbms') roleQuestions = data.dbms;
  else if (category.toLowerCase() === 'os') roleQuestions = data.os;
  else if (category.toLowerCase() === 'oop') roleQuestions = data.oop;
  else if (category.toLowerCase() === 'cn') roleQuestions = data.cn;
  else {
      const catBank = data.mcqBank[category] || {};
      roleQuestions = catBank[role] || [];
  }

  if (roleQuestions.length >= count) {
    return [...roleQuestions].sort(() => Math.random() - 0.5).slice(0, count);
  }

  const allPooled: any[] = [];
  for (const cat of Object.values(data.mcqBank)) {
    for (const qs of Object.values(cat as any)) allPooled.push(...(qs as any[]));
  }
  allPooled.push(...data.dsa, ...data.dbms, ...data.os, ...data.oop, ...data.cn);

  const combined = [...roleQuestions, ...allPooled.filter(q => !roleQuestions.find(rq => rq.question === q.question))];
  return combined.sort(() => Math.random() - 0.5).slice(0, count);
}
