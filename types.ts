export interface Idiom {
  id: string;
  english: string;
  meaning: string;
  example: string;
  day: number;
  week: number;
  lesson: string;
}

export enum Tab {
  STUDY = 'study',
  MEANING = 'meaning',
  DICTATION = 'dictation',
}

export interface QuizResult {
  [idiomId: string]: {
    isCorrect: boolean;
    userAnswer: string;
    attempted: boolean;
  };
}

export interface DayProgress {
  isStudyComplete: boolean;
  meaningQuiz: QuizResult;
  dictationQuiz: QuizResult;
  isDayComplete: boolean;
}

export interface WeekInfo {
  week: number;
  title: string;
  label: string; // e.g. "1주차"
}
