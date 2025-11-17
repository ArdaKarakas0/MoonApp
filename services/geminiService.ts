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
        const errorText = await response.text();
        try {
            // See if the text is valid JSON with an 'error' property
            const errorJson = JSON.parse(errorText);
            throw new Error(errorJson.error || "The moon's message is veiled at the moment.");
        } catch (e) {
            // The error response wasn't JSON. It might be a Vercel error page.
            console.error("Server error response (not JSON):", errorText);
            throw new Error("The moon's message is veiled at the moment. Please try again later.");
        }
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching reading from API route:", error);
    if (error instanceof Error) {
        throw error;
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
        const errorText = await response.text();
        try {
            // See if the text is valid JSON with an 'error' property
            const errorJson = JSON.parse(errorText);
            throw new Error(errorJson.error || "The moon's currents are unclear right now.");
        } catch (e) {
            // The error response wasn't JSON. It might be a Vercel error page.
            console.error("Server error response (not JSON):", errorText);
            throw new Error("The moon's currents are unclear right now. A weekly reflection is not yet available.");
        }
    }
    
    return await response.json();

  } catch (error) {
    console.error("Error fetching weekly report from API route:", error);
     if (error instanceof Error) {
        throw error;
    }
    throw new Error("The moon's currents are unclear right now. A weekly reflection is not yet available.");
  }
};