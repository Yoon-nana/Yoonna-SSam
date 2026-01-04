import React from 'react';

interface QuizFeedbackProps {
  show: boolean;
  score: number;
  total: number;
  onClose: () => void;
}

const QuizFeedback: React.FC<QuizFeedbackProps> = ({ show, score, total, onClose }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full transform transition-all scale-100 animate-bounce-in text-center">
        <div className="text-4xl mb-4">
          {score === total ? '🎉' : score >= total / 2 ? '👍' : '💪'}
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">
          {score} out of {total} correct!
        </h3>
        <p className="text-slate-600 mb-6">
          {score === total 
            ? "Perfect score! You're ready for the next step." 
            : "Review the red highlighted items and try again!"}
        </p>
        <button
          onClick={onClose}
          className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-colors"
        >
          {score === total ? 'Continue' : 'Try Again'}
        </button>
      </div>
    </div>
  );
};

export default QuizFeedback;
