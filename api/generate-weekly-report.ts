// FIX: Refactor to use the @google/genai SDK for API calls, following best practices.
import { GoogleGenAI, Type } from '@google/genai';

// Types copied from `types.ts` to make this function self-contained
enum MoonPhase {
    NEW_MOON = "New Moon",
    WAXING_CRESCENT = "Waxing Crescent",
    FIRST_QUARTER = "First Quarter",
    WAXING_GIBBOUS = "Waxing Gibbous",
    FULL_MOON = "Full Moon",
    WANING_GIBBOUS = "Waning Gibbous",
    LAST_QUARTER = "Last Quarter",
    WANING_CRESCENT = "Waning Crescent",
}

interface DailyReading {
  readingType: 'daily';
  moonPhaseHeading: { title: string; description: string; };
  lunarAlignment: string;
  lunarMessage: string[];
  lunarWarning: string;
  opportunityWindow: string;
  lunarSymbol: { name: string; meaning: string; };
  closingLine: string;
}

interface SpecialReading {
  readingType: 'special';
  moonPhaseHeading: { title: string; description: string; };
  lunarAlignment: string;
  specialTheme: string;
  deepDiveMessage: string[];
  ritualSuggestion: { title: string; description: string; };
  oracleInsight: { title: string; description: string; };
  closingLine: string;
}

interface HistoricReading {
  id: string;
  date: string;
  userInputs: { name: string; mood: string; moonPhase: MoonPhase; };
  reading: DailyReading | SpecialReading;
  journalEntry: string;
}

interface WeeklyReport {
  dateRange: string;
  moodAnalysis: { title: string; description: string; };
  thematicInsights: { title: string; description: string; };
  forwardGuidance: { title: string; description: string; };
}


// We'll define simple interfaces for what we expect.
interface VercelRequest {
    method?: string;
    body: {
        userName: string;
        history: HistoricReading[];
    };
}

interface VercelResponse {
    status: (statusCode: number) => VercelResponse;
    json: (body: any) => void;
    setHeader: (key: string, value: string) => void;
}

const weeklyReportSchema = {
    type: Type.OBJECT,
    properties: {
        dateRange: { type: Type.STRING, description: "The date range of the analysis, e.g., 'October 28 - November 3, 2023'" },
        moodAnalysis: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING, description: "The title for the mood analysis section." },
                description: { type: Type.STRING, description: "1-2 paragraphs analyzing the user's moods." }
            },
            required: ['title', 'description']
        },
        thematicInsights: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING, description: "The title for the thematic insights section." },
                description: { type: Type.STRING, description: "1-2 paragraphs summarizing recurring themes." }
            },
            required: ['title', 'description']
        },
        forwardGuidance: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING, description: "The title for the forward guidance section." },
                description: { type: Type.STRING, description: "1 paragraph of gentle guidance for the next week." }
            },
            required: ['title', 'description']
        }
    },
    required: ['dateRange', 'moodAnalysis', 'thematicInsights', 'forwardGuidance']
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'Configuration Error: API_KEY is not set on the server.' });
    }

    try {
        const { userName, history } = req.body;

        const sanitizedHistory = history.map(h => ({
            date: h.date,
            mood: h.userInputs.mood,
            lunarMessage: 'lunarMessage' in h.reading ? h.reading.lunarMessage : undefined,
            deepDiveMessage: 'deepDiveMessage' in h.reading ? h.reading.deepDiveMessage : undefined,
            lunarSymbol: 'lunarSymbol' in h.reading ? h.reading.lunarSymbol.name : undefined,
        }));

        const prompt = `
You are MoonPath, a mystical, poetic, and modern spiritual guide.
Your task is to analyze a user's recent reading history to generate a "Weekly Lunar Evolution" report.
The report should be a cohesive, poetic summary of their emotional journey and recurring themes.
Synthesize the provided data; do not simply list the inputs.

- User Name: "${userName || 'the seeker'}"
- User's Recent History (JSON): ${JSON.stringify(sanitizedHistory, null, 2)}
        `;

        // FIX: Use the @google/genai SDK instead of a manual fetch call.
        const ai = new GoogleGenAI({ apiKey });

        const geminiResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: weeklyReportSchema,
            }
        });

        const jsonText = geminiResponse.text;
        if (!jsonText) {
            console.error('Could not extract JSON text from Gemini response:', JSON.stringify(geminiResponse));
            return res.status(500).json({ error: "Received an invalid format from the moon's weekly reflection." });
        }

        const parsedJson = JSON.parse(jsonText);

        res.status(200).json(parsedJson as WeeklyReport);

    } catch (error) {
        console.error("Error generating weekly report in serverless function:", error);
        const errorMessage = error instanceof Error ? error.message : "The moon's currents are unclear right now. A weekly reflection is not yet available.";
        res.status(500).json({ error: errorMessage });
    }
}
