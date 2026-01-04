import React, { useState } from 'react';
import { Idiom, QuizResult } from '../types';
import AudioPlayer from './AudioPlayer';
import QuizFeedback from './QuizFeedback';

interface DictationTestProps {
  idioms: Idiom[];
  quizState: QuizResult;
  onUpdateResult: (id: string, isCorrect: boolean, answer: string) => void;
  addToFavorites: (id: string) => void;
}

const DictationTest: React.FC<DictationTestProps> = ({ idioms, quizState, onUpdateResult, addToFavorites }) => {
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackScore, setFeedbackScore] = useState(0);

  // Filter pending items
  const pendingIdioms = idioms.filter(idiom => !quizState[idiom.id]?.isCorrect);
  const isAllCorrect = pendingIdioms.length === 0 && idioms.length > 0;

  const handleInputChange = (id: string, value: string) => {
    setInputs(prev => ({ ...prev, [id]: value }));
  };

  const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();

  const handleSubmit = () => {
    if (pendingIdioms.length === 0) return;

    let correctCount = 0;
    
    pendingIdioms.forEach((idiom) => {
      const userAnswer = inputs[idiom.id] || '';
      // Strict matching: normalize spaces and punctuation slightly, case insensitive
      const isCorrect = normalize(userAnswer) === normalize(idiom.english);
      
      if (isCorrect) correctCount++;
      else addToFavorites(idiom.id);

      onUpdateResult(idiom.id, isCorrect, userAnswer);
    });

    setFeedbackScore(correctCount);
    setShowFeedback(true);
  };

  if (isAllCorrect) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-4">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-12 h-12">
             <path strokeLinecap="round" strokeLinejoin="round" d="m9 12.75 3 3m0 0 3-3m-3 3v-7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Dictation Test Complete!</h2>
        <p className="text-slate-600">Great ears! You've spelled everything correctly.</p>
      </div>
    );
  }

  return (
    <div className="pb-24 max-w-2xl mx-auto">
       <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6 text-sm text-purple-800 flex items-start gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 flex-shrink-0 mt-0.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
        </svg>
        <span>
          Listen to the audio and type the exact English phrase.
          <br/><strong>Remaining: {pendingIdioms.length}</strong>
        </span>
      </div>

      <div className="space-y-4">
        {pendingIdioms.map((idiom) => {
             const result = quizState[idiom.id];
             const isWrong = result?.attempted && !result.isCorrect;

             return (
              <div key={idiom.id} className={`bg-white p-4 rounded-xl shadow-sm border transition-colors ${isWrong ? 'border-red-300 bg-red-50' : 'border-slate-200'}`}>
                <div className="flex flex-row gap-4 items-center">
                  <div className="flex-shrink-0">
                    <AudioPlayer text={idiom.english} />
                  </div>
                  <div className="flex-grow">
                     {isWrong && <span className="block text-xs text-red-500 font-semibold mb-1">Try Again!</span>}
                    <input
                      type="text"
                      value={inputs[idiom.id] || ''}
                      onChange={(e) => handleInputChange(idiom.id, e.target.value)}
                      placeholder="Type what you hear..."
                      className={`w-full p-3 rounded-lg border focus:ring-2 focus:outline-none transition-all ${
                          isWrong 
                          ? 'border-red-300 focus:ring-red-200 bg-white' 
                          : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-100'
                      }`}
                      autoComplete="off"
                      autoCorrect="off"
                      spellCheck="false"
                      onKeyDown={(e) => {
                          if(e.key === 'Enter') handleSubmit();
                      }}
                    />
                  </div>
                </div>
              </div>
             )
        })}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-slate-200 flex justify-center z-10">
        <button
          onClick={handleSubmit}
          className="w-full max-w-md bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-indigo-700 active:scale-95 transform transition-all"
        >
          Submit Answers
        </button>
      </div>

      <QuizFeedback 
        show={showFeedback} 
        score={feedbackScore} 
        total={pendingIdioms.length}
        onClose={() => setShowFeedback(false)} 
      />
    </div>
  );
};

export default DictationTest;
