
import React from 'react';
import { DailyReading, Plan } from '../types';
import { CogIcon } from './icons/CogIcon';
import { HistoryIcon } from './icons/HistoryIcon';

interface DailyReadingProps {
  reading: DailyReading;
  currentPlan: Plan;
  onReset: () => void;
  onManageSubscription: () => void;
  onViewHistory: () => void;
  isViewingHistory?: boolean;
  onBackToHistory?: () => void;
}

const Card: React.FC<{title: string; children: React.ReactNode; className?: string}> = ({ title, children, className }) => (
    <div className={`bg-midnight-purple/30 backdrop-blur-md rounded-xl p-6 shadow-glow-white border border-starlight-silver/10 ${className}`}>
        <h3 className="text-sm font-semibold tracking-widest uppercase text-moonbeam-gold mb-3">{title}</h3>
        <div className="text-starlight-silver/90 space-y-4">{children}</div>
    </div>
);

export const DailyReadingDisplay: React.FC<DailyReadingProps> = ({ reading, currentPlan, onReset, onManageSubscription, onViewHistory, isViewingHistory = false, onBackToHistory }) => {
  const isPremiumFeatureEnabled = currentPlan === Plan.PLUS || currentPlan === Plan.PREMIUM;
    
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-2xl mx-auto animate-fade-in space-y-6">
        <header className="text-center">
          {isViewingHistory && reading.date && (
            <p className="text-moonbeam-gold/80 mb-2 font-serif">{new Date(reading.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          )}
          <h1 className="text-4xl sm:text-5xl font-serif font-bold text-white">{reading.moonPhaseHeading.title}</h1>
          <p className="mt-2 text-starlight-silver/80">{reading.moonPhaseHeading.description}</p>
        </header>

        <div className="text-center bg-celestial-blue/40 py-4 px-6 rounded-lg border border-starlight-silver/10">
            <p className="text-sm text-starlight-silver/70">Your Lunar Alignment</p>
            <h2 className="text-2xl font-serif font-semibold text-moonbeam-gold tracking-wide">{reading.lunarAlignment}</h2>
        </div>
        
        <Card title="Lunar Message">
            {reading.lunarMessage.map((p, i) => <p key={i}>{p}</p>)}
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card title="Lunar Warning">
                <p>{reading.lunarWarning}</p>
            </Card>
            <Card title="Opportunity Window">
                <p className="text-2xl font-bold text-white text-center">{reading.opportunityWindow}</p>
            </Card>
        </div>

        <Card title="Symbol of the Day" className="text-center">
            <p className="text-xl font-serif font-semibold text-white">{reading.lunarSymbol.name}</p>
            <p className="italic text-starlight-silver/80">{reading.lunarSymbol.meaning}</p>
        </Card>

        <footer className="text-center italic text-moonbeam-gold/80 pt-4">
            <p>"{reading.closingLine}"</p>
        </footer>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
                onClick={isViewingHistory ? onBackToHistory : onReset}
                className="bg-moonbeam-gold text-celestial-blue font-bold py-2 px-6 rounded-lg hover:bg-amber-300 transition-colors duration-300 shadow-lg shadow-moonbeam-gold/20 w-full sm:w-auto"
            >
                {isViewingHistory ? 'Back to History' : 'Seek a New Reading'}
            </button>
            <button
                onClick={onViewHistory}
                disabled={!isPremiumFeatureEnabled}
                className="inline-flex items-center justify-center bg-starlight-silver/10 text-starlight-silver border border-starlight-silver/20 font-semibold py-2 px-6 rounded-lg hover:bg-starlight-silver/20 transition-colors duration-300 w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <HistoryIcon className="w-5 h-5 mr-2" />
                View History
            </button>
        </div>
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