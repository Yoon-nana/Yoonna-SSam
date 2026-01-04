import React, { useState, useEffect, useMemo } from 'react';
import { Tab, Idiom, QuizResult } from './types';
import { IDIOM_DATA, WEEK_DATA } from './constants';
import StudyTab from './components/StudyTab';
import MeaningTest from './components/MeaningTest';
import DictationTest from './components/DictationTest';
import ReviewTab from './components/ReviewTab'; // Import ReviewTab
import LoginScreen from './components/LoginScreen';
import FavoritesView from './components/FavoritesView';
import AdminDashboard from './components/AdminDashboard'; 
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';

const useSize = () => {
    const [size, setSize] = useState({ width: window.innerWidth, height: window.innerHeight });
    useEffect(() => {
        const handler = () => setSize({ width: window.innerWidth, height: window.innerHeight });
        window.addEventListener('resize', handler);
        return () => window.removeEventListener('resize', handler);
    }, []);
    return size;
}

const App: React.FC = () => {
  // Login State
  const [userId, setUserId] = useState<string>('');

  // Persistent States
  const [currentWeek, setCurrentWeek] = useState(1);
  const [currentDay, setCurrentDay] = useState(1);
  const [maxUnlocked, setMaxUnlocked] = useState<{week: number, day: number}>({ week: 1, day: 1 });
  const [favorites, setFavorites] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [meaningQuizState, setMeaningQuizState] = useState<QuizResult>({});
  const [dictationQuizState, setDictationQuizState] = useState<QuizResult>({});

  // Session States
  const [activeTab, setActiveTab] = useState<Tab>(Tab.STUDY);
  const [isStudyComplete, setIsStudyComplete] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showFavoritesView, setShowFavoritesView] = useState(false); 

  const { width, height } = useSize();

  // Load Data on Login
  useEffect(() => {
    if (!userId || userId === 'admin7') return; 
    const key = `vocastar_${userId}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setFavorites(data.favorites || []);
        setScore(data.score || 0);
        setMaxUnlocked(data.maxUnlocked || { week: 1, day: 1 });
        setMeaningQuizState(data.meaningQuizState || {});
        setDictationQuizState(data.dictationQuizState || {});
        setCurrentWeek(data.currentWeek || 1);
        setCurrentDay(data.currentDay || 1);
      } catch (e) {
        console.error("Failed to load save data", e);
      }
    }
  }, [userId]);

  // Save Data on Change
  useEffect(() => {
    if (!userId || userId === 'admin7') return; 
    const key = `vocastar_${userId}`;
    const data = {
      favorites,
      score,
      maxUnlocked,
      meaningQuizState,
      dictationQuizState,
      currentWeek,
      currentDay
    };
    localStorage.setItem(key, JSON.stringify(data));
  }, [userId, favorites, score, maxUnlocked, meaningQuizState, dictationQuizState, currentWeek, currentDay]);

  // Logic to identify Review Weeks (Added 27)
  const isReviewWeek = [6, 12, 18, 24, 27].includes(currentWeek);

  // Derived Data
  const currentLessonInfo = useMemo(() => WEEK_DATA.find(w => w.week === currentWeek), [currentWeek]);
  
  const currentIdioms = useMemo(() => {
    // For normal weeks, filter from IDIOM_DATA
    if (!isReviewWeek) {
        return IDIOM_DATA.filter(i => i.week === currentWeek && i.day === currentDay);
    }
    return []; // Review weeks generate data dynamically in ReviewTab
  }, [currentWeek, currentDay, isReviewWeek]);

  // Generate Navigation Options
  const navigationOptions = useMemo(() => {
    const options = [];
    for (let w = 1; w <= maxUnlocked.week; w++) {
      const maxD = (w === maxUnlocked.week) ? maxUnlocked.day : 6;
      for (let d = 1; d <= maxD; d++) {
        options.push({ week: w, day: d });
      }
    }
    return options.reverse(); 
  }, [maxUnlocked]);

  
  // Progress Logic for Standard Weeks
  useEffect(() => {
    if (isReviewWeek) return; // Review Week handled by ReviewTab callback

    if (currentIdioms.length === 0) return;

    const allMeaningCorrect = currentIdioms.every(i => meaningQuizState[i.id]?.isCorrect);
    const allDictationCorrect = currentIdioms.every(i => dictationQuizState[i.id]?.isCorrect);
    
    const isCurrentLevelMax = currentWeek === maxUnlocked.week && currentDay === maxUnlocked.day;

    if (allMeaningCorrect && allDictationCorrect && isCurrentLevelMax && !showCelebration) {
       triggerCompletion();
    }
  }, [meaningQuizState, dictationQuizState, currentIdioms, currentWeek, currentDay, maxUnlocked, showCelebration, isReviewWeek]);

  // Updated Trigger Completion to accept custom score
  const triggerCompletion = (customScore?: number) => {
       setShowCelebration(true);
       
       // Default 10 points, or custom score (e.g. from Week 27 Day 6)
       const pointsToAdd = customScore !== undefined ? customScore : 10;
       setScore(prev => prev + pointsToAdd);
       
       setTimeout(() => {
          let nextDay = currentDay + 1;
          let nextWeek = currentWeek;

          if (nextDay > 6) {
             nextDay = 1;
             nextWeek = currentWeek + 1;
          }
          
          setMaxUnlocked({ week: nextWeek, day: nextDay });
          setShowCelebration(false);
          // Don't auto-navigate, user sees confetti then chooses to move
       }, 5000);
  };


  const toggleFavorite = (id: string) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]
    );
  };

  const addToFavorites = (id: string) => {
    setFavorites(prev => {
        if(prev.includes(id)) return prev;
        return [...prev, id];
    });
  };

  const updateMeaningResult = (id: string, isCorrect: boolean, answer: string) => {
    setMeaningQuizState(prev => ({
      ...prev,
      [id]: { isCorrect, userAnswer: answer, attempted: true }
    }));
  };

  const updateDictationResult = (id: string, isCorrect: boolean, answer: string) => {
    setDictationQuizState(prev => ({
      ...prev,
      [id]: { isCorrect, userAnswer: answer, attempted: true }
    }));
  };

  const handleLevelChange = (week: number, day: number) => {
    if (week > maxUnlocked.week || (week === maxUnlocked.week && day > maxUnlocked.day)) return;
    setCurrentWeek(week);
    setCurrentDay(day);
    setIsStudyComplete(false);
    setActiveTab(Tab.STUDY);
    setShowFavoritesView(false); 
  };

  const handleLogout = () => {
    setUserId('');
    setFavorites([]);
    setScore(0);
    setMaxUnlocked({ week: 1, day: 1 });
    setMeaningQuizState({});
    setDictationQuizState({});
    setCurrentWeek(1);
    setCurrentDay(1);
    setIsStudyComplete(false);
    setActiveTab(Tab.STUDY);
    setShowFavoritesView(false);
  };

  if (!userId) {
    return <LoginScreen onLogin={setUserId} />;
  }

  if (userId === 'admin7') {
    return <AdminDashboard onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-10">
      {showCelebration && <Confetti width={width} height={height} numberOfPieces={200} recycle={false} />}
      
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex justify-between items-center mb-2">
            <div>
               <h1 className="text-xl font-bold text-indigo-700 flex items-center gap-2">
                  <div className="bg-indigo-600 text-white p-1.5 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                      <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                    </svg>
                  </div>
                  VocaStar: Middle Bridge
               </h1>
            </div>
            <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 mr-1 hidden sm:inline">{userId}</span>
                <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                  <span>🏆</span> {score} pts
                </div>
                <button 
                  onClick={handleLogout}
                  className="ml-2 text-xs text-slate-500 hover:text-red-500 underline"
                >
                  Logout
                </button>
            </div>
          </div>

          {/* Level Info & Navigation */}
          <div className="flex flex-col gap-2">
             <div className="flex items-center justify-between">
                 <div className="font-semibold text-slate-700 text-sm md:text-base">
                    <span className={`inline-block px-2 py-0.5 rounded mr-2 text-xs md:text-sm ${isReviewWeek ? 'bg-purple-100 text-purple-700' : 'bg-slate-200'}`}>
                      {currentLessonInfo ? currentLessonInfo.label : `${currentWeek}주차`}
                    </span>
                    {currentLessonInfo ? currentLessonInfo.title : `Week ${currentWeek}`}
                    <span className="ml-2 text-indigo-600 font-bold block md:inline">
                      — Day {currentDay}
                    </span>
                 </div>
                 
                 <button
                    onClick={() => setShowFavoritesView(!showFavoritesView)}
                    className={`ml-2 px-3 py-1.5 rounded flex items-center gap-1 text-xs font-bold transition-colors whitespace-nowrap flex-shrink-0 ${
                        showFavoritesView ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 hover:bg-yellow-50 text-slate-600'
                    }`}
                 >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-yellow-500">
                        <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                    </svg>
                    Favs
                 </button>
             </div>

             <div className="relative w-full">
                 <select 
                   value={`${currentWeek}-${currentDay}`}
                   onChange={(e) => {
                     const [w, d] = e.target.value.split('-').map(Number);
                     handleLevelChange(w, d);
                   }}
                   className="w-full appearance-none bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 py-2 px-3 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-indigo-500 font-bold text-sm"
                 >
                   <option disabled>-- Select Level --</option>
                   {navigationOptions.map((opt) => {
                     const weekInfo = WEEK_DATA.find(w => w.week === opt.week);
                     const title = weekInfo ? weekInfo.title : `Week ${opt.week}`;
                     const label = weekInfo ? weekInfo.label : `${opt.week}주차`;
                     return (
                       <option key={`${opt.week}-${opt.day}`} value={`${opt.week}-${opt.day}`}>
                         {label} {title} — Day {opt.day} {opt.week === currentWeek && opt.day === currentDay ? '(Current)' : ''}
                       </option>
                     );
                   })}
                 </select>
                 <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                   <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                 </div>
             </div>
          </div>
        </div>

        {/* Navigation Tabs - Hidden during Review Weeks */}
        {!showFavoritesView && !isReviewWeek && (
            <div className="max-w-4xl mx-auto px-4 mt-2">
            <div className="flex space-x-1 bg-slate-100/50 p-1 rounded-xl">
                <button
                onClick={() => setActiveTab(Tab.STUDY)}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                    activeTab === Tab.STUDY 
                    ? 'bg-white text-indigo-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
                >
                1. Study
                </button>
                <button
                onClick={() => isStudyComplete && setActiveTab(Tab.MEANING)}
                disabled={!isStudyComplete}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${
                    activeTab === Tab.MEANING 
                    ? 'bg-white text-indigo-600 shadow-sm' 
                    : isStudyComplete ? 'text-slate-500 hover:text-slate-700' : 'text-slate-300 cursor-not-allowed'
                }`}
                >
                {!isStudyComplete && <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/></svg>}
                2. Meaning
                </button>
                <button
                onClick={() => isStudyComplete && setActiveTab(Tab.DICTATION)}
                disabled={!isStudyComplete}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${
                    activeTab === Tab.DICTATION 
                    ? 'bg-white text-indigo-600 shadow-sm' 
                    : isStudyComplete ? 'text-slate-500 hover:text-slate-700' : 'text-slate-300 cursor-not-allowed'
                }`}
                >
                {!isStudyComplete && <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/></svg>}
                3. Dictation
                </button>
            </div>
            </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto p-4 mt-2">
        {showFavoritesView ? (
            <FavoritesView 
                favorites={favorites} 
                allIdioms={IDIOM_DATA} 
                onRemove={toggleFavorite}
                onClose={() => setShowFavoritesView(false)}
            />
        ) : isReviewWeek ? (
            /* Review Mode View */
            <ReviewTab 
                currentWeek={currentWeek}
                currentDay={currentDay}
                allIdioms={IDIOM_DATA}
                onComplete={(customScore) => {
                    // Logic to handle max progress unlock
                    const isMax = currentWeek === maxUnlocked.week && currentDay === maxUnlocked.day;
                    if(isMax) triggerCompletion(customScore);
                }}
                addToFavorites={addToFavorites}
            />
        ) : (
            /* Standard Study View */
            currentIdioms.length === 0 ? (
            <div className="text-center py-20 text-slate-400">
                No data available for this Day.
            </div>
            ) : (
            <>
                {activeTab === Tab.STUDY && (
                    <StudyTab 
                        idioms={currentIdioms}
                        favorites={favorites}
                        toggleFavorite={toggleFavorite}
                        onComplete={() => setIsStudyComplete(true)}
                        isComplete={isStudyComplete}
                    />
                )}
                
                {activeTab === Tab.MEANING && (
                    <MeaningTest 
                        idioms={currentIdioms}
                        quizState={meaningQuizState}
                        onUpdateResult={updateMeaningResult}
                        addToFavorites={addToFavorites}
                    />
                )}

                {activeTab === Tab.DICTATION && (
                    <DictationTest
                        idioms={currentIdioms}
                        quizState={dictationQuizState}
                        onUpdateResult={updateDictationResult}
                        addToFavorites={addToFavorites}
                    />
                )}
            </>
            )
        )}
      </main>
    </div>
  );
};

export default App;
