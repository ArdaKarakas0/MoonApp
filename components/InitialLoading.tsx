import React from 'react';
import { CrescentMoonIcon } from './icons/CrescentMoonIcon';

export const InitialLoading: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-sky-blue to-dawn-pink dark:from-celestial-blue dark:to-midnight-purple flex flex-col items-center justify-center z-50">
      <div className="animate-subtle-pulse">
        <CrescentMoonIcon className="w-24 h-24 text-moonbeam-gold" />
      </div>
      <h1 className="text-5xl font-serif text-deep-sapphire dark:text-white mt-6 animate-fade-in-up" style={{ animationDelay: '0.2s', opacity: 0 }}>
        MoonPath
      </h1>
      <p className="text-lg text-deep-sapphire/80 dark:text-starlight-silver/80 mt-2 animate-fade-in-up" style={{ animationDelay: '0.7s', opacity: 0 }}>
        Your daily guidance, whispered by the moon.
      </p>
    </div>
  );
};
