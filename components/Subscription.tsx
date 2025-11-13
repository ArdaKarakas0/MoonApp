
import React, { useState } from 'react';
import { SubscriptionPlan, Plan } from '../types';
import { MoonIcon } from './icons/MoonIcon';
import { PaymentModal } from './PaymentModal';

interface SubscriptionPageProps {
  plans: SubscriptionPlan[];
  currentPlan: Plan;
  onSelectPlan: (plan: Plan) => void;
  onClose: () => void;
}

const PlanCard: React.FC<{ plan: SubscriptionPlan; isCurrent: boolean; onSelect: () => void; }> = ({ plan, isCurrent, onSelect }) => (
  <div
    className={`bg-midnight-purple/30 backdrop-blur-md rounded-2xl p-6 shadow-glow-white border transition-all duration-300 flex flex-col ${
      isCurrent ? 'border-moonbeam-gold' : 'border-starlight-silver/10'
    } ${plan.recommended ? 'relative ring-2 ring-moonbeam-gold shadow-glow-gold' : ''}`}
  >
    {plan.recommended && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-moonbeam-gold text-celestial-blue text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            Recommended
        </div>
    )}
    <h3 className="text-2xl font-serif font-bold text-white">{plan.name}</h3>
    <p className="text-starlight-silver/80 mb-4">{plan.tagline}</p>
    <p className="text-3xl font-bold text-white mb-6">{plan.price}</p>
    <ul className="space-y-3 text-starlight-silver/90 mb-8 flex-grow">
      {plan.features.map((feature, index) => (
        <li key={index} className="flex items-start">
          <MoonIcon className="w-4 h-4 text-moonbeam-gold mr-3 mt-1 flex-shrink-0" />
          <span>{feature}</span>
        </li>
      ))}
    </ul>
    <button
      onClick={onSelect}
      disabled={isCurrent}
      className="w-full font-bold py-3 px-4 rounded-lg transition-colors duration-300 disabled:cursor-not-allowed text-center mt-auto
        ${isCurrent 
            ? 'bg-starlight-silver/20 text-starlight-silver/50' 
            : `bg-moonbeam-gold text-celestial-blue hover:bg-amber-300 shadow-lg shadow-moonbeam-gold/20`
        }"
    >
      {isCurrent ? 'Current Plan' : 'Choose Plan'}
    </button>
  </div>
);


export const SubscriptionPage: React.FC<SubscriptionPageProps> = ({ plans, currentPlan, onSelectPlan, onClose }) => {
  const [selectedPlanForPayment, setSelectedPlanForPayment] = useState<SubscriptionPlan | null>(null);

  const handlePlanSelection = (plan: SubscriptionPlan) => {
    if (plan.name === Plan.FREE) {
        onSelectPlan(plan.name); // Downgrade directly
    } else {
        setSelectedPlanForPayment(plan); // Open payment modal for upgrade
    }
  };
  
  const handlePaymentSuccess = () => {
    if (selectedPlanForPayment) {
        onSelectPlan(selectedPlanForPayment.name);
    }
    setSelectedPlanForPayment(null);
  };


  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 animate-fade-in">
        <div className="w-full max-w-6xl mx-auto">
            <header className="text-center mb-10">
                <h1 className="text-4xl sm:text-5xl font-serif font-bold text-white">Choose Your Path</h1>
                <p className="mt-2 text-starlight-silver/80 max-w-2xl mx-auto">
                    The moon offers its wisdom freely, but for those who wish to walk a deeper path, enhanced guidance awaits.
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {plans.map(plan => (
                    <PlanCard 
                        key={plan.name}
                        plan={plan}
                        isCurrent={plan.name === currentPlan}
                        onSelect={() => handlePlanSelection(plan)}
                    />
                ))}
            </div>

            <footer className="text-center mt-12 space-y-4">
                <p className="text-sm text-starlight-silver/60">
                    Secure payment is handled by our trusted partners. You can change or cancel your plan at any time.
                </p>
                <button
                    onClick={onClose}
                    className="bg-starlight-silver/10 text-starlight-silver border border-starlight-silver/20 font-semibold py-2 px-6 rounded-lg hover:bg-starlight-silver/20 transition-colors duration-300"
                >
                    Return
                </button>
            </footer>
        </div>
        {selectedPlanForPayment && (
            <PaymentModal 
                plan={selectedPlanForPayment}
                onClose={() => setSelectedPlanForPayment(null)}
                onSuccess={handlePaymentSuccess}
            />
        )}
    </div>
  );
};