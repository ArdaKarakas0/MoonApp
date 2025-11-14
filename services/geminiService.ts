import { MoonPhase, DailyReading, Plan, HistoricReading, WeeklyReport, SpecialReading } from '../types';

export const generateReading = async (userName: string, userMood: string, moonPhase: MoonPhase, currentPlan: Plan): Promise<DailyReading | SpecialReading> => {
  try {
    const response = await fetch('/api/generate-reading', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userName, userMood, moonPhase, currentPlan }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "The moon's message is veiled at the moment.");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching reading from API route:", error);
    if (error instanceof Error) {
        throw new Error(error.message);
    }
    throw new Error("The moon's message is veiled at the moment. Please try again later.");
  }
};

export const generateWeeklyReport = async (userName: string, history: HistoricReading[]): Promise<WeeklyReport> => {
  try {
    const response = await fetch('/api/generate-weekly-report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userName, history }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "The moon's currents are unclear right now.");
    }
    
    return await response.json();

  } catch (error) {
    console.error("Error fetching weekly report from API route:", error);
     if (error instanceof Error) {
        throw new Error(error.message);
    }
    throw new Error("The moon's currents are unclear right now. A weekly reflection is not yet available.");
  }
};