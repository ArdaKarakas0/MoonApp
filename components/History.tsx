
import React from 'react';
import { HistoricReading, Plan } from '../types';
import { MoonIcon } from './icons/MoonIcon';

interface HistoryProps {
  history: HistoricReading[];
  currentPlan: Plan;
  onSelectReading: (reading: HistoricReading) => void;
  onClose: () => void;
  onUpgrade: () => void;
}

const EmptyState: React.FC<{ onUpgrade: () => void; isFree: boolean }> = ({ onUpgrade, isFree }) => (
    <div className="text-center p-8 bg-white/30 dark:bg-midnight-purple/30 backdrop-blur-md rounded-2xl max-w-lg mx-auto">
        <MoonIcon className="w-12 h-12 text-sunbeam-gold dark:text-moonbeam-gold mx-auto mb-4" />
        <h3 className="text-2xl font-serif text-deep-sapphire dark:text-white mb-2">
            {isFree ? "Unlock Your Lunar Past" : "Your History Awaits"}
        </h3>
        <p className="text-deep-sapphire/80 dark:text-starlight-silver/80 mb-6">
            {isFree 
                ? "Subscribers can access their full reading history. Upgrade to MoonPath Plus or Premium to see how your path has unfolded over time."
                : "Your past readings will appear here once you've received them. It seems your journey is just beginning."
            }
        </p>
        {isFree && (
            <button
                onClick={onUpgrade}
                className="bg-sunbeam-gold dark:bg-moonbeam-gold text-white dark:text-celestial-blue font-bold py-2 px-6 rounded-lg hover:bg-amber-600 dark:hover:bg-amber-300 transition-colors duration-300 shadow-lg shadow-sunbeam-gold/30 dark:shadow-moonbeam-gold/20"
            >
                View Plans
            </button>
        )}
    </div>
);

export const History: React.FC<HistoryProps> = ({ history, currentPlan, onSelectReading, onClose, onUpgrade }) => {

  const getVisibleHistory = () => {
    switch(currentPlan) {
        case Plan.FREE:
            return [];
        case Plan.PLUS:
            return history.slice(0, 30);
        case Plan.PREMIUM:
            return history;
        default:
            return [];
    }
  };

  const visibleHistory = getVisibleHistory();
  const isFreePlan = currentPlan === Plan.FREE;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 animate-fade-in">
        <div className="w-full max-w-2xl mx-auto">
            <header className="text-center mb-8">
                <h1 className="text-4xl sm:text-5xl font-serif font-bold text-deep-sapphire dark:text-white">Reading History</h1>
                <p className="mt-2 text-deep-sapphire/80 dark:text-starlight-silver/80">
                    {
                        isFreePlan ? "Upgrade to view your past readings." :
                        currentPlan === Plan.PLUS ? "Showing your last 30 readings." :
                        "Your complete lunar journey."
                    }
                </p>
            </header>

            {visibleHistory.length === 0 ? (
                <EmptyState onUpgrade={onUpgrade} isFree={isFreePlan} />
            ) : (
                <div className="space-y-4 bg-white/20 dark:bg-midnight-purple/20 p-4 rounded-xl max-h-[60vh] overflow-y-auto">
                    {visibleHistory.map((reading) => (
                        <button
                            key={reading.id}
                            onClick={() => onSelectReading(reading)}
                            className="w-full text-left p-4 bg-white/40 dark:bg-celestial-blue/40 rounded-lg border border-cloud-gray/20 dark:border-starlight-silver/10 hover:bg-black/5 dark:hover:bg-starlight-silver/10 hover:border-cloud-gray/40 dark:hover:border-starlight-silver/30 transition-all duration-200 flex justify-between items-center"
                        >
                            <div>
                                <p className="font-serif text-lg text-deep-sapphire dark:text-white">{reading.reading.moonPhaseHeading.title}</p>
                                <p className="text-sm text-deep-sapphire/70 dark:text-starlight-silver/70">{new Date(reading.date).toLocaleDateString()}</p>
                            </div>
                            <p className="text-sm font-semibold text-sunbeam-gold dark:text-moonbeam-gold">{reading.reading.lunarAlignment}</p>
                        </button>
                    ))}
                </div>
            )}

            <footer className="text-center mt-8">
                <button
                    onClick={onClose}
                    className="bg-black/5 dark:bg-starlight-silver/10 text-deep-sapphire dark:text-starlight-silver border border-cloud-gray/40 dark:border-starlight-silver/20 font-semibold py-2 px-6 rounded-lg hover:bg-black/10 dark:hover:bg-starlight-silver/20 transition-colors duration-300"
                >
                    Return to Reading
                </button>
            </footer>
        </div>
    </div>
  );
};
