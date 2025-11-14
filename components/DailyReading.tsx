
import React, { useState, useEffect } from 'react';
import { HistoricReading, Plan, SpecialReading, DailyReading } from '../types';
import { CogIcon } from './icons/CogIcon';
import { HistoryIcon } from './icons/HistoryIcon';
import { MoonIcon } from './icons/MoonIcon';

interface DailyReadingProps {
  reading: HistoricReading;
  currentPlan: Plan;
  onReset: () => void;
  onManageSubscription: () => void;
  onViewHistory: () => void;
  isViewingHistory?: boolean;
  onBackToHistory?: () => void;
  onUpdateJournal: (readingId: string, text: string) => void;
}

const Card: React.FC<{title: string; children: React.ReactNode; className?: string}> = ({ title, children, className }) => (
    <div className={`bg-white/30 dark:bg-midnight-purple/30 backdrop-blur-md rounded-xl p-6 shadow-lg shadow-gray-400/20 dark:shadow-glow-white border border-cloud-gray/30 dark:border-starlight-silver/10 ${className}`}>
        <h3 className="text-sm font-semibold tracking-widest uppercase text-sunbeam-gold dark:text-moonbeam-gold mb-3">{title}</h3>
        <div className="text-deep-sapphire/90 dark:text-starlight-silver/90 space-y-4">{children}</div>
    </div>
);

const JournalCard: React.FC<{ reading: HistoricReading; onUpdateJournal: (id: string, text: string) => void }> = ({ reading, onUpdateJournal }) => {
    const [journalText, setJournalText] = useState(reading.journalEntry || '');
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

    useEffect(() => {
        setJournalText(reading.journalEntry || '');
        setSaveStatus('idle');
    }, [reading.id, reading.journalEntry]);

    const handleSaveJournal = () => {
        setSaveStatus('saving');
        onUpdateJournal(reading.id, journalText);
        setTimeout(() => {
            setSaveStatus('saved');
            setTimeout(() => setSaveStatus('idle'), 2000);
        }, 300);
    };
    
    const isUnsaved = journalText !== reading.journalEntry;

    return (
        <Card title="Your Reflections">
            <textarea
                value={journalText}
                onChange={(e) => {
                    setJournalText(e.target.value);
                    if (saveStatus !== 'idle') setSaveStatus('idle');
                }}
                placeholder="Record your thoughts, feelings, or intentions here..."
                rows={5}
                className="w-full bg-white/50 dark:bg-celestial-blue/50 border border-cloud-gray/40 dark:border-starlight-silver/20 rounded-lg px-4 py-2 text-deep-sapphire dark:text-white placeholder-deep-sapphire/50 dark:placeholder-starlight-silver/50 focus:ring-2 focus:ring-sunbeam-gold dark:focus:ring-moonbeam-gold focus:border-sunbeam-gold dark:focus:border-moonbeam-gold focus:outline-none transition-all"
            />
            <div className="text-right -mb-2">
                <button 
                    onClick={handleSaveJournal}
                    disabled={saveStatus === 'saving' || !isUnsaved}
                    className="bg-sunbeam-gold/80 dark:bg-moonbeam-gold/80 text-white dark:text-celestial-blue font-bold py-2 px-4 rounded-lg hover:bg-amber-500 dark:hover:bg-amber-300 transition-colors duration-300 shadow-sunbeam-gold/20 dark:shadow-moonbeam-gold/20 text-sm disabled:bg-cloud-gray/50 dark:disabled:bg-starlight-silver/20 disabled:text-gray-500 dark:disabled:text-starlight-silver/50 disabled:cursor-not-allowed"
                >
                    {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved!' : 'Save Journal'}
                </button>
            </div>
        </Card>
    );
};


const DailyReadingContent: React.FC<{ content: DailyReading }> = ({ content }) => (
  <>
    <Card title="Lunar Message">
      {content.lunarMessage.map((p, i) => <p key={i}>{p}</p>)}
    </Card>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card title="Lunar Warning">
        <p>{content.lunarWarning}</p>
      </Card>
      <Card title="Opportunity Window">
        <p className="text-2xl font-bold text-deep-sapphire dark:text-white text-center">{content.opportunityWindow}</p>
      </Card>
    </div>
    <Card title="Symbol of the Day" className="text-center">
      <p className="text-xl font-serif font-semibold text-deep-sapphire dark:text-white">{content.lunarSymbol.name}</p>
      <p className="italic text-deep-sapphire/80 dark:text-starlight-silver/80">{content.lunarSymbol.meaning}</p>
    </Card>
  </>
);

const SpecialReadingContent: React.FC<{ content: SpecialReading }> = ({ content }) => (
    <>
        <div className="text-center bg-white/40 dark:bg-celestial-blue/40 py-4 px-6 rounded-lg border border-cloud-gray/30 dark:border-starlight-silver/10">
            <p className="text-sm text-deep-sapphire/70 dark:text-starlight-silver/70">A Special Reading Theme</p>
            <h2 className="text-2xl font-serif font-semibold text-sunbeam-gold dark:text-moonbeam-gold tracking-wide">{content.specialTheme}</h2>
        </div>
        <Card title="Deep Dive Message">
            {content.deepDiveMessage.map((p, i) => <p key={i}>{p}</p>)}
        </Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card title={content.ritualSuggestion.title}>
                <p>{content.ritualSuggestion.description}</p>
            </Card>
            <Card title={content.oracleInsight.title}>
                <p className="text-lg font-semibold italic text-deep-sapphire dark:text-white text-center">"{content.oracleInsight.description}"</p>
            </Card>
        </div>
    </>
);


export const DailyReadingDisplay: React.FC<DailyReadingProps> = ({ reading, currentPlan, onReset, onManageSubscription, onViewHistory, isViewingHistory = false, onBackToHistory, onUpdateJournal }) => {
  const isPremiumFeatureEnabled = currentPlan === Plan.PLUS || currentPlan === Plan.PREMIUM;
  const { reading: readingContent } = reading;
    
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-2xl mx-auto animate-fade-in space-y-6">
        <header className="text-center">
          {(isViewingHistory || reading.date) && (
            <p className="text-sunbeam-gold/80 dark:text-moonbeam-gold/80 mb-2 font-serif">{new Date(reading.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          )}
          <h1 className="text-4xl sm:text-5xl font-serif font-bold text-deep-sapphire dark:text-white">{readingContent.moonPhaseHeading.title}</h1>
          <p className="mt-2 text-deep-sapphire/80 dark:text-starlight-silver/80">{readingContent.moonPhaseHeading.description}</p>
        </header>

        <div className="text-center bg-white/40 dark:bg-celestial-blue/40 py-4 px-6 rounded-lg border border-cloud-gray/30 dark:border-starlight-silver/10">
            <p className="text-sm text-deep-sapphire/70 dark:text-starlight-silver/70">Your Lunar Alignment</p>
            <h2 className="text-2xl font-serif font-semibold text-sunbeam-gold dark:text-moonbeam-gold tracking-wide">{readingContent.lunarAlignment}</h2>
        </div>
        
        {readingContent.readingType === 'special' 
            ? <SpecialReadingContent content={readingContent} /> 
            : <DailyReadingContent content={readingContent} />
        }
        
        <JournalCard reading={reading} onUpdateJournal={onUpdateJournal} />

        <footer className="text-center italic text-sunbeam-gold/80 dark:text-moonbeam-gold/80 pt-4">
            <p>"{readingContent.closingLine}"</p>
        </footer>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
                onClick={isViewingHistory ? onBackToHistory : onReset}
                className="bg-sunbeam-gold dark:bg-moonbeam-gold text-white dark:text-celestial-blue font-bold py-2 px-6 rounded-lg hover:bg-amber-600 dark:hover:bg-amber-300 transition-colors duration-300 shadow-lg shadow-sunbeam-gold/30 dark:shadow-moonbeam-gold/20 w-full sm:w-auto"
            >
                {isViewingHistory ? 'Back to History' : 'Seek a New Reading'}
            </button>
            <button
                onClick={onViewHistory}
                disabled={!isPremiumFeatureEnabled}
                className="inline-flex items-center justify-center bg-black/5 dark:bg-starlight-silver/10 text-deep-sapphire dark:text-starlight-silver border border-cloud-gray/40 dark:border-starlight-silver/20 font-semibold py-2 px-6 rounded-lg hover:bg-black/10 dark:hover:bg-starlight-silver/20 transition-colors duration-300 w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <HistoryIcon className="w-5 h-5 mr-2" />
                View History
            </button>
        </div>
         <div className="mt-6 text-center">
            <button onClick={onManageSubscription} className="inline-flex items-center text-xs text-deep-sapphire/60 dark:text-starlight-silver/60 hover:text-sunbeam-gold dark:hover:text-moonbeam-gold transition-colors">
                <CogIcon className="w-4 h-4 mr-2" />
                Manage Subscription
            </button>
        </div>
      </div>
    </div>
  );
};