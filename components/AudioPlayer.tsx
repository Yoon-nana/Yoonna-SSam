import React, { useState } from 'react';
import { generateTTS, getAudioContext } from '../services/geminiService';

interface AudioPlayerProps {
  text: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ text }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const playAudio = async () => {
    if (isPlaying || isLoading) return;

    try {
      const ctx = getAudioContext();
      
      // Resume context if suspended (browser policy)
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      // Check if it's already cached via preload (handled inside generateTTS)
      // If cached, this returns instantly. If not, it fetches.
      setIsLoading(true);
      const buffer = await generateTTS(text);
      setIsLoading(false);

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      
      source.onended = () => {
        setIsPlaying(false);
      };

      setIsPlaying(true);
      source.start(0);

    } catch (error: any) {
      console.error("Failed to play audio", error);
      setIsPlaying(false);
      setIsLoading(false);
      
      // Notify user if it's a rate limit issue
      if (error.message?.includes("Too many requests") || error.message?.includes("429")) {
          alert("AI usage limit reached. Please wait a few seconds before playing again.");
      }
    }
  };

  return (
    <button
      onClick={playAudio}
      disabled={isPlaying}
      className={`p-2 rounded-full transition-colors flex items-center justify-center ${
        isPlaying ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
      }`}
      aria-label="Play pronunciation"
    >
      {isLoading ? (
        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : isPlaying ? (
         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
           <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
         </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
        </svg>
      )}
    </button>
  );
};

export default AudioPlayer;
