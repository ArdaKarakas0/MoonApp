
import React, { useEffect } from 'react';

interface ToastProps {
  message: string;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000); // The toast will disappear after 4 seconds

    return () => {
      clearTimeout(timer);
    };
  }, [onClose]);

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
        <div className="bg-sunbeam-gold/90 dark:bg-moonbeam-gold/90 backdrop-blur-sm text-white dark:text-celestial-blue font-semibold rounded-lg px-6 py-3 shadow-lg shadow-sunbeam-gold/40 dark:shadow-glow-gold">
            {message}
        </div>
    </div>
  );
};