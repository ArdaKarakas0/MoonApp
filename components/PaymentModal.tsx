import React, { useState } from 'react';
import { SubscriptionPlan } from '../types';
import { CreditCardIcon } from './icons/CreditCardIcon';
import { XIcon } from './icons/XIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';

const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{1,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
        parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
        return parts.join(' ');
    }
    return value;
};

const formatExpiryDate = (value: string) => {
    const cleanValue = value.replace(/\s*\/\s*/g, '').replace(/[^0-9]/gi, '');
    if (cleanValue.length >= 3) {
        return `${cleanValue.slice(0, 2)} / ${cleanValue.slice(2, 4)}`;
    }
    return cleanValue;
}

interface PaymentModalProps {
  plan: SubscriptionPlan;
  onClose: () => void;
  onSuccess: () => void;
}

type PaymentStatus = 'form' | 'processing' | 'success' | 'error';

export const PaymentModal: React.FC<PaymentModalProps> = ({ plan, onClose, onSuccess }) => {
  const [status, setStatus] = useState<PaymentStatus>('form');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>, formatter?: (val: string) => string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = formatter ? formatter(e.target.value) : e.target.value;
      setter(value);
      if (status === 'error') {
        setStatus('form');
        setErrorMessage('');
      }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('processing');
    setErrorMessage('');
    
    try {
        const response = await fetch('/api/process-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                cardNumber: cardNumber.replace(/\s/g, ''),
                expiry,
                cvc,
                plan,
            }),
        });
        
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'An unknown payment error occurred.');
        }

        setStatus('success');

    } catch (err) {
        setStatus('error');
        setErrorMessage(err instanceof Error ? err.message : 'Failed to process payment.');
    }
  };

  const PaymentForm = () => (
    <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
            <label htmlFor="cardNumber" className="block text-sm font-medium text-deep-sapphire/90 dark:text-starlight-silver/90 mb-2">Card Number</label>
            <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <CreditCardIcon className="h-5 w-5 text-deep-sapphire/50 dark:text-starlight-silver/50" />
                </div>
                <input 
                    type="tel" 
                    id="cardNumber" 
                    placeholder="**** **** **** ****" 
                    value={cardNumber}
                    onChange={handleInputChange(setCardNumber, formatCardNumber)}
                    maxLength={19}
                    className={`w-full bg-white/50 dark:bg-celestial-blue/50 border rounded-lg pl-10 pr-4 py-2 text-deep-sapphire dark:text-white placeholder-deep-sapphire/50 dark:placeholder-starlight-silver/50 focus:ring-2 focus:outline-none transition-shadow border-cloud-gray/40 dark:border-starlight-silver/20 focus:ring-sunbeam-gold dark:focus:ring-moonbeam-gold focus:border-sunbeam-gold dark:focus:border-moonbeam-gold`}
                />
            </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
            <div>
                <label htmlFor="expiry" className="block text-sm font-medium text-deep-sapphire/90 dark:text-starlight-silver/90 mb-2">Expiry</label>
                <input 
                    type="tel" 
                    id="expiry" 
                    placeholder="MM / YY" 
                    value={expiry}
                    onChange={handleInputChange(setExpiry, formatExpiryDate)}
                    maxLength={7}
                    className={`w-full bg-white/50 dark:bg-celestial-blue/50 border rounded-lg px-4 py-2 text-deep-sapphire dark:text-white placeholder-deep-sapphire/50 dark:placeholder-starlight-silver/50 focus:ring-2 focus:outline-none transition-shadow border-cloud-gray/40 dark:border-starlight-silver/20 focus:ring-sunbeam-gold dark:focus:ring-moonbeam-gold focus:border-sunbeam-gold dark:focus:border-moonbeam-gold`}
                />
            </div>
            <div>
                <label htmlFor="cvc" className="block text-sm font-medium text-deep-sapphire/90 dark:text-starlight-silver/90 mb-2">CVC</label>
                <input 
                    type="tel" 
                    id="cvc" 
                    placeholder="123" 
                    value={cvc}
                    onChange={handleInputChange(setCvc, (v) => v.replace(/[^0-9]/gi, ''))}
                    maxLength={4}
                    className={`w-full bg-white/50 dark:bg-celestial-blue/50 border rounded-lg px-4 py-2 text-deep-sapphire dark:text-white placeholder-deep-sapphire/50 dark:placeholder-starlight-silver/50 focus:ring-2 focus:outline-none transition-shadow border-cloud-gray/40 dark:border-starlight-silver/20 focus:ring-sunbeam-gold dark:focus:ring-moonbeam-gold focus:border-sunbeam-gold dark:focus:border-moonbeam-gold`}
                />
            </div>
        </div>

        {status === 'error' && <p className="mt-1 text-sm text-center text-red-500 dark:text-red-400">{errorMessage}</p>}

        <div className="pt-4">
              <button
                type="submit"
                disabled={status === 'processing'}
                className="w-full bg-sunbeam-gold dark:bg-moonbeam-gold text-white dark:text-celestial-blue font-bold py-3 px-4 rounded-lg hover:bg-amber-600 dark:hover:bg-amber-300 transition-colors duration-300 shadow-lg shadow-sunbeam-gold/30 dark:shadow-moonbeam-gold/20 disabled:bg-cloud-gray/50 dark:disabled:bg-starlight-silver/20 disabled:text-gray-500 dark:disabled:text-starlight-silver/50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center"
            >
                {status === 'processing' ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white dark:text-celestial-blue" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                    </>
                ) : (
                    `Confirm and Pay ${plan.price}`
                )}
            </button>
        </div>
    </form>
  );

  const SuccessView = () => (
    <div className="text-center mt-8 animate-fade-in">
        <CheckCircleIcon className="w-16 h-16 text-green-500 dark:text-green-400 mx-auto" />
        <h3 className="text-2xl font-serif font-bold text-deep-sapphire dark:text-white mt-4">Your Path Has Deepened</h3>
        <p className="text-deep-sapphire/80 dark:text-starlight-silver/80 mt-2">Welcome to {plan.name}. Your enhanced guidance awaits.</p>
        <button
            onClick={onSuccess}
            className="mt-8 w-full bg-sunbeam-gold dark:bg-moonbeam-gold text-white dark:text-celestial-blue font-bold py-3 px-4 rounded-lg hover:bg-amber-600 dark:hover:bg-amber-300 transition-colors duration-300 shadow-lg shadow-sunbeam-gold/30 dark:shadow-moonbeam-gold/20"
        >
            Continue
        </button>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="w-full max-w-md bg-gradient-to-br from-sky-blue to-dawn-pink dark:from-celestial-blue dark:to-midnight-purple rounded-2xl p-8 shadow-lg shadow-gray-400/30 dark:shadow-glow-white border border-cloud-gray/30 dark:border-starlight-silver/20 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-deep-sapphire/70 dark:text-starlight-silver/70 hover:text-deep-sapphire dark:hover:text-white transition-colors">
          <XIcon className="w-6 h-6" />
        </button>

        {status !== 'success' && (
             <div className="text-center">
                <h2 className="text-2xl font-serif font-bold text-deep-sapphire dark:text-white">Unlock {plan.name}</h2>
                <p className="text-sunbeam-gold dark:text-moonbeam-gold text-4xl font-bold my-4">{plan.price}</p>
                <p className="text-deep-sapphire/80 dark:text-starlight-silver/80">You are about to begin a deeper journey. Please confirm your secure payment.</p>
            </div>
        )}

        {status === 'success' ? <SuccessView /> : <PaymentForm />}
      </div>
    </div>
  );
};
