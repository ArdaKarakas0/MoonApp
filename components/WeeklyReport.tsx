import React from 'react';
import { WeeklyReport } from '../types';
import { Card } from './Card';

interface WeeklyReportProps {
    report: WeeklyReport;
    onClose: () => void;
}

export const WeeklyReportDisplay: React.FC<WeeklyReportProps> = ({ report, onClose }) => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6">
            <div className="w-full max-w-2xl mx-auto animate-fade-in space-y-6">
                <header className="text-center">
                    <p className="text-sunbeam-gold/80 dark:text-moonbeam-gold/80 mb-2 font-serif">{report.dateRange}</p>
                    <h1 className="text-4xl sm:text-5xl font-serif font-bold text-deep-sapphire dark:text-white">Your Weekly Lunar Evolution</h1>
                    <p className="mt-2 text-deep-sapphire/80 dark:text-starlight-silver/80">A reflection on your journey through the moon's recent phases.</p>
                </header>

                <Card title={report.moodAnalysis.title}>
                    <p>{report.moodAnalysis.description}</p>
                </Card>

                <Card title={report.thematicInsights.title}>
                    <p>{report.thematicInsights.description}</p>
                </Card>
                
                <Card title={report.forwardGuidance.title}>
                    <p>{report.forwardGuidance.description}</p>
                </Card>
                
                <footer className="pt-6 flex items-center justify-center">
                    <button
                        onClick={onClose}
                        className="bg-sunbeam-gold dark:bg-moonbeam-gold text-white dark:text-celestial-blue font-bold py-2 px-6 rounded-lg hover:bg-amber-600 dark:hover:bg-amber-300 transition-colors duration-300 shadow-lg shadow-sunbeam-gold/30 dark:shadow-moonbeam-gold/20 w-full sm:w-auto"
                    >
                        Return to History
                    </button>
                </footer>
            </div>
        </div>
    );
};