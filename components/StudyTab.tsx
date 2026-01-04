import React, { useState } from 'react';
import { Idiom } from '../types';
import AudioPlayer from './AudioPlayer';
import { preloadIdiomsAudio } from '../services/geminiService';

interface StudyTabProps {
  idioms: Idiom[];
  favorites: string[];
  toggleFavorite: (id: string) => void;
  onComplete: () => void;
  isComplete: boolean;
}

const StudyTab: React.FC<StudyTabProps> = ({ idioms, favorites, toggleFavorite, onComplete, isComplete }) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateAudio = async () => {
    setIsGenerating(true);
    await preloadIdiomsAudio(idioms);
    setIsGenerating(false);
  };

  return (
    <div className="pb-24">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Desktop Header */}
        <div className="hidden md:grid grid-cols-12 gap-4 bg-slate-50 p-4 font-semibold text-slate-500 border-b border-slate-200 text-sm items-center">
          <div className="col-span-3">Idiom</div>
          <div className="col-span-1 text-center flex flex-col items-center justify-center">
            <span>Audio</span>
            <button 
                onClick={handleGenerateAudio}
                disabled={isGenerating}
                className="mt-1 text-[10px] bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-2 py-0.5 rounded transition-colors whitespace-nowrap disabled:opacity-50"
            >
                {isGenerating ? 'Loading...' : 'Load All'}
            </button>
          </div>
          <div className="col-span-3">Meaning</div>
          <div className="col-span-4">Example</div>
          <div className="col-span-1 text-center">Fav</div>
        </div>

        {/* Mobile Header / Action Bar */}
        <div className="md:hidden bg-slate-50 p-3 border-b border-slate-200 flex justify-end">
             <button 
                onClick={handleGenerateAudio}
                disabled={isGenerating}
                className="text-xs bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-3 py-1.5 rounded-full font-bold flex items-center gap-1 transition-colors disabled:opacity-50"
            >
                {isGenerating ? (
                    <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                        <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM18.584 5.106a.75.75 0 011.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 11-1.06-1.06 8.25 8.25 0 000-11.668.75.75 0 010-1.06z" />
                        <path d="M15.932 7.757a.75.75 0 011.061 0 6 6 0 010 8.486.75.75 0 01-1.06-1.061 4.5 4.5 0 000-6.364.75.75 0 010-1.06z" />
                    </svg>
                )}
                {isGenerating ? 'Generating...' : '발음 생성 (Load Audio)'}
            </button>
        </div>

        <div className="divide-y divide-slate-100">
          {idioms.map((idiom) => (
            <div key={idiom.id} className="md:grid md:grid-cols-12 md:gap-4 p-4 items-center hover:bg-slate-50 transition-colors flex flex-col md:flex-row gap-3">
              {/* Mobile Layout Wrapper */}
              <div className="w-full flex justify-between items-center md:hidden mb-1">
                <span className="font-bold text-lg text-indigo-700">{idiom.english}</span>
                 <button
                  onClick={() => toggleFavorite(idiom.id)}
                  className="p-2 text-yellow-400 hover:text-yellow-500 transition-colors"
                >
                  {favorites.includes(idiom.id) ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                      <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.563.563 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.563.563 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Desktop Columns */}
              <div className="md:col-span-3 hidden md:block font-bold text-slate-800">{idiom.english}</div>
              
              <div className="md:col-span-1 flex justify-center md:justify-center w-full md:w-auto mb-2 md:mb-0">
                <AudioPlayer text={idiom.english} />
              </div>
              
              <div className="md:col-span-3 text-slate-700 w-full md:w-auto">
                <span className="md:hidden font-semibold text-xs text-slate-400 uppercase mr-2">Meaning:</span>
                {idiom.meaning}
              </div>
              
              {/* Example Column with on-demand TTS */}
              <div className="md:col-span-4 w-full md:w-auto bg-slate-50 md:bg-transparent p-2 md:p-0 rounded flex gap-2 items-start justify-between">
                 <div className="text-slate-500 text-sm italic">
                    <span className="md:hidden not-italic font-semibold text-xs text-slate-400 uppercase mr-1 block mb-1">Example:</span>
                    "{idiom.example}"
                 </div>
                 <div className="flex-shrink-0 -mt-1 md:mt-0">
                    <AudioPlayer text={idiom.example} />
                 </div>
              </div>

               <div className="md:col-span-1 hidden md:flex justify-center">
                 <button
                  onClick={() => toggleFavorite(idiom.id)}
                  className="p-2 text-yellow-400 hover:text-yellow-500 transition-colors"
                >
                  {favorites.includes(idiom.id) ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                      <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.563.563 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.563.563 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
                    </svg>
                  )}
                </button>
               </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Sticky Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-slate-200 flex justify-center z-10">
        <button
          onClick={onComplete}
          disabled={isComplete}
          className={`w-full max-w-md font-bold py-3 px-6 rounded-lg shadow-lg transform transition-all active:scale-95 ${
            isComplete 
              ? 'bg-green-500 text-white cursor-default' 
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
          }`}
        >
          {isComplete ? 'Study Completed! Tests Unlocked' : 'Complete Study'}
        </button>
      </div>
    </div>
  );
};

export default StudyTab;
