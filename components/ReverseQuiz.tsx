import React, { useState, useEffect } from 'react';
import { Idiom, QuizResult } from '../types';
import QuizFeedback from './QuizFeedback';

interface ReverseQuizProps {
  idioms: Idiom[];
  onComplete: (score: number, total: number) => void;
  addToFavorites: (id: string) => void;
  timeLimitSeconds?: number; // Optional time limit for Final Exam
}

const ReverseQuiz: React.FC<ReverseQuizProps> = ({ idioms, onComplete, addToFavorites, timeLimitSeconds }) => {
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [quizState, setQuizState] = useState<QuizResult>({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(timeLimitSeconds || null);
  const [isFinished, setIsFinished] = useState(false);

  // Timer Logic
  useEffect(() => {
    if (timeLimitSeconds && !isFinished) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev !== null && prev <= 1) {
            clearInterval(timer);
            handleSubmit(true); // Auto submit on timeout
            return 0;
          }
          return prev !== null ? prev - 1 : null;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeLimitSeconds, isFinished]);

  const handleInputChange = (id: string, value: string) => {
    setInputs(prev => ({ ...prev, [id]: value }));
  };

  const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();

  const handleSubmit = (isAutoSubmit = false) => {
    if (isFinished) return;
    setIsFinished(true);

    let correctCount = 0;
    const newResult: QuizResult = {};

    idioms.forEach((idiom) => {
      const userAnswer = inputs[idiom.id] || '';
      // Strict matching for spelling
      const isCorrect = normalize(userAnswer) === normalize(idiom.english);
      
      if (isCorrect) correctCount++;
      else addToFavorites(idiom.id);

      newResult[idiom.id] = { isCorrect, userAnswer, attempted: true };
    });

    setQuizState(newResult);
    
    // Slight delay to show UI updates before feedback modal
    setTimeout(() => {
        setShowFeedback(true);
    }, 500);
  };

  const handleFeedbackClose = () => {
    const correctCount = idioms.filter(i => quizState[i.id]?.isCorrect).length;
    onComplete(correctCount, idioms.length);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="pb-24 max-w-2xl mx-auto">
       {/* Sticky Header for Timer or Info */}
       <div className="sticky top-16 z-30 bg-white/90 backdrop-blur-md border border-indigo-100 rounded-lg p-3 mb-6 shadow-sm flex justify-between items-center">
          <div className="text-sm text-indigo-800 font-medium">
             <span className="bg-indigo-100 text-indigo-600 px-2 py-1 rounded mr-2 text-xs font-bold">Reverse Quiz</span>
             See Meaning → Write English
          </div>
          {timeLeft !== null && (
              <div className={`font-mono font-bold text-lg ${timeLeft < 60 ? 'text-red-600 animate-pulse' : 'text-slate-700'}`}>
                  ⏱ {formatTime(timeLeft)}
              </div>
          )}
          <div className="text-sm font-bold text-slate-500">
              {idioms.length} Questions
          </div>
       </div>

      <div className="space-y-4">
        {idioms.map((idiom, index) => {
             const result = quizState[idiom.id];
             const isWrong = result?.attempted && !result.isCorrect;
             const isCorrect = result?.attempted && result.isCorrect;

             return (
              <div key={idiom.id} className={`bg-white p-4 rounded-xl shadow-sm border transition-colors ${
                  isWrong ? 'border-red-300 bg-red-50' : 
                  isCorrect ? 'border-green-300 bg-green-50' : 'border-slate-200'
              }`}>
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between">
                      <span className="text-xs text-slate-400 font-bold">Q{index + 1}</span>
                      {isCorrect && <span className="text-green-600 text-xs font-bold">✓ Correct</span>}
                      {isWrong && <span className="text-red-500 text-xs font-bold">✗ {idiom.english}</span>}
                  </div>
                  
                  {/* Question: Meaning */}
                  <div className="text-lg font-bold text-slate-800 mb-1">
                    {idiom.meaning}
                  </div>

                  <input
                    type="text"
                    value={inputs[idiom.id] || ''}
                    onChange={(e) => handleInputChange(idiom.id, e.target.value)}
                    placeholder="Type English word/idiom..."
                    disabled={isFinished}
                    className={`w-full p-3 rounded-lg border focus:ring-2 focus:outline-none transition-all ${
                        isWrong 
                        ? 'border-red-300 focus:ring-red-200 bg-white' 
                        : isCorrect
                        ? 'border-green-300 bg-white text-green-800'
                        : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-100'
                    }`}
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck="false"
                  />
                </div>
              </div>
             )
        })}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-slate-200 flex justify-center z-10">
        <button
          onClick={() => handleSubmit(false)}
          disabled={isFinished}
          className="w-full max-w-md bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-indigo-700 active:scale-95 transform transition-all disabled:bg-slate-400 disabled:cursor-not-allowed"
        >
          {isFinished ? 'Quiz Finished' : 'Submit All Answers'}
        </button>
      </div>

      <QuizFeedback 
        show={showFeedback} 
        score={idioms.filter(i => quizState[i.id]?.isCorrect).length} 
        total={idioms.length}
        onClose={handleFeedbackClose} 
      />
    </div>
  );
};

export default ReverseQuiz;
