import React, { useState } from 'react';
import { Idiom, QuizResult } from '../types';
import { gradeMeaning } from '../services/geminiService';
import QuizFeedback from './QuizFeedback';

interface MeaningTestProps {
  idioms: Idiom[];
  quizState: QuizResult;
  onUpdateResult: (id: string, isCorrect: boolean, answer: string) => void;
  addToFavorites: (id: string) => void;
}

const MeaningTest: React.FC<MeaningTestProps> = ({ idioms, quizState, onUpdateResult, addToFavorites }) => {
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackScore, setFeedbackScore] = useState(0);

  // Filter out idioms that are already correctly answered (Retry System)
  const pendingIdioms = idioms.filter(idiom => !quizState[idiom.id]?.isCorrect);
  const isAllCorrect = pendingIdioms.length === 0 && idioms.length > 0;

  const handleInputChange = (id: string, value: string) => {
    setInputs(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async () => {
    if (isSubmitting || pendingIdioms.length === 0) return;
    setIsSubmitting(true);

    let correctCount = 0;
    
    // Process all pending items
    await Promise.all(pendingIdioms.map(async (idiom) => {
      const userAnswer = inputs[idiom.id] || '';
      
      if (!userAnswer.trim()) {
         onUpdateResult(idiom.id, false, userAnswer);
         addToFavorites(idiom.id);
         return;
      }

      const isCorrect = await gradeMeaning(idiom.meaning, userAnswer);
      
      if (isCorrect) correctCount++;
      else addToFavorites(idiom.id); // Auto favorite wrong answers

      onUpdateResult(idiom.id, isCorrect, userAnswer);
    }));

    setFeedbackScore(correctCount);
    setShowFeedback(true);
    setIsSubmitting(false);
    
    // Clear inputs for wrong answers to prompt retry
    setInputs(prev => {
        const newInputs = {...prev};
        // We keep the input if it was correct, maybe? 
        // Actually the retry system implies we only retry wrong ones.
        // The list re-renders and removes correct ones, so we don't need to clear inputs per se.
        return newInputs;
    });
  };

  if (isAllCorrect) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-4">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-12 h-12">
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Meaning Test Complete!</h2>
        <p className="text-slate-600">You've mastered all the meanings for today.</p>
      </div>
    );
  }

  return (
    <div className="pb-24 max-w-2xl mx-auto">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-sm text-blue-800 flex items-start gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 flex-shrink-0 mt-0.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
        </svg>
        <span>
          Write the Korean meaning for each English idiom. AI will grade your answer based on similarity.
          <br/><strong>Remaining: {pendingIdioms.length}</strong>
        </span>
      </div>

      <div className="space-y-4">
        {pendingIdioms.map((idiom) => {
            const result = quizState[idiom.id];
            const isWrong = result?.attempted && !result.isCorrect;

            return (
                <div key={idiom.id} className={`bg-white p-4 rounded-xl shadow-sm border transition-colors ${isWrong ? 'border-red-300 bg-red-50' : 'border-slate-200'}`}>
                    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                        <div className="w-full md:w-1/2">
                            <label className="block text-lg font-bold text-indigo-900 mb-1">{idiom.english}</label>
                            {isWrong && <span className="text-xs text-red-500 font-semibold animate-pulse">Try Again!</span>}
                        </div>
                        <div className="w-full md:w-1/2">
                            <input
                                type="text"
                                value={inputs[idiom.id] || ''}
                                onChange={(e) => handleInputChange(idiom.id, e.target.value)}
                                placeholder="뜻을 입력하세요"
                                className={`w-full p-3 rounded-lg border focus:ring-2 focus:outline-none transition-all ${
                                    isWrong 
                                    ? 'border-red-300 focus:ring-red-200 bg-white' 
                                    : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-100'
                                }`}
                                onKeyDown={(e) => {
                                    if(e.key === 'Enter') handleSubmit();
                                }}
                            />
                        </div>
                    </div>
                </div>
            );
        })}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-slate-200 flex justify-center z-10">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full max-w-md bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-indigo-700 active:scale-95 transform transition-all disabled:bg-indigo-300 disabled:scale-100 flex justify-center items-center gap-2"
        >
          {isSubmitting && (
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          {isSubmitting ? 'Grading with AI...' : 'Submit Answers'}
        </button>
      </div>

      <QuizFeedback 
        show={showFeedback} 
        score={feedbackScore} 
        total={pendingIdioms.length} // Score based on this round's attempt
        onClose={() => setShowFeedback(false)} 
      />
    </div>
  );
};

export default MeaningTest;
