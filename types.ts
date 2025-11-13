
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

export type Screen = 'onboarding' | 'loading' | 'reading' | 'subscription' | 'history';

// This is the content structure returned by the AI model
export interface DailyReading {
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

// This is the object we store in our history state and localStorage
export interface HistoricReading {
  id: string; // A unique ID for each entry, good for keys and lookups
  date: string; // ISO string of when the reading was generated
  userInputs: {
    name: string;
    mood: string;
    moonPhase: MoonPhase;
  };
  reading: DailyReading; // The content from the AI
  journalEntry: string; // User's personal notes
}
