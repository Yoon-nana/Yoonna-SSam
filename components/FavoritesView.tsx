import React from 'react';
import { Idiom } from '../types';
import AudioPlayer from './AudioPlayer';

interface FavoritesViewProps {
  favorites: string[];
  allIdioms: Idiom[];
  onRemove?: (id: string) => void;
  onClose: () => void;
  readonly?: boolean; // New prop for Admin mode
  userName?: string; // To show whose favorites these are
}

const FavoritesView: React.FC<FavoritesViewProps> = ({ favorites, allIdioms, onRemove, onClose, readonly = false, userName }) => {
  // Reverse track: Find idiom objects by IDs
  const favoriteIdioms = allIdioms.filter(idiom => favorites.includes(idiom.id));

  return (
    <div className="pb-24">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-yellow-50 p-4 border-b border-yellow-100 flex justify-between items-center">
          <h2 className="font-bold text-yellow-800 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-yellow-500">
              <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
            </svg>
            {userName ? `${userName}'s Favorites` : 'My Favorites'} ({favoriteIdioms.length})
          </h2>
          <button onClick={onClose} className="text-sm font-bold text-slate-500 hover:text-slate-800">
            Close
          </button>
        </div>

        {favoriteIdioms.length === 0 ? (
          <div className="p-10 text-center text-slate-400">
            {readonly ? "This user hasn't added any favorites yet." : "No favorites yet. Star words during study or quizzes to see them here!"}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {favoriteIdioms.map((idiom) => (
              <div key={idiom.id} className="p-4 hover:bg-slate-50 transition-colors flex flex-col gap-2">
                <div className="flex justify-between items-start">
                   <div>
                      <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">
                             Week {idiom.week} - Day {idiom.day}
                          </span>
                      </div>
                      <span className="font-bold text-lg text-indigo-700">{idiom.english}</span>
                   </div>
                   <div className="flex gap-2">
                      <AudioPlayer text={idiom.english} />
                      {!readonly && onRemove && (
                        <button
                            onClick={() => onRemove(idiom.id)}
                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                            title="Remove from favorites"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                        </button>
                      )}
                   </div>
                </div>
                
                <div className="text-slate-700">
                  <span className="font-bold text-xs text-slate-400 uppercase mr-2">Meaning:</span>
                  {idiom.meaning}
                </div>
                <div className="flex justify-between items-start bg-slate-50 p-2 rounded gap-2">
                    <div className="text-slate-500 text-sm italic">
                        <span className="not-italic font-bold text-xs text-slate-400 uppercase mr-1">Ex:</span>
                        "{idiom.example}"
                    </div>
                     <div className="flex-shrink-0">
                        <AudioPlayer text={idiom.example} />
                     </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesView;
