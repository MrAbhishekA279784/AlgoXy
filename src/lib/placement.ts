export type PlacementCategory = 'Category 1' | 'Category 2' | 'Category 3' | 'Not Eligible';

export interface StudentData {
  cgpa: number;
  attendance_percentage: number;
  year: string;
}

export const calculatePlacementCategory = (cgpa: number | string, attendance: number | string): PlacementCategory => {
  const c = typeof cgpa === 'string' ? parseFloat(cgpa || '0') : cgpa;
  const a = typeof attendance === 'string' ? parseFloat(attendance || '0') : attendance;

  if (c >= 8.5 && a >= 75) {
    return 'Category 1';
  } else if (c >= 7.5 && a >= 60) {
    return 'Category 2';
  } else if (c >= 7.0 && a >= 60) {
    return 'Category 3';
  } else {
    return 'Not Eligible';
  }
};

export const calculateCategory = calculatePlacementCategory;

export const getCategoryBadgeStyles = (category: PlacementCategory | string) => {
  switch (category) {
    case 'Category 1':
      return 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 border-yellow-100 dark:border-yellow-900/30';
    case 'Category 2':
      return 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/30';
    case 'Category 3':
      return 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-100 dark:border-green-900/30';
    case 'approved':
      return 'bg-green-50 text-green-600 border-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800';
    case 'rejected':
      return 'bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800';
    case 'pending':
      return 'bg-yellow-50 text-yellow-600 border-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800';
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
