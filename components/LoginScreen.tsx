import React, { useState } from 'react';

interface LoginScreenProps {
  onLogin: (userId: string) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onLogin(input.trim());
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
        <div className="mb-6">
          <span className="inline-block p-3 bg-indigo-100 rounded-full mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-indigo-600">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.499 5.258 50.55 50.55 0 00-2.658.813m-15.482 0A50.55 50.55 0 0112 13.489a50.55 50.55 0 0112-1.686" />
            </svg>
          </span>
          <h1 className="text-2xl font-bold text-slate-800">VocaStar: Middle Bridge</h1>
          <p className="text-slate-500 mt-2">Enter your ID to start learning.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter User ID (e.g. student1)"
            className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-center text-lg"
            autoFocus
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Start Learning
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginScreen;
