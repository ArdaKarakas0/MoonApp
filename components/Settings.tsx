
import React, from 'react';
import { ChevronRightIcon } from './icons/ChevronRightIcon';
import { CogIcon } from './icons/CogIcon';
import { InfoIcon } from './icons/InfoIcon';
import { LanguageIcon } from './icons/LanguageIcon';
import { TrashIcon } from './icons/TrashIcon';

interface SettingsProps {
    onClose: () => void;
    onManageSubscription: () => void;
    onClearHistory: () => void;
}

const SettingsRow: React.FC<{ icon: React.ReactNode; label: string; children: React.ReactNode; }> = ({ icon, label, children }) => (
    <div className="flex items-center justify-between py-4 px-5 bg-white/30 dark:bg-celestial-blue/30">
        <div className="flex items-center">
            <div className="w-6 h-6 text-deep-sapphire dark:text-starlight-silver">{icon}</div>
            <span className="ml-4 text-deep-sapphire dark:text-starlight-silver font-medium">{label}</span>
        </div>
        <div>{children}</div>
    </div>
);

export const Settings: React.FC<SettingsProps> = ({ onClose, onManageSubscription, onClearHistory }) => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 animate-fade-in">
            <div className="w-full max-w-md mx-auto">
                <header className="text-center mb-8">
                    <h1 className="text-4xl sm:text-5xl font-serif font-bold text-deep-sapphire dark:text-white">Settings</h1>
                    <p className="mt-2 text-deep-sapphire/80 dark:text-starlight-silver/80">
                        Adjust your cosmic connection.
                    </p>
                </header>

                <div className="space-y-4">
                    {/* General Settings */}
                    <div className="bg-white/20 dark:bg-midnight-purple/20 backdrop-blur-md rounded-xl shadow-lg border border-cloud-gray/20 dark:border-starlight-silver/10 overflow-hidden">
                        <div className="p-4 border-b border-cloud-gray/20 dark:border-starlight-silver/10">
                            <h2 className="font-semibold text-deep-sapphire dark:text-white">General</h2>
                        </div>
                        <SettingsRow icon={<LanguageIcon />} label="Language">
                            <select
                                disabled
                                className="bg-white/50 dark:bg-celestial-blue/50 border border-cloud-gray/40 dark:border-starlight-silver/20 rounded-lg px-3 py-1 text-sm text-deep-sapphire dark:text-white focus:ring-2 focus:ring-sunbeam-gold dark:focus:ring-moonbeam-gold focus:outline-none disabled:opacity-70"
                            >
                                <option>English</option>
                                <option>Español (soon)</option>
                                <option>Français (soon)</option>
                            </select>
                        </SettingsRow>
                    </div>

                    {/* Account Settings */}
                    <div className="bg-white/20 dark:bg-midnight-purple/20 backdrop-blur-md rounded-xl shadow-lg border border-cloud-gray/20 dark:border-starlight-silver/10 overflow-hidden">
                        <div className="p-4 border-b border-cloud-gray/20 dark:border-starlight-silver/10">
                            <h2 className="font-semibold text-deep-sapphire dark:text-white">Account</h2>
                        </div>
                        <button onClick={onManageSubscription} className="w-full text-left transition-colors hover:bg-black/5 dark:hover:bg-white/5">
                            <SettingsRow icon={<CogIcon />} label="Manage Subscription">
                                <ChevronRightIcon className="w-5 h-5 text-deep-sapphire/50 dark:text-starlight-silver/50" />
                            </SettingsRow>
                        </button>
                    </div>
                    
                    {/* Data Settings */}
                    <div className="bg-white/20 dark:bg-midnight-purple/20 backdrop-blur-md rounded-xl shadow-lg border border-cloud-gray/20 dark:border-starlight-silver/10 overflow-hidden">
                        <div className="p-4 border-b border-cloud-gray/20 dark:border-starlight-silver/10">
                            <h2 className="font-semibold text-deep-sapphire dark:text-white">Data</h2>
                        </div>
                         <SettingsRow icon={<TrashIcon />} label="Clear Reading History">
                           <button 
                                onClick={onClearHistory}
                                className="text-sm font-semibold text-red-600 dark:text-red-400 bg-red-500/10 dark:bg-red-500/10 border border-red-500/20 dark:border-red-400/20 px-3 py-1 rounded-md hover:bg-red-500/20 dark:hover:bg-red-400/20 transition-colors"
                           >
                            Clear
                           </button>
                        </SettingsRow>
                    </div>

                    {/* About */}
                     <div className="bg-white/20 dark:bg-midnight-purple/20 backdrop-blur-md rounded-xl shadow-lg border border-cloud-gray/20 dark:border-starlight-silver/10 overflow-hidden">
                        <div className="p-4 border-b border-cloud-gray/20 dark:border-starlight-silver/10">
                            <h2 className="font-semibold text-deep-sapphire dark:text-white">About</h2>
                        </div>
                        <SettingsRow icon={<InfoIcon />} label="Version">
                           <span className="text-sm text-deep-sapphire/70 dark:text-starlight-silver/70">1.0.0</span>
                        </SettingsRow>
                    </div>

                </div>

                <footer className="text-center mt-8">
                    <button
                        onClick={onClose}
                        className="bg-black/5 dark:bg-starlight-silver/10 text-deep-sapphire dark:text-starlight-silver border border-cloud-gray/40 dark:border-starlight-silver/20 font-semibold py-2 px-6 rounded-lg hover:bg-black/10 dark:hover:bg-starlight-silver/20 transition-colors duration-300"
                    >
                        Return
                    </button>
                </footer>
            </div>
        </div>
    );
};
