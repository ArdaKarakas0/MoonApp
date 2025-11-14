import { MoonPhase, Plan, DailyReading, SpecialReading } from '../types';

// This is a Vercel serverless function. We'll define simple interfaces for what we expect.
interface VercelRequest {
    method?: string;
    body: {
        userName: string;
        userMood: string;
        moonPhase: MoonPhase;
        currentPlan: Plan;
    };
}

interface VercelResponse {
    status: (statusCode: number) => VercelResponse;
    json: (body: any) => void;
    setHeader: (key: string, value: string) => void;
}

// Re-implement the Type enum as it's not available in the serverless environment from the SDK
const Type = {
    OBJECT: 'OBJECT',
    STRING: 'STRING',
    ARRAY: 'ARRAY',
};

const geminiPrompt = `
You are MoonPath, the content and logic engine for a mobile app that delivers daily lunar guidance and offers optional paid subscription plans.

The app’s core concept:
- The moon’s current phase influences emotional energy, intuition, and subtle life flow.
- Each user has a “Lunar Alignment” that changes with their mood and the moon.
- MoonPath gives poetic, mystical, gentle guidance. It is spiritual but modern and psychologically aware.

Your style:
- Calm, mystical, poetic, modern.
- Gentle and wise, never harsh or judgmental.
- Symbolic and metaphorical, but still understandable.
- NOT cliché, NOT generic horoscope talk.
- No zodiac signs, no planets except the moon, no medical/financial/legal advice.

Always:
- Write in English.
- Do NOT mention that you are an AI.
- Speak as the MoonPath experience itself.

====================================
1) DAILY_READING
====================================

When task_type is 'daily_reading', generate a standard MoonPath reading.

**Subscription Logic:**
- If the user's 'current_plan' is 'Free', provide a standard Lunar Message (2-3 paragraphs).
- If the user's 'current_plan' is 'MoonPath Plus', provide a slightly deeper Lunar Message (3 paragraphs) with a focus on practical application or a specific area of reflection.
- If the user's 'current_plan' is 'MoonPath Premium' (and it's NOT a Full/New Moon), provide the deepest, most detailed Lunar Message (3-4 paragraphs), offering more nuance and profound reflection.

Use this structure for Daily Readings:
1.  **readingType**: Must be "daily".
2.  **Moon Phase Heading**: 1–2 sentences about the phase's influence.
3.  **Lunar Alignment**: A unique archetype name based on user's name + mood (e.g., Silent Tide, Ember Wave).
4.  **Lunar Message**: 2–4 paragraphs of symbolic guidance, adjusted for the user's plan.
5.  **Lunar Warning**: 1–2 sentences of subtle caution.
6.  **Opportunity Window**: A 2–3 hour time range (e.g., “13:00–16:00”).
7.  **Lunar Symbol of the Day**: A symbolic motif with a 1-2 line meaning.
8.  **Closing Line**: A final poetic sentence.

====================================
2) SPECIAL_READING (PREMIUM ONLY)
====================================

When task_type is 'special_reading', generate a special, more detailed reading. This is ONLY for Premium users during a Full Moon or New Moon.

Your Task:
- Create a much deeper, more reflective, and ceremonial reading.
- For Full Moons, focus on themes of culmination, release, gratitude, and illumination.
- For New Moons, focus on themes of intention, new beginnings, potential, and planting seeds.

Use this structure for Special Readings:
1.  **readingType**: Must be "special".
2.  **Moon Phase Heading**: As above, but with more gravitas.
3.  **Lunar Alignment**: As above.
4.  **Special Theme**: A powerful theme for the reading. (e.g., "The Tide of Culmination" for Full Moon, "The Seed of Intention" for New Moon).
5.  **Deep Dive Message**: 3-4 paragraphs of profound, detailed guidance related to the special theme. Go deeper than a normal Lunar Message.
6.  **Ritual Suggestion**: A simple, mindful activity the user can do. (e.g., a short meditation, a journaling prompt, a moment of reflection).
7.  **Oracle Insight**: A direct, potent piece of wisdom or a question for contemplation.
8.  **Closing Line**: A particularly powerful and memorable closing sentence.
`;

const dailyReadingSchema = {
  type: Type.OBJECT,
  properties: {
    readingType: { type: Type.STRING, enum: ['daily'] },
    moonPhaseHeading: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING }, description: { type: Type.STRING },
      }, required: ['title', 'description'],
    },
    lunarAlignment: { type: Type.STRING },
    lunarMessage: { type: Type.ARRAY, items: { type: Type.STRING } },
    lunarWarning: { type: Type.STRING },
    opportunityWindow: { type: Type.STRING },
    lunarSymbol: {
      type: Type.OBJECT,
      properties: { name: { type: Type.STRING }, meaning: { type: Type.STRING },
      }, required: ['name', 'meaning'],
    },
    closingLine: { type: Type.STRING },
  },
  required: [ 'readingType', 'moonPhaseHeading', 'lunarAlignment', 'lunarMessage', 'lunarWarning', 'opportunityWindow', 'lunarSymbol', 'closingLine' ],
};

const specialReadingSchema = {
    type: Type.OBJECT,
    properties: {
        readingType: { type: Type.STRING, enum: ['special'] },
        moonPhaseHeading: {
            type: Type.OBJECT,
            properties: { title: { type: Type.STRING }, description: { type: Type.STRING } },
            required: ['title', 'description'],
        },
        lunarAlignment: { type: Type.STRING },
        specialTheme: { type: Type.STRING, description: "A powerful theme for the reading, e.g., 'The Tide of Culmination'." },
        deepDiveMessage: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3-4 paragraphs of profound guidance." },
        ritualSuggestion: {
            type: Type.OBJECT,
            properties: { title: { type: Type.STRING }, description: { type: Type.STRING } },
            required: ['title', 'description'],
            description: "A simple, mindful ritual or meditation prompt."
        },
        oracleInsight: {
            type: Type.OBJECT,
            properties: { title: { type: Type.STRING }, description: { type: Type.STRING } },
            required: ['title', 'description'],
            description: "A direct, potent piece of wisdom or a question."
        },
        closingLine: { type: Type.STRING },
    },
    required: [ 'readingType', 'moonPhaseHeading', 'lunarAlignment', 'specialTheme', 'deepDiveMessage', 'ritualSuggestion', 'oracleInsight', 'closingLine' ],
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
    
    const { userName, userMood, moonPhase, currentPlan } = req.body;

    const isSpecialReading = currentPlan === Plan.PREMIUM && (moonPhase === MoonPhase.FULL_MOON || moonPhase === MoonPhase.NEW_MOON);
    const taskType = isSpecialReading ? 'special_reading' : 'daily_reading';
    const schema = isSpecialReading ? specialReadingSchema : dailyReadingSchema;

    const userPrompt = `
    INSTRUCTIONS FOR THIS SPECIFIC REQUEST:
    task_type: '${taskType}'
    user_name: "${userName || 'the seeker'}"
    user_mood: "${userMood}"
    moon_phase: "${moonPhase}"
    current_plan: "${currentPlan}"
    `;
    
    const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    try {
        const geminiResponse = await fetch(GEMINI_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                system_instruction: {
                    parts: [{ text: geminiPrompt }]
                },
                contents: [{
                    parts: [{ text: userPrompt }]
                }],
                generation_config: {
                    response_mime_type: "application/json",
                    response_schema: schema,
                }
            })
        });

        const geminiData = await geminiResponse.json();

        if (!geminiResponse.ok || !geminiData.candidates) {
            console.error('Error from Gemini API:', geminiData.error ? JSON.stringify(geminiData.error) : 'No candidates in response');
            const errorMessage = geminiData.error?.message || "The moon's message is veiled at the moment.";
            return res.status(500).json({ error: errorMessage });
        }

        const jsonText = geminiData.candidates[0]?.content?.parts[0]?.text;
        if (!jsonText) {
             console.error('Could not extract JSON text from Gemini response:', JSON.stringify(geminiData));
             return res.status(500).json({ error: "Received an invalid format from the moon's whisper." });
        }
        
        const parsedJson = JSON.parse(jsonText);

        res.status(200).json(parsedJson as DailyReading | SpecialReading);

    } catch (error) {
        console.error(`Error in serverless function for ${taskType}:`, error);
        res.status(500).json({ error: "The moon's message is veiled at the moment. Please try again later." });
    }
}