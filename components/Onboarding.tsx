import React, { useState, useCallback } from 'react';
import { MoonPhase } from '../types';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { playSound, SoundEffect } from '../utils/audioService';

interface OnboardingProps {
  onStart: (name: string, mood: string, moonPhase: MoonPhase) => void;
  onManageSubscription: () => void;
  error?: string | null;
}

const moods = ["Reflective", "Hopeful", "Weary", "Restless", "Joyful", "Searching"];

interface ReadingFormProps {
    name: string;
    setName: (name: string) => void;
    mood: string;
    setMood: (mood: string) => void;
    moonPhase: MoonPhase;
    setMoonPhase: (phase: MoonPhase) => void;
    onSubmit: (e: React.FormEvent) => void;
}

const ReadingForm: React.FC<ReadingFormProps> = React.memo(({ name, setName, mood, setMood, moonPhase, setMoonPhase, onSubmit }) => (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-deep-sapphire/90 dark:text-starlight-silver/90 mb-2">What name shall the moon whisper?</label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name (optional)"
          className="w-full bg-white/50 dark:bg-celestial-blue/50 border border-cloud-gray/40 dark:border-starlight-silver/20 rounded-lg px-4 py-2 text-deep-sapphire dark:text-white placeholder-deep-sapphire/50 dark:placeholder-starlight-silver/50 focus:ring-2 focus:ring-sunbeam-gold dark:focus:ring-moonbeam-gold focus:border-sunbeam-gold dark:focus:border-moonbeam-gold focus:outline-none transition-shadow"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-deep-sapphire/90 dark:text-starlight-silver/90 mb-2">How does your inner tide feel today?</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {moods.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                  setMood(m);
                  playSound(SoundEffect.CLICK, 0.4);
              }}
              className={`px-4 py-2 rounded-lg text-sm transition-all duration-300 border transform ${
                mood === m 
                ? 'bg-sunbeam-gold dark:bg-moonbeam-gold text-white dark:text-celestial-blue border-sunbeam-gold dark:border-moonbeam-gold font-semibold shadow-lg shadow-sunbeam-gold/30 dark:shadow-glow-gold active:scale-95' 
                : 'bg-white/40 dark:bg-celestial-blue/50 border-cloud-gray/40 dark:border-starlight-silver/20 hover:bg-black/5 dark:hover:bg-starlight-silver/10 hover:border-cloud-gray/60 dark:hover:border-starlight-silver/40 hover:scale-105 active:scale-95'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>
      
      <div>
          <label htmlFor="moon-phase" className="block text-sm font-medium text-deep-sapphire/90 dark:text-starlight-silver/90 mb-2">Select the current moon phase:</label>
          <div className="relative">
            <select
                id="moon-phase"
                value={moonPhase}
                onChange={(e) => setMoonPhase(e.target.value as MoonPhase)}
                className="w-full bg-white/50 dark:bg-celestial-blue/50 border border-cloud-gray/40 dark:border-starlight-silver/20 rounded-lg px-4 py-2 pr-10 text-deep-sapphire dark:text-white focus:ring-2 focus:ring-sunbeam-gold dark:focus:ring-moonbeam-gold focus:border-sunbeam-gold dark:focus:border-moonbeam-gold focus:outline-none transition-shadow appearance-none"
            >
                {Object.values(MoonPhase).map(phase => (
                    <option key={phase} value={phase} className="bg-sky-blue dark:bg-midnight-purple">{phase}</option>
                ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-deep-sapphire/70 dark:text-starlight-silver/70">
                <ChevronDownIcon className="w-5 h-5" />
            </div>
          </div>
      </div>

      <button
        type="submit"
        disabled={!mood}
        className="w-full bg-sunbeam-gold dark:bg-moonbeam-gold text-white dark:text-celestial-blue font-bold py-3 px-4 rounded-lg hover:bg-amber-600 dark:hover:bg-amber-300 transition-colors duration-300 shadow-lg shadow-sunbeam-gold/30 dark:shadow-moonbeam-gold/20 disabled:bg-cloud-gray/50 dark:disabled:bg-starlight-silver/20 disabled:text-gray-500 dark:disabled:text-starlight-silver/50 disabled:cursor-not-allowed disabled:shadow-none"
      >
        Receive My Reading
      </button>
    </form>
));
ReadingForm.displayName = 'ReadingForm';


export const Onboarding: React.FC<OnboardingProps> = ({ onStart, onManageSubscription, error }) => {
  const [name, setName] = useState('');
  const [mood, setMood] = useState('');
  const [moonPhase, setMoonPhase] = useState<MoonPhase>(MoonPhase.FULL_MOON);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (mood) {
      playSound(SoundEffect.CLICK, 0.7);
      onStart(name, mood, moonPhase);
    }
  }, [onStart, name, mood, moonPhase]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 text-center">
      <div className="w-full max-w-md mx-auto bg-white/50 dark:bg-midnight-purple/30 backdrop-blur-md rounded-2xl p-8 shadow-lg shadow-gray-400/30 dark:shadow-glow-white border border-cloud-gray/30 dark:border-starlight-silver/10 animate-fade-in-up">
        <h1 className="text-4xl sm:text-5xl font-serif font-bold text-deep-sapphire dark:text-white mb-2">Welcome to MoonPath</h1>
        <p className="text-deep-sapphire/80 dark:text-starlight-silver/80 mb-8">Your daily guidance, whispered by the moon.</p>
        
        {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg relative mb-6" role="alert">
                <strong className="font-bold">A quiet fog... </strong>
                <span className="block sm:inline">{error}</span>
            </div>
        )}

        <ReadingForm 
            name={name}
            setName={setName}
            mood={mood}
            setMood={setMood}
            moonPhase={moonPhase}
            setMoonPhase={setMoonPhase}
            onSubmit={handleSubmit}
        />

        <div className="mt-6 text-center">
            <button
                onClick={onManageSubscription}
                className="text-sm font-semibold text-deep-sapphire/80 dark:text-starlight-silver/80 hover:text-deep-sapphire dark:hover:text-white transition-colors duration-300"
            >
                Manage Subscription
            </button>
        </div>

      </div>
    </div>
  );
};