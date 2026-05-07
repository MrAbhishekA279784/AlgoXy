export type PlacementCategory = 'Category 1' | 'Category 2' | 'Category 3' | 'Not Eligible';

export interface StudentData {
  cgpa: number;
  attendance_percentage: number;
  year: string;
}

export const calculatePlacementCategory = (user: StudentData): PlacementCategory => {
  const { cgpa, attendance_percentage: attendance } = user;

  if (cgpa >= 8.5 && attendance >= 75) {
    return 'Category 1';
  } else if (cgpa >= 7.5 && attendance >= 60) {
    return 'Category 2';
  } else if (cgpa >= 7.0 && attendance >= 60) {
    return 'Category 3';
  } else {
    return 'Not Eligible';
  }
};

export const getCategoryBadgeStyles = (category: PlacementCategory) => {
  switch (category) {
    case 'Category 1':
      return 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 border-yellow-100 dark:border-yellow-900/30';
    case 'Category 2':
      return 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/30';
    case 'Category 3':
      return 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-100 dark:border-green-900/30';
    default:
      return 'bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 border-gray-100 dark:border-gray-800';
  }
};

export const getJuniorMotivationHint = (user: StudentData) => {
  const { cgpa, year } = user;
  const isJunior = year.includes('1st') || year.includes('2nd');
  
  if (!isJunior) return null;

  if (cgpa < 8.5) {
    const diff = (8.5 - cgpa).toFixed(1);
    return `You are ${diff} CGPA away from Category 1`;
  } else if (cgpa < 7.5) {
    const diff = (7.5 - cgpa).toFixed(1);
    return `You are ${diff} CGPA away from Category 2`;
  } else if (cgpa < 7.0) {
    const diff = (7.0 - cgpa).toFixed(1);
    return `You are ${diff} CGPA away from Category 3`;
  }

  return null;
};
