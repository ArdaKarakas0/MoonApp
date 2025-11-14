import { GoogleGenAI, Type } from "@google/genai";
import { HistoricReading, WeeklyReport } from '../types';

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
}

const geminiPrompt = `
You are MoonPath, the content and logic engine for a mobile app that delivers daily lunar guidance and offers optional paid subscription plans. Your style is calm, mystical, poetic, and modern.

====================================
WEEKLY_REPORT
====================================

When task_type is 'weekly_report', generate a "Weekly Lunar Evolution" report.

Inputs:
- user_name (string, may be empty)
- recent_history (JSON array of the user's readings from the last 7 days)

Your Task:
Analyze the provided history to identify patterns and themes. Generate a cohesive, poetic summary.
- Do NOT simply list the inputs. Synthesize them.
- Focus on the emotional journey and recurring messages.
- Maintain the mystical, gentle, and modern MoonPath tone.

Use this structure:
1.  Date Range
2.  Mood Analysis ("The Echoes of Your Moods")
3.  Thematic Insights ("Themes That Shimmered")
4.  Forward Guidance ("Whispers for the Week Ahead")
`;

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
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    if (!process.env.API_KEY) {
        return res.status(500).json({ error: 'Configuration Error: API_KEY is not set on the server.' });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const { userName, history } = req.body;

    const sanitizedHistory = history.map(h => ({
        date: h.date,
        mood: h.userInputs.mood,
        lunarMessage: 'lunarMessage' in h.reading ? h.reading.lunarMessage : undefined,
        deepDiveMessage: 'deepDiveMessage' in h.reading ? h.reading.deepDiveMessage : undefined,
        lunarSymbol: 'lunarSymbol' in h.reading ? h.reading.lunarSymbol.name : undefined,
    }));

    const userPrompt = `
    ---
    INSTRUCTIONS FOR THIS SPECIFIC REQUEST:
    task_type: 'weekly_report'
    user_name: "${userName || 'the seeker'}"
    recent_history: ${JSON.stringify(sanitizedHistory, null, 2)}
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `${geminiPrompt}\n${userPrompt}`,
            config: {
                responseMimeType: "application/json",
                responseSchema: weeklyReportSchema,
            },
        });

        const jsonText = response.text.trim();
        const parsedJson = JSON.parse(jsonText);

        res.status(200).json(parsedJson as WeeklyReport);

    } catch (error) {
        console.error("Error generating weekly report in serverless function:", error);
        res.status(500).json({ error: "The moon's currents are unclear right now. A weekly reflection is not yet available." });
    }
}