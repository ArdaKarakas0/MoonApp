
import React from 'react';

export const Loading: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-celestial-blue/50 backdrop-blur-sm flex flex-col items-center justify-center z-50 transition-opacity duration-300">
      <div className="w-24 h-24 rounded-full bg-moonbeam-gold/50 shadow-glow-gold animate-pulse"></div>
      <p className="mt-6 text-lg font-serif tracking-wider text-moonbeam-gold animate-pulse">
        The moon is listening...
      </p>
    </div>
  );
};
