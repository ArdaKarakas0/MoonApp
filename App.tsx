
import React, { useState, useCallback, useEffect } from 'react';
import { Onboarding } from './components/Onboarding';
import { Loading } from './components/Loading';
import { DailyReadingDisplay } from './components/DailyReading';
import { SubscriptionPage } from './components/Subscription';
import { History } from './components/History';
import { generateDailyReading } from './services/geminiService';
import { Screen, DailyReading, MoonPhase, Plan, SubscriptionPlan } from './types';
import { Toast } from './components/Toast';

const availablePlans: SubscriptionPlan[] = [
    {
        name: Plan.FREE,
        price: "$0",
        tagline: "Daily Lunar Whispers",
        features: [
            "Standard Daily Reading",
            "Based on your mood",
            "Current Moon Phase guidance",
        ]
    },
    {
        name: Plan.PLUS,
        price: "$2.99 / month",
        tagline: "Clearer Lunar Insights",
        recommended: true,
        features: [
            "Everything in Free, plus:",
            "Expanded Lunar Messages",
            "Access to 30-day reading history",
            "Weekly Lunar Evolution reports",
        ]
    },
    {
        name: Plan.PREMIUM,
        price: "$4.99 / month",
        tagline: "Deeper Lunar Currents",
        features: [
            "Everything in Plus, plus:",
            "Deepest, most detailed readings",
            "Full unlimited reading history",
            "Special readings on Full & New Moons",
            "Priority access to new features",
        ]
    }
];

const App: React.FC = () => {
  const [screen, setScreen] = useState<Screen>('onboarding');
  const [previousScreen, setPreviousScreen] = useState<Screen>('onboarding');
  const [dailyReading, setDailyReading] = useState<DailyReading | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPlan, setCurrentPlan] = useState<Plan>(Plan.FREE);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [readingHistory, setReadingHistory] = useState<DailyReading[]>([]);
  const [viewingReadingIndex, setViewingReadingIndex] = useState<number | null>(null);

  useEffect(() => {
    try {
        const storedHistory = localStorage.getItem('moonpath_history');
        if (storedHistory) {
            setReadingHistory(JSON.parse(storedHistory));
        }
    } catch (e) {
        console.error("Failed to load reading history from localStorage", e);
    }
  }, []);

  const handleGetReading = useCallback(async (name: string, mood: string, moonPhase: MoonPhase) => {
    setIsLoading(true);
    setError(null);
    setScreen('loading');
    
    try {
      const readingData = await generateDailyReading(name, mood, moonPhase, currentPlan);
      const readingWithDate = { ...readingData, date: new Date().toISOString() };
      setDailyReading(readingWithDate);

      setReadingHistory(prevHistory => {
          const newHistory = [readingWithDate, ...prevHistory];
          try {
              localStorage.setItem('moonpath_history', JSON.stringify(newHistory));
          } catch (e) {
              console.error("Failed to save reading history to localStorage", e);
          }
          return newHistory;
      });

      setScreen('reading');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(errorMessage);
      setScreen('onboarding');
    } finally {
      setIsLoading(false);
    }
  }, [currentPlan]);
  
  const handleReset = () => {
      setScreen('onboarding');
      setDailyReading(null);
      setError(null);
      setViewingReadingIndex(null);
  };

  const handleManageSubscription = () => {
      setPreviousScreen(screen === 'loading' ? 'onboarding' : screen);
      setScreen('subscription');
  };

  const handleSelectPlan = (plan: Plan) => {
      const oldPlan = currentPlan;
      setCurrentPlan(plan);
      setScreen(previousScreen);
      if (plan !== oldPlan) {
          if (plan === Plan.FREE) {
            setToastMessage("You've returned to the free path.");
          } else {
            setToastMessage(`Welcome to ${plan}! Your path has deepened.`);
          }
      }
  };
  
  const handleCloseSubscription = () => {
      setScreen(previousScreen);
  }

  const handleViewHistory = () => {
    setViewingReadingIndex(null);
    setScreen('history');
  }

  const handleSelectHistoricReading = (index: number) => {
    setViewingReadingIndex(index);
    setScreen('reading');
  }

  const handleBackToHistory = () => {
    setViewingReadingIndex(null);
    setScreen('history');
  }

  const renderScreen = () => {
    const readingToDisplay = viewingReadingIndex !== null ? readingHistory[viewingReadingIndex] : dailyReading;

    switch (screen) {
      case 'onboarding':
        return <Onboarding onStart={handleGetReading} error={error} onManageSubscription={handleManageSubscription} />;
      case 'loading':
        return (
            <>
                <Onboarding onStart={handleGetReading} onManageSubscription={handleManageSubscription}/>
                <Loading />
            </>
        );
      case 'reading':
        return readingToDisplay ? (
            <DailyReadingDisplay 
                reading={readingToDisplay} 
                currentPlan={currentPlan}
                onReset={handleReset} 
                onManageSubscription={handleManageSubscription}
                onViewHistory={handleViewHistory}
                isViewingHistory={viewingReadingIndex !== null}
                onBackToHistory={handleBackToHistory}
            />
        ) : <Onboarding onStart={handleGetReading} error="Something went wrong, please try again." onManageSubscription={handleManageSubscription}/>;
      case 'subscription':
        return <SubscriptionPage plans={availablePlans} currentPlan={currentPlan} onSelectPlan={handleSelectPlan} onClose={handleCloseSubscription} />;
      case 'history':
        return <History 
                  history={readingHistory} 
                  currentPlan={currentPlan} 
                  onSelectReading={handleSelectHistoricReading}
                  onClose={handleReset}
                  onUpgrade={handleManageSubscription}
                />;
      default:
        return <Onboarding onStart={handleGetReading} onManageSubscription={handleManageSubscription} />;
    }
  };

  return (
    <main className="relative w-full min-h-screen">
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="relative z-10">
        {renderScreen()}
        {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
      </div>
    </main>
  );
};

export default App;