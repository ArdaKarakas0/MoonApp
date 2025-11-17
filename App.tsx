import React, { useState, useCallback, useEffect } from 'react';
import { Onboarding } from './components/Onboarding';
import { Loading } from './components/Loading';
import { DailyReadingDisplay } from './components/DailyReading';
import { SubscriptionPage } from './components/Subscription';
import { History } from './components/History';
import { generateReading, generateWeeklyReport } from './services/geminiService';
import { Screen, MoonPhase, Plan, SubscriptionPlan, HistoricReading, WeeklyReport } from './types';
import { secureGetItem, secureSetItem } from './utils/secureStore';
import { Toast } from './components/Toast';
import { ThemeToggle } from './components/ThemeToggle';
import { WeeklyReportDisplay } from './components/WeeklyReport';
import { Settings } from './components/Settings';
import { ConfirmationModal } from './components/ConfirmationModal';
import { CogIcon } from './components/icons/CogIcon';

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
        price: "$0 / month (Beta)",
        tagline: "Free access during our beta!",
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
        price: "$0 / month (Beta)",
        tagline: "Free access during our beta!",
        features: [
            "Everything in Plus, plus:",
            "Deepest, most detailed readings",
            "Full unlimited reading history",
            "Special readings on Full & New Moons",
            "Priority access to new features",
        ]
    }
];

const APP_HISTORY_KEY = 'moonpath_history';
const APP_PLAN_KEY = 'moonpath_plan';
const APP_THEME_KEY = 'moonpath_theme';

type Theme = 'light' | 'dark';

const getInitialTheme = (): Theme => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const storedTheme = localStorage.getItem(APP_THEME_KEY);
      if (storedTheme === 'light' || storedTheme === 'dark') {
        return storedTheme;
      }
    }
  } catch (e) {
    console.warn("Could not access localStorage to get theme. Defaulting to 'dark'.");
  }
  return 'dark';
};


const App: React.FC = () => {
  const [screen, setScreen] = useState<Screen>('onboarding');
  const [previousScreen, setPreviousScreen] = useState<Screen>('onboarding');
  const [currentReading, setCurrentReading] = useState<HistoricReading | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPlan, setCurrentPlan] = useState<Plan>(Plan.FREE);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [readingHistory, setReadingHistory] = useState<HistoricReading[]>([]);
  const [isViewingFromHistory, setIsViewingFromHistory] = useState(false);
  const [weeklyReport, setWeeklyReport] = useState<WeeklyReport | null>(null);
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [isClearHistoryModalOpen, setIsClearHistoryModalOpen] = useState(false);


  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try {
        if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.setItem(APP_THEME_KEY, theme);
        }
    } catch (e) {
        console.error("Failed to save theme to localStorage", e);
    }
  }, [theme]);

  useEffect(() => {
    const storedPlan = secureGetItem<Plan>(APP_PLAN_KEY, Plan.FREE);
    setCurrentPlan(storedPlan);

    try {
        const storedHistory = localStorage.getItem(APP_HISTORY_KEY);
        if (storedHistory) {
            setReadingHistory(JSON.parse(storedHistory));
        }
    } catch (e) {
        console.error("Failed to load reading history from localStorage", e);
    }
  }, []);
  
  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const handleGetReading = useCallback(async (name: string, mood: string, moonPhase: MoonPhase) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const readingData = await generateReading(name, mood, moonPhase, currentPlan);
      const newHistoricReading: HistoricReading = {
          id: new Date().toISOString() + Math.random(),
          date: new Date().toISOString(),
          userInputs: { name, mood, moonPhase },
          reading: readingData,
          journalEntry: '',
      };

      setCurrentReading(newHistoricReading);
      setIsViewingFromHistory(false);

      setReadingHistory(prevHistory => {
          const newHistory = [newHistoricReading, ...prevHistory];
          try {
              localStorage.setItem(APP_HISTORY_KEY, JSON.stringify(newHistory));
          } catch (e) {
              console.error("Failed to save reading history to localStorage", e);
              setToastMessage("Could not save reading to history. Storage may be full.");
          }
          return newHistory;
      });

      setScreen('reading');
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
      setScreen('onboarding');
    } finally {
      setIsLoading(false);
    }
  }, [currentPlan]);
  
  const handleReset = () => {
      setScreen('onboarding');
      setCurrentReading(null);
      setError(null);
      setIsViewingFromHistory(false);
  };

  const handleManageSubscription = () => {
      setPreviousScreen(screen);
      setScreen('subscription');
  };

  const handleSelectPlan = (plan: Plan) => {
      const oldPlan = currentPlan;
      setCurrentPlan(plan);
      secureSetItem(APP_PLAN_KEY, plan);
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
    setScreen('history');
  }

  const handleSelectHistoricReading = (reading: HistoricReading) => {
    setCurrentReading(reading);
    setIsViewingFromHistory(true);
    setScreen('reading');
  }

  const handleBackToHistory = () => {
    setIsViewingFromHistory(true);
    setScreen('history');
  }

  const handleUpdateJournal = (readingId: string, journalText: string) => {
    setReadingHistory(prevHistory => {
        const newHistory = prevHistory.map(reading => 
            reading.id === readingId ? { ...reading, journalEntry: journalText } : reading
        );
        try {
            localStorage.setItem(APP_HISTORY_KEY, JSON.stringify(newHistory));
        } catch (e) {
            console.error("Failed to save updated journal to localStorage", e);
            setToastMessage("Could not save journal entry. Storage may be full.");
        }
        if (currentReading?.id === readingId) {
            setCurrentReading(prev => prev ? { ...prev, journalEntry: journalText } : null);
        }
        return newHistory;
    });
  };

  const handleGenerateWeeklyReport = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentHistory = readingHistory.filter(r => new Date(r.date) > sevenDaysAgo);

    if (recentHistory.length < 3) {
        setToastMessage("You need at least 3 readings in the last 7 days to generate a report.");
        setIsLoading(false);
        setScreen('history');
        return;
    }

    const mostRecentName = readingHistory[0]?.userInputs?.name || '';

    try {
        const reportData = await generateWeeklyReport(mostRecentName, recentHistory);
        setWeeklyReport(reportData);
        setScreen('weekly_report');
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
        setScreen('history');
        setToastMessage(`Could not generate report: ${errorMessage}`);
    } finally {
        setIsLoading(false);
    }
  }, [readingHistory]);

  const handleBackToHistoryFromReport = () => {
    setWeeklyReport(null);
    setScreen('history');
  }

  const handleOpenSettings = () => {
    setPreviousScreen(screen);
    setScreen('settings');
  };

  const handleCloseSettings = () => {
    setScreen(previousScreen);
  };
  
  const handleInitiateClearHistory = () => {
    setIsClearHistoryModalOpen(true);
  };

  const handleConfirmClearHistory = () => {
    setReadingHistory([]);
    try {
        localStorage.removeItem(APP_HISTORY_KEY);
    } catch (e) {
        console.error("Failed to clear history from localStorage", e);
        setToastMessage("Could not clear history.");
    }
    setIsClearHistoryModalOpen(false);
    setToastMessage("Reading history cleared.");
  };

  const renderScreen = () => {
    switch (screen) {
      case 'onboarding':
        return <Onboarding onStart={handleGetReading} error={error} onManageSubscription={handleManageSubscription} />;
      case 'reading':
        return currentReading ? (
            <DailyReadingDisplay 
                reading={currentReading} 
                currentPlan={currentPlan}
                onReset={handleReset} 
                onViewHistory={handleViewHistory}
                isViewingHistory={isViewingFromHistory}
                onBackToHistory={handleBackToHistory}
                onUpdateJournal={handleUpdateJournal}
            />
        ) : <Onboarding onStart={handleGetReading} error="Something went wrong, please try again." onManageSubscription={handleManageSubscription} />;
      case 'subscription':
        return <SubscriptionPage plans={availablePlans} currentPlan={currentPlan} onSelectPlan={handleSelectPlan} onClose={handleCloseSubscription} />;
      case 'history':
        return <History 
                  history={readingHistory} 
                  currentPlan={currentPlan} 
                  onSelectReading={handleSelectHistoricReading}
                  onClose={handleReset}
                  onUpgrade={handleManageSubscription}
                  onGenerateReport={handleGenerateWeeklyReport}
                />;
      case 'weekly_report':
        return weeklyReport ? (
          <WeeklyReportDisplay 
            report={weeklyReport}
            onClose={handleBackToHistoryFromReport}
          />
        ) : (
          <History 
            history={readingHistory} 
            currentPlan={currentPlan} 
            onSelectReading={handleSelectHistoricReading}
            onClose={handleReset}
            onUpgrade={handleManageSubscription}
            onGenerateReport={handleGenerateWeeklyReport}
          />
        );
      case 'settings':
        return <Settings
                  onClose={handleCloseSettings}
                  onManageSubscription={handleManageSubscription}
                  onClearHistory={handleInitiateClearHistory}
                />;
      default:
        return <Onboarding onStart={handleGetReading} error={error} onManageSubscription={handleManageSubscription} />;
    }
  };

  const showSettingsButton = !['subscription', 'settings', 'loading'].includes(screen);

  return (
    <main className="relative w-full min-h-screen">
      <div className="absolute inset-0 bg-black/10 dark:bg-black/20"></div>
      {showSettingsButton && (
        <button
          onClick={handleOpenSettings}
          aria-label="Open settings"
          className="fixed top-4 left-4 z-50 w-12 h-12 bg-white/40 dark:bg-midnight-purple/40 backdrop-blur-md rounded-full flex items-center justify-center border border-cloud-gray/30 dark:border-starlight-silver/10 text-deep-sapphire dark:text-starlight-silver hover:bg-black/5 dark:hover:bg-starlight-silver/10 transition-all duration-300"
        >
          <CogIcon className="w-6 h-6" />
        </button>
      )}
      <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
      <div className="relative z-10">
        {renderScreen()}
      </div>
      {isLoading && <Loading />}
      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
      {isClearHistoryModalOpen && (
        <ConfirmationModal
          isOpen={isClearHistoryModalOpen}
          onClose={() => setIsClearHistoryModalOpen(false)}
          onConfirm={handleConfirmClearHistory}
          title="Clear Reading History?"
          message="This action is permanent and cannot be undone. All your past readings and journal entries will be lost."
          confirmText="Yes, Clear History"
        />
      )}
    </main>
  );
};

export default App;
