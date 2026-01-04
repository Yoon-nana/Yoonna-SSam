/**
 * Parses a single CSV line, handling quotes correctly.
 * e.g., 'Grade,"학년, 성적",Example' -> ['Grade', '학년, 성적', 'Example']
 */
export const parseCSVLine = (line: string): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuote = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuote = !inQuote;
    } else if (char === ',' && !inQuote) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result.map(s => s.replace(/^"|"$/g, '')); // Remove surrounding quotes if any remain
};

/**
 * Extracts the number from a string like "Day 1" or "1주차"
 */
export const extractNumber = (str: string): number => {
  const match = str.match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
};

/**
 * Shuffles an array using Fisher-Yates algorithm
 */
export const shuffleArray = <T>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};
