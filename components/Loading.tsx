
import React, { useState, useEffect } from 'react';

const messages = [
  "The moon is listening...",
  "Gathering cosmic insights...",
  "Translating starlight...",
  "Consulting the lunar tides...",
];

export const Loading: React.FC = () => {
  const [message, setMessage] = useState(messages[0]);

  useEffect(() => {
    let messageIndex = 0;
    const intervalId = setInterval(() => {
      messageIndex = (messageIndex + 1) % messages.length;
      setMessage(messages[messageIndex]);
    }, 2500); // Change message every 2.5 seconds

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="fixed inset-0 bg-sky-blue/50 dark:bg-celestial-blue/50 backdrop-blur-sm flex flex-col items-center justify-center z-50 transition-opacity duration-300">
      <div className="w-24 h-24 rounded-full bg-moonbeam-gold shadow-lg shadow-sunbeam-gold/40 dark:shadow-glow-gold relative overflow-hidden">
        <div className="w-24 h-24 rounded-full bg-sky-blue dark:bg-celestial-blue absolute top-0 left-0 animate-lunar-cycle"></div>
      </div>
      <p className="mt-6 text-lg font-serif tracking-wider text-sunbeam-gold dark:text-moonbeam-gold text-center px-4">
        {message}
      </p>
    </div>
  );
};
