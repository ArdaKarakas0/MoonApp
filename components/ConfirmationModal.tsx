
import React from 'react';
import { XIcon } from './icons/XIcon';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in"
      aria-labelledby="confirmation-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-md bg-gradient-to-br from-sky-blue to-dawn-pink dark:from-celestial-blue dark:to-midnight-purple rounded-2xl p-8 shadow-lg shadow-gray-400/30 dark:shadow-glow-white border border-cloud-gray/30 dark:border-starlight-silver/20 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-deep-sapphire/70 dark:text-starlight-silver/70 hover:text-deep-sapphire dark:hover:text-white transition-colors">
          <XIcon className="w-6 h-6" />
        </button>
        
        <div className="text-center">
          <h2 id="confirmation-title" className="text-2xl font-serif font-bold text-deep-sapphire dark:text-white">{title}</h2>
          <p className="mt-4 text-deep-sapphire/80 dark:text-starlight-silver/80">{message}</p>
        </div>
        
        <div className="mt-8 flex flex-col sm:flex-row-reverse gap-3">
          <button
            onClick={onConfirm}
            className="w-full sm:w-auto flex-1 bg-red-600 dark:bg-red-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-red-700 dark:hover:bg-red-600 transition-colors duration-300 shadow-lg shadow-red-500/30 dark:shadow-red-500/20"
          >
            {confirmText}
          </button>
          <button
            onClick={onClose}
            className="w-full sm:w-auto flex-1 bg-black/5 dark:bg-starlight-silver/10 text-deep-sapphire dark:text-starlight-silver border border-cloud-gray/40 dark:border-starlight-silver/20 font-semibold py-3 px-4 rounded-lg hover:bg-black/10 dark:hover:bg-starlight-silver/20 transition-colors duration-300"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
