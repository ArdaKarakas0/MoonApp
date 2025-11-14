
import React from 'react';
import { SunIcon } from './icons/SunIcon';
import { CrescentMoonIcon } from './icons/CrescentMoonIcon';

interface ThemeToggleProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ theme, toggleTheme }) => {
  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      className="fixed top-4 right-4 z-50 w-12 h-12 bg-white/40 dark:bg-midnight-purple/40 backdrop-blur-md rounded-full flex items-center justify-center border border-cloud-gray/30 dark:border-starlight-silver/10 text-sunbeam-gold dark:text-moonbeam-gold hover:bg-black/5 dark:hover:bg-starlight-silver/10 transition-all duration-300"
    >
      {theme === 'light' ? (
        <CrescentMoonIcon className="w-6 h-6" />
      ) : (
        <SunIcon className="w-6 h-6" />
      )}
    </button>
  );
};