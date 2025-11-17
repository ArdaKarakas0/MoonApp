
// FIX: Refactor to use the @google/genai SDK for API calls, following best practices.
import { GoogleGenAI, Type } from '@google/genai';

// Enums copied from `types.ts` to make this function self-contained
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

enum Plan {
    FREE = "Free",
    PLUS = "MoonPath Plus",
    PREMIUM = "MoonPath Premium",
}

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

const sponsoredProductsSchema = {
    type: Type.ARRAY,
    description: "A list of 3 thematically appropriate sponsored products.",
    items: {
        type: Type.OBJECT,
        properties: {
            name: { type: Type.STRING, description: "The name of the product." },
            description: { type: Type.STRING, description: "A short, poetic description of the product." },
            url: { type: Type.STRING, description: "A placeholder URL for the product, e.g., '#product-link'." }
        },
        required: ['name', 'description', 'url']
    }
};

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
    sponsoredProducts: sponsoredProductsSchema,
  },
  required: [ 'readingType', 'moonPhaseHeading', 'lunarAlignment', 'lunarMessage', 'lunarWarning', 'opportunityWindow', 'lunarSymbol', 'closingLine', 'sponsoredProducts' ],
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
        sponsoredProducts: sponsoredProductsSchema,
    },
    required: [ 'readingType', 'moonPhaseHeading', 'lunarAlignment', 'specialTheme', 'deepDiveMessage', 'ritualSuggestion', 'oracleInsight', 'closingLine', 'sponsoredProducts' ],
};

const createPrompt = (userName: string, userMood: string, moonPhase: MoonPhase, currentPlan: Plan, isSpecial: boolean): string => {
    const baseInstruction = `
You are MoonPath, a mystical, poetic, and modern spiritual guide. Generate a daily lunar guidance based on the user's state.
Your tone is calm, gentle, and psychologically aware. Avoid clichés, horoscopes, and mentioning you are an AI.
`;

    const productInstruction = `
As part of the JSON response, also generate a list of exactly 3 sponsored products that are thematically aligned with the reading's mood and message. These should be mystical, wellness, or self-care items (e.g., crystals, essential oils, guided journals, herbal teas, meditation apps).
For each product, provide a 'name', a short, poetic 'description', and a placeholder 'url' of '#product-link'. This list must be included in a 'sponsoredProducts' array.
`;

    if (isSpecial) {
        const theme = moonPhase === MoonPhase.FULL_MOON ? 'culmination, release, and gratitude' : 'intention, new beginnings, and potential';
        return `${baseInstruction}
Generate a special, deep, and ceremonial reading for a premium user under a ${moonPhase}.
Focus on themes of ${theme}.

${productInstruction}

USER DETAILS:
- Name: "${userName || 'the seeker'}"
- Mood: "${userMood}"
- Moon Phase: "${moonPhase}"
- Plan: "${currentPlan}"
`;
    }

    return `${baseInstruction}
Adjust the depth of the Lunar Message based on the user's subscription plan:
- Free: A standard, gentle message (2-3 paragraphs).
- MoonPath Plus: A deeper message with practical reflection (3 paragraphs).
- MoonPath Premium: The most profound and nuanced message (3-4 paragraphs).

${productInstruction}

USER DETAILS:
- Name: "${userName || 'the seeker'}"
- Mood: "${userMood}"
- Moon Phase: "${moonPhase}"
- Plan: "${currentPlan}"
`;
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
        const { userName, userMood, moonPhase, currentPlan } = req.body;

        const isSpecialReading = currentPlan === Plan.PREMIUM && (moonPhase === MoonPhase.FULL_MOON || moonPhase === MoonPhase.NEW_MOON);
        const schema = isSpecialReading ? specialReadingSchema : dailyReadingSchema;
        const prompt = createPrompt(userName, userMood, moonPhase, currentPlan, isSpecialReading);
        
        // FIX: Use the @google/genai SDK instead of a manual fetch call.
        const ai = new GoogleGenAI({ apiKey });

        const geminiResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
            }
        });

        const jsonText = geminiResponse.text;
        if (!jsonText) {
            console.error('Could not extract JSON text from Gemini response:', JSON.stringify(geminiResponse));
            return res.status(500).json({ error: "Received an invalid format from the moon's daily reading." });
        }

        const parsedJson = JSON.parse(jsonText);

        res.status(200).json(parsedJson);

    } catch (error) {
        console.error("Error generating daily reading in serverless function:", error);
        const errorMessage = error instanceof Error ? error.message : "The moon's message is veiled at the moment. Please try again later.";
        res.status(500).json({ error: errorMessage });
    }
}