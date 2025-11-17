
export enum MoonPhase {
  NEW_MOON = "New Moon",
  WAXING_CRESCENT = "Waxing Crescent",
  FIRST_QUARTER = "First Quarter",
  WAXING_GIBBOUS = "Waxing Gibbous",
  FULL_MOON = "Full Moon",
  WANING_GIBBOUS = "Waning Gibbous",
  LAST_QUARTER = "Last Quarter",
  WANING_CRESCENT = "Waning Crescent",
}

export enum Plan {
  FREE = "Free",
  PLUS = "MoonPath Plus",
  PREMIUM = "MoonPath Premium",
}

export interface SubscriptionPlan {
    name: Plan;
    price: string;
    tagline: string;
    features: string[];
    recommended?: boolean;
}

export type Screen = 'onboarding' | 'loading' | 'reading' | 'subscription' | 'history' | 'weekly_report' | 'settings';

// This is the standard content structure returned by the AI model
export interface DailyReading {
  readingType: 'daily';
  moonPhaseHeading: {
    title: string;
    description: string;
  };
  lunarAlignment: string;
  lunarMessage: string[];
  lunarWarning: string;
  opportunityWindow: string;
  lunarSymbol: {
    name: string;
    meaning: string;
  };
  closingLine: string;
}

// This is the special content structure for Premium users on Full/New Moons
export interface SpecialReading {
  readingType: 'special';
  moonPhaseHeading: {
    title: string;
    description: string;
  };
  lunarAlignment: string;
  specialTheme: string;
  deepDiveMessage: string[];
  ritualSuggestion: {
      title: string;
      description: string;
  };
  oracleInsight: {
      title: string;
      description: string;
  };
  closingLine: string;
}

// This is the object we store in our history state and localStorage
export interface HistoricReading {
  id: string; // A unique ID for each entry, good for keys and lookups
  date: string; // ISO string of when the reading was generated
  userInputs: {
    name: string;
    mood: string;
    moonPhase: MoonPhase;
  };
  reading: DailyReading | SpecialReading; // The content from the AI
  journalEntry: string; // User's personal notes
}

// This is the content structure for the weekly report returned by the AI
export interface WeeklyReport {
  dateRange: string;
  moodAnalysis: {
    title: string;
    description: string;
  };
  thematicInsights: {
    title: string;
    description: string;
  };
  forwardGuidance: {
    title: string;
    description: string;
  };
}
