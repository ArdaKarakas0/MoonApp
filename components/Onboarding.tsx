
import React, { useState } from 'react';
import { MoonPhase } from '../types';
import { CogIcon } from './icons/CogIcon';

interface OnboardingProps {
  onStart: (name: string, mood: string, moonPhase: MoonPhase) => void;
  onManageSubscription: () => void;
  error?: string | null;
}

const moods = ["Reflective", "Hopeful", "Weary", "Restless", "Joyful", "Searching"];

export const Onboarding: React.FC<OnboardingProps> = ({ onStart, onManageSubscription, error }) => {
  const [name, setName] = useState('');
  const [mood, setMood] = useState('');
  const [moonPhase, setMoonPhase] = useState<MoonPhase>(MoonPhase.FULL_MOON);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mood) {
      onStart(name, mood, moonPhase);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 text-center">
      <div className="w-full max-w-md mx-auto bg-midnight-purple/30 backdrop-blur-md rounded-2xl p-8 shadow-glow-white border border-starlight-silver/10">
        <h1 className="text-4xl sm:text-5xl font-serif font-bold text-white mb-2">Welcome to MoonPath</h1>
        <p className="text-starlight-silver/80 mb-8">Your daily guidance, whispered by the moon.</p>
        
        {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg relative mb-6" role="alert">
                <strong className="font-bold">A quiet fog... </strong>
                <span className="block sm:inline">{error}</span>
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-starlight-silver/90 mb-2">What name shall the moon whisper?</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name (optional)"
              className="w-full bg-celestial-blue/50 border border-starlight-silver/20 rounded-lg px-4 py-2 text-white placeholder-starlight-silver/50 focus:ring-2 focus:ring-moonbeam-gold focus:border-moonbeam-gold focus:outline-none transition-shadow"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-starlight-silver/90 mb-2">How does your inner tide feel today?</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {moods.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMood(m)}
                  className={`px-4 py-2 rounded-lg text-sm transition-all duration-200 border ${
                    mood === m 
                    ? 'bg-moonbeam-gold text-celestial-blue border-moonbeam-gold font-semibold shadow-glow-gold' 
                    : 'bg-celestial-blue/50 border-starlight-silver/20 hover:bg-starlight-silver/10 hover:border-starlight-silver/40'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
          
          <div>
              <label htmlFor="moon-phase" className="block text-sm font-medium text-starlight-silver/90 mb-2">Select the current moon phase:</label>
              <select
                  id="moon-phase"
                  value={moonPhase}
                  onChange={(e) => setMoonPhase(e.target.value as MoonPhase)}
                  className="w-full bg-celestial-blue/50 border border-starlight-silver/20 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-moonbeam-gold focus:border-moonbeam-gold focus:outline-none transition-shadow appearance-none"
              >
                  {Object.values(MoonPhase).map(phase => (
                      <option key={phase} value={phase} className="bg-midnight-purple">{phase}</option>
                  ))}
              </select>
          </div>

          <button
            type="submit"
            disabled={!mood}
            className="w-full bg-moonbeam-gold text-celestial-blue font-bold py-3 px-4 rounded-lg hover:bg-amber-300 transition-colors duration-300 shadow-lg shadow-moonbeam-gold/20 disabled:bg-starlight-silver/20 disabled:text-starlight-silver/50 disabled:cursor-not-allowed disabled:shadow-none"
          >
            Receive My Reading
          </button>
        </form>
         <div className="mt-6 text-center">
            <button onClick={onManageSubscription} className="inline-flex items-center text-xs text-starlight-silver/60 hover:text-moonbeam-gold transition-colors">
                <CogIcon className="w-4 h-4 mr-2" />
                Manage Subscription
            </button>
        </div>
      </div>
    </div>
  );
};