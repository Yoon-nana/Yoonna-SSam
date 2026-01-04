import React, { useState, useMemo } from 'react';
import { Idiom } from '../types';
import { shuffleArray } from '../utils';
import ReverseQuiz from './ReverseQuiz';

interface ReviewTabProps {
  currentWeek: number;
  currentDay: number;
  allIdioms: Idiom[];
  onComplete: (customScore?: number) => void;
  addToFavorites: (id: string) => void;
}

const ReviewTab: React.FC<ReviewTabProps> = ({ currentWeek, currentDay, allIdioms, onComplete, addToFavorites }) => {
  const [quizIdioms, setQuizIdioms] = useState<Idiom[]>([]);
  const [isSessionStarted, setIsSessionStarted] = useState(false);

  // Define logic for Review Weeks
  const config = useMemo(() => {
    let targetWeeks: number[] = [];
    let title = "";
    let questionCount = 15;
    let timeLimit: number | undefined = undefined;
    let isFinalExam = false;

    // --- Week 27: The Special Final Week ---
    if (currentWeek === 27) {
        if (currentDay === 1) {
            targetWeeks = [25];
            title = "Week 25 Review";
        } else if (currentDay === 2) {
            targetWeeks = [26];
            title = "Week 26 Review";
        } else if (currentDay >= 3 && currentDay <= 5) {
            // Random from ALL previous data (1-26)
            targetWeeks = Array.from({length: 26}, (_, i) => i + 1);
            title = "Comprehensive Review (Random)";
        } else if (currentDay === 6) {
            // FINAL EXAM
            targetWeeks = Array.from({length: 26}, (_, i) => i + 1);
            title = "FINAL EXAM: 100 Questions";
            questionCount = 100;
            timeLimit = 40 * 60; // 40 Minutes (Generous time)
            isFinalExam = true;
        }
    } 
    // --- Regular Review Weeks (6, 12, 18, 24) ---
    else {
        // Calculate the start week of the block (e.g. for week 6, start is 1)
        const blockIndex = Math.floor(currentWeek / 6); 
        const startSourceWeek = (blockIndex - 1) * 6 + 1; 

        if (currentDay === 6) {
            // Day 6: Comprehensive Review of previous 5 weeks
            targetWeeks = [
                startSourceWeek,
                startSourceWeek + 1,
                startSourceWeek + 2,
                startSourceWeek + 3,
                startSourceWeek + 4
            ];
            title = `Weeks ${startSourceWeek}-${startSourceWeek+4} Review`;
        } else {
            // Day 1-5: Specific Week Review
            const specificWeek = startSourceWeek + (currentDay - 1);
            targetWeeks = [specificWeek];
            title = `Week ${specificWeek} Review`;
        }
    }

    return { targetWeeks, title, questionCount, timeLimit, isFinalExam };
  }, [currentWeek, currentDay]);

  const startQuiz = () => {
    // 1. Filter idioms belonging to the target weeks
    const candidates = allIdioms.filter(idiom => config.targetWeeks.includes(idiom.week));
    
    if (candidates.length === 0) {
        alert("No data found for this review period yet.");
        return;
    }

    // 2. Shuffle and pick
    const selected = shuffleArray(candidates).slice(0, config.questionCount);
    
    setQuizIdioms(selected);
    setIsSessionStarted(true);
  };

  const handleQuizCompletion = (correctCount: number, total: number) => {
      // If it's the Final Exam (Week 27 Day 6), score is correctCount * 10
      // Otherwise (Normal Review), score is just fixed completion bonus handled by App
      
      if (config.isFinalExam) {
          const scoreBonus = correctCount * 10;
          onComplete(scoreBonus);
      } else {
          // Standard Review: Check if they passed a threshold? 
          // For strictly reinforcing learning, we might encourage getting all right,
          // but technically finishing the Reverse Quiz is enough effort.
          
          if (correctCount === total) {
             onComplete(); // Default bonus
          } else {
             // Let user proceed even if not perfect, as they saw the corrections.
             // Or enforce 100%? Let's be lenient for flow, simply complete.
             onComplete();
          }
      }
  };

  // Render Start Screen
  if (!isSessionStarted) {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4 bg-white rounded-xl shadow-sm border border-slate-200 text-center">
            <div className="bg-indigo-100 p-4 rounded-full mb-6 text-indigo-600">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-10 h-10">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 4.992l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Review Challenge</h2>
            <p className="text-slate-600 mb-2 font-medium">{config.title}</p>
            
            <div className="bg-slate-50 p-4 rounded-lg text-sm text-slate-500 mb-8 max-w-xs mx-auto space-y-2">
                <p>📝 <strong>Type:</strong> Reverse Quiz (Meaning → English)</p>
                <p>❓ <strong>Questions:</strong> {config.questionCount}</p>
                {config.timeLimit && <p>⏱ <strong>Time Limit:</strong> {config.timeLimit / 60} Minutes</p>}
            </div>

            <button 
                onClick={startQuiz}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-all transform active:scale-95"
            >
                Start Quiz
            </button>
        </div>
    );
  }

  return (
    <div className="animate-fade-in">
        <div className="mb-4 flex justify-between items-center px-2">
            <h3 className="font-bold text-slate-700">{config.title}</h3>
            <button 
                onClick={() => setIsSessionStarted(false)}
                className="text-xs text-slate-500 underline"
            >
                Quit
            </button>
        </div>
        
        <ReverseQuiz 
            idioms={quizIdioms}
            onComplete={handleQuizCompletion}
            addToFavorites={addToFavorites}
            timeLimitSeconds={config.timeLimit}
        />
    </div>
  );
};

export default ReviewTab;
