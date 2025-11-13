import React, { useState } from 'react';
import { SubscriptionPlan } from '../types';
import { CreditCardIcon } from './icons/CreditCardIcon';
import { XIcon } from './icons/XIcon';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Define the props interface for the PaymentModal component.
interface PaymentModalProps {
  plan: SubscriptionPlan;
  onClose: () => void;
  onSuccess: () => void;
}

const cardElementOptions = {
    style: {
        base: {
            color: '#d1d5db', // Corresponds to starlight-silver for dark mode text
            fontFamily: 'Inter, sans-serif',
            fontSize: '16px',
            '::placeholder': {
                color: '#d1d5db80', // starlight-silver with opacity
            },
        },
        invalid: {
            color: '#ef4444', // Red color for errors
            iconColor: '#ef4444',
        },
    },
};
// A separate style object for light mode can be applied conditionally if needed,
// but for simplicity, we'll use a style that works well on the dark modal.

export const PaymentModal: React.FC<PaymentModalProps> = ({ plan, onClose, onSuccess }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      return;
    }

    setIsProcessing(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
        setIsProcessing(false);
        return;
    }

    // In a real application, you would create a PaymentIntent on your server
    // and use its clientSecret to confirm the payment on the client.
    // For this frontend-only demo, we'll use `createPaymentMethod` to validate
    // the card details with Stripe's API securely.
    const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
    });
    
    if (error) {
        setError(error.message || "An unexpected error occurred.");
        setIsProcessing(false);
    } else {
        // Card details are valid and a payment method is created.
        // Now, we simulate the rest of the successful payment flow.
        console.log('Successfully created payment method:', paymentMethod);
        setTimeout(() => {
            setIsProcessing(false);
            onSuccess();
        }, 1000); // Short delay to show success
    }
  };
  
  const isSubmitDisabled = !stripe || !elements || isProcessing;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="w-full max-w-md bg-gradient-to-br from-sky-blue to-dawn-pink dark:from-celestial-blue dark:to-midnight-purple rounded-2xl p-8 shadow-lg shadow-gray-400/30 dark:shadow-glow-white border border-cloud-gray/30 dark:border-starlight-silver/20 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-deep-sapphire/70 dark:text-starlight-silver/70 hover:text-deep-sapphire dark:hover:text-white transition-colors">
          <XIcon className="w-6 h-6" />
        </button>

        <div className="text-center">
            <h2 className="text-2xl font-serif font-bold text-deep-sapphire dark:text-white">Unlock {plan.name}</h2>
            <p className="text-sunbeam-gold dark:text-moonbeam-gold text-4xl font-bold my-4">{plan.price}</p>
            <p className="text-deep-sapphire/80 dark:text-starlight-silver/80">You are about to begin a deeper journey. Please confirm your secure payment.</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div>
                <label className="block text-sm font-medium text-deep-sapphire/90 dark:text-starlight-silver/90 mb-2">Card Details</label>
                <div className="p-3 bg-white/50 dark:bg-celestial-blue/50 border border-cloud-gray/40 dark:border-starlight-silver/20 rounded-lg focus-within:ring-2 focus-within:ring-sunbeam-gold dark:focus-within:ring-moonbeam-gold">
                   <CardElement options={cardElementOptions} />
                </div>
            </div>

            {error && <p id="card-error" className="mt-1 text-xs text-center text-red-500 dark:text-red-400">{error}</p>}

            <div className="pt-2">
                 <button
                    type="submit"
                    disabled={isSubmitDisabled}
                    className="w-full bg-sunbeam-gold dark:bg-moonbeam-gold text-white dark:text-celestial-blue font-bold py-3 px-4 rounded-lg hover:bg-amber-600 dark:hover:bg-amber-300 transition-colors duration-300 shadow-lg shadow-sunbeam-gold/30 dark:shadow-moonbeam-gold/20 disabled:bg-cloud-gray/50 dark:disabled:bg-starlight-silver/20 disabled:text-gray-500 dark:disabled:text-starlight-silver/50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center"
                >
                    {isProcessing ? (
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
      </div>
    </div>
  );
};