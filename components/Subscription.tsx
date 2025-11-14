import React from 'react';
import { SubscriptionPlan, Plan } from '../types';
import { MoonIcon } from './icons/MoonIcon';

interface SubscriptionPageProps {
  plans: SubscriptionPlan[];
  currentPlan: Plan;
  onSelectPlan: (plan: Plan) => void;
  onClose: () => void;
}

const PlanCard: React.FC<{ plan: SubscriptionPlan; isCurrent: boolean; onSelect: () => void; }> = ({ plan, isCurrent, onSelect }) => (
  <div
    className={`bg-white/30 dark:bg-midnight-purple/30 backdrop-blur-md rounded-2xl p-6 shadow-lg shadow-gray-400/20 dark:shadow-glow-white border transition-all duration-300 flex flex-col ${
      isCurrent ? 'border-sunbeam-gold dark:border-moonbeam-gold' : 'border-cloud-gray/30 dark:border-starlight-silver/10'
    } ${plan.recommended ? 'relative ring-2 ring-sunbeam-gold dark:ring-moonbeam-gold shadow-sunbeam-gold/30 dark:shadow-glow-gold' : ''}`}
  >
    {plan.recommended && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-sunbeam-gold dark:bg-moonbeam-gold text-white dark:text-celestial-blue text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            Recommended
        </div>
    )}
    <h3 className="text-2xl font-serif font-bold text-deep-sapphire dark:text-white">{plan.name}</h3>
    <p className="text-deep-sapphire/80 dark:text-starlight-silver/80 mb-4">{plan.tagline}</p>
    <p className="text-3xl font-bold text-deep-sapphire dark:text-white mb-6">{plan.price}</p>
    <ul className="space-y-3 text-deep-sapphire/90 dark:text-starlight-silver/90 mb-8 flex-grow">
      {plan.features.map((feature, index) => (
        <li key={index} className="flex items-start">
          <MoonIcon className="w-4 h-4 text-sunbeam-gold dark:text-moonbeam-gold mr-3 mt-1 flex-shrink-0" />
          <span>{feature}</span>
        </li>
      ))}
    </ul>
    <button
      onClick={onSelect}
      disabled={isCurrent}
      className="w-full font-bold py-3 px-4 rounded-lg transition-colors duration-300 disabled:cursor-not-allowed text-center mt-auto
        ${isCurrent 
            ? 'bg-cloud-gray/50 dark:bg-starlight-silver/20 text-gray-500 dark:text-starlight-silver/50' 
            : `bg-sunbeam-gold dark:bg-moonbeam-gold text-white dark:text-celestial-blue hover:bg-amber-600 dark:hover:bg-amber-300 shadow-lg shadow-sunbeam-gold/30 dark:shadow-moonbeam-gold/20`
        }"
    >
      {isCurrent ? 'Current Plan' : 'Choose Plan'}
    </button>
  </div>
);


export const SubscriptionPage: React.FC<SubscriptionPageProps> = ({ plans, currentPlan, onSelectPlan, onClose }) => {

  const handlePlanSelection = (plan: SubscriptionPlan) => {
    onSelectPlan(plan.name);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 animate-fade-in">
        <div className="w-full max-w-6xl mx-auto">
            <header className="text-center mb-10">
                <h1 className="text-4xl sm:text-5xl font-serif font-bold text-deep-sapphire dark:text-white">Choose Your Path</h1>
                <p className="mt-2 text-deep-sapphire/80 dark:text-starlight-silver/80 max-w-2xl mx-auto">
                    Welcome to the MoonPath Beta! Explore all our features for free during this period and help us shape the final journey.
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
                <p className="text-sm text-deep-sapphire/60 dark:text-starlight-silver/60">
                    As a thank you for being a beta tester, all plans are free. You can change your plan at any time.
                </p>
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