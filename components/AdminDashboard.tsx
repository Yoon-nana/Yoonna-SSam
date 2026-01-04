import React, { useState, useEffect } from 'react';
import { IDIOM_DATA, WEEK_DATA } from '../constants'; // Import WEEK_DATA to access titles
import FavoritesView from './FavoritesView';

interface UserData {
  id: string;
  score: number;
  favorites: string[];
  maxUnlocked: { week: number, day: number };
}

interface AdminDashboardProps {
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);

  // Load users from localStorage on mount
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    const loadedUsers: UserData[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('vocastar_') && key !== 'vocastar_admin7') {
        try {
          const rawData = localStorage.getItem(key);
          if (rawData) {
            const data = JSON.parse(rawData);
            loadedUsers.push({
              id: key.replace('vocastar_', ''),
              score: data.score || 0,
              favorites: data.favorites || [],
              maxUnlocked: data.maxUnlocked || { week: 1, day: 1 }
            });
          }
        } catch (e) {
          console.error(`Failed to parse user data for ${key}`, e);
        }
      }
    }
    // Sort by Score descending
    setUsers(loadedUsers.sort((a, b) => b.score - a.score));
  };

  const updateScore = (userId: string, delta: number) => {
    const key = `vocastar_${userId}`;
    const rawData = localStorage.getItem(key);
    if (rawData) {
      const data = JSON.parse(rawData);
      const newScore = Math.max(0, (data.score || 0) + delta);
      
      // Update LocalStorage
      data.score = newScore;
      localStorage.setItem(key, JSON.stringify(data));

      // Update State
      const updatedUsers = users.map(u => u.id === userId ? { ...u, score: newScore } : u);
      setUsers(updatedUsers);
      if (selectedUser && selectedUser.id === userId) {
          setSelectedUser({ ...selectedUser, score: newScore });
      }
    }
  };

  const updateLevel = (userId: string, week: number, day: number) => {
      const key = `vocastar_${userId}`;
      const rawData = localStorage.getItem(key);
      if (rawData) {
        const data = JSON.parse(rawData);
        const newMax = { week, day };
        
        // Update LocalStorage
        data.maxUnlocked = newMax;
        // Also update current if current > max (optional safety)
        if (data.currentWeek > week) {
            data.currentWeek = week;
            data.currentDay = 1;
        }
        localStorage.setItem(key, JSON.stringify(data));
  
        // Update State
        const updatedUsers = users.map(u => u.id === userId ? { ...u, maxUnlocked: newMax } : u);
        setUsers(updatedUsers);
        if (selectedUser && selectedUser.id === userId) {
            setSelectedUser({ ...selectedUser, maxUnlocked: newMax });
        }
      }
  };

  return (
    <div className="min-h-screen bg-slate-100 pb-10">
      {/* Admin Header */}
      <header className="bg-slate-800 text-white shadow-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-white text-slate-800 p-1.5 rounded-lg font-bold">A</div>
            <h1 className="text-xl font-bold">Teacher Dashboard</h1>
          </div>
          <button 
            onClick={onLogout}
            className="text-sm bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        
        {/* User Detail View */}
        {selectedUser ? (
            <div className="animate-fade-in">
                 <button 
                    onClick={() => setSelectedUser(null)}
                    className="mb-4 flex items-center text-slate-600 hover:text-slate-900 font-bold"
                 >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                    </svg>
                    Back to Student List
                 </button>
                 
                 {/* Student Management Panel */}
                 <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
                    <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <span>🎓</span> {selectedUser.id}
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Score Control */}
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                            <h3 className="text-sm font-bold text-slate-500 uppercase mb-2">Total Score</h3>
                            <div className="flex items-center gap-4">
                                <button 
                                    onClick={() => updateScore(selectedUser.id, -10)}
                                    className="w-10 h-10 rounded-full bg-red-100 text-red-600 hover:bg-red-200 flex items-center justify-center font-bold text-xl"
                                >
                                    -
                                </button>
                                <span className="text-3xl font-bold text-indigo-900 min-w-[3ch] text-center">{selectedUser.score}</span>
                                <button 
                                    onClick={() => updateScore(selectedUser.id, 10)}
                                    className="w-10 h-10 rounded-full bg-green-100 text-green-600 hover:bg-green-200 flex items-center justify-center font-bold text-xl"
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        {/* Level Control */}
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                            <h3 className="text-sm font-bold text-slate-500 uppercase mb-2">Unlocked Progress</h3>
                            <div className="flex flex-col gap-2">
                                <div className="text-lg font-bold text-indigo-700">
                                    {/* Display Current Level Title for Context */}
                                    {(() => {
                                        const weekInfo = WEEK_DATA.find(w => w.week === selectedUser.maxUnlocked.week);
                                        return weekInfo ? weekInfo.title : `Week ${selectedUser.maxUnlocked.week}`;
                                    })()}
                                    <span className="ml-2 text-slate-500 text-sm font-normal">
                                        (Day {selectedUser.maxUnlocked.day})
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                    <select 
                                        value={selectedUser.maxUnlocked.week}
                                        onChange={(e) => updateLevel(selectedUser.id, Number(e.target.value), 1)}
                                        className="p-2 border rounded"
                                    >
                                        {Array.from({length: 30}, (_, i) => i + 1).map(w => (
                                            <option key={w} value={w}>Week {w}</option>
                                        ))}
                                    </select>
                                    <select 
                                        value={selectedUser.maxUnlocked.day}
                                        onChange={(e) => updateLevel(selectedUser.id, selectedUser.maxUnlocked.week, Number(e.target.value))}
                                        className="p-2 border rounded"
                                    >
                                        {[1,2,3,4,5,6].map(d => (
                                            <option key={d} value={d}>Day {d}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                 </div>

                 {/* Favorites Component */}
                 <FavoritesView 
                    favorites={selectedUser.favorites}
                    allIdioms={IDIOM_DATA}
                    onClose={() => {}} // No close button needed here as we are in a page view
                    readonly={true}
                    userName={selectedUser.id}
                 />
            </div>
        ) : (
            <>
                <div className="mb-6 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-slate-800">Student Progress</h2>
                    <button 
                        onClick={loadUsers} 
                        className="text-indigo-600 hover:text-indigo-800 text-sm font-semibold flex items-center gap-1"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 4.992l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                        </svg>
                        Refresh Data
                    </button>
                </div>

                <div className="bg-white rounded-xl shadow border border-slate-200 overflow-hidden">
                    <div className="grid grid-cols-12 gap-4 bg-slate-50 p-4 font-bold text-slate-500 text-sm border-b border-slate-200">
                        <div className="col-span-2">ID</div>
                        <div className="col-span-2 text-center">Score</div>
                        <div className="col-span-6 text-left pl-4">Max Progress (Original Title)</div>
                        <div className="col-span-2 text-center">Manage</div>
                    </div>
                    
                    {users.length === 0 ? (
                        <div className="p-8 text-center text-slate-400">
                            No student data found on this device.
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {users.map(user => {
                                const weekInfo = WEEK_DATA.find(w => w.week === user.maxUnlocked.week);
                                const fullTitle = weekInfo ? weekInfo.title : `Week ${user.maxUnlocked.week}`;
                                
                                return (
                                    <div key={user.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-slate-50">
                                        <div className="col-span-2 font-bold text-indigo-900 truncate">
                                            {user.id}
                                        </div>
                                        <div className="col-span-2 font-mono font-bold text-center">
                                            {user.score}
                                        </div>
                                        <div className="col-span-6 text-left pl-4">
                                            <div className="text-sm font-semibold text-slate-800">
                                                {fullTitle}
                                            </div>
                                            <div className="text-xs text-slate-500 font-bold">
                                                Day {user.maxUnlocked.day}
                                            </div>
                                        </div>
                                        <div className="col-span-2 text-center">
                                            <button
                                                onClick={() => setSelectedUser(user)}
                                                className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded hover:bg-indigo-100 font-bold border border-indigo-200"
                                            >
                                                Edit
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
