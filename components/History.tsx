
import React from 'react';
import { DailyReading, Plan } from '../types';
import { MoonIcon } from './icons/MoonIcon';

interface HistoryProps {
  history: DailyReading[];
  currentPlan: Plan;
  onSelectReading: (index: number) => void;
  onClose: () => void;
  onUpgrade: () => void;
}

const EmptyState: React.FC<{ onUpgrade: () => void; isFree: boolean }> = ({ onUpgrade, isFree }) => (
    <div className="text-center p-8 bg-midnight-purple/30 backdrop-blur-md rounded-2xl max-w-lg mx-auto">
        <MoonIcon className="w-12 h-12 text-moonbeam-gold mx-auto mb-4" />
        <h3 className="text-2xl font-serif text-white mb-2">
            {isFree ? "Unlock Your Lunar Past" : "Your History Awaits"}
        </h3>
        <p className="text-starlight-silver/80 mb-6">
            {isFree 
                ? "Subscribers can access their full reading history. Upgrade to MoonPath Plus or Premium to see how your path has unfolded over time."
                : "Your past readings will appear here once you've received them. It seems your journey is just beginning."
            }
        </p>
        {isFree && (
            <button
                onClick={onUpgrade}
                className="bg-moonbeam-gold text-celestial-blue font-bold py-2 px-6 rounded-lg hover:bg-amber-300 transition-colors duration-300 shadow-lg shadow-moonbeam-gold/20"
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
                <h1 className="text-4xl sm:text-5xl font-serif font-bold text-white">Reading History</h1>
                <p className="mt-2 text-starlight-silver/80">
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
                <div className="space-y-4 bg-midnight-purple/20 p-4 rounded-xl max-h-[60vh] overflow-y-auto">
                    {visibleHistory.map((reading, index) => (
                        <button
                            key={reading.date}
                            onClick={() => onSelectReading(history.findIndex(h => h.date === reading.date))}
                            className="w-full text-left p-4 bg-celestial-blue/40 rounded-lg border border-starlight-silver/10 hover:bg-starlight-silver/10 hover:border-starlight-silver/30 transition-all duration-200 flex justify-between items-center"
                        >
                            <div>
                                <p className="font-serif text-lg text-white">{reading.moonPhaseHeading.title}</p>
                                <p className="text-sm text-starlight-silver/70">{new Date(reading.date).toLocaleDateString()}</p>
                            </div>
                            <p className="text-sm font-semibold text-moonbeam-gold">{reading.lunarAlignment}</p>
                        </button>
                    ))}
                </div>
            )}

            <footer className="text-center mt-8">
                <button
                    onClick={onClose}
                    className="bg-starlight-silver/10 text-starlight-silver border border-starlight-silver/20 font-semibold py-2 px-6 rounded-lg hover:bg-starlight-silver/20 transition-colors duration-300"
                >
                    Return to Reading
                </button>
            </footer>
        </div>
    </div>
  );
};