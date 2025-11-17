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

const allSponsoredProducts = [
    {
        name: 'The Wild Unknown Tarot Deck',
        description: 'A breathtakingly beautiful tarot deck and guidebook for self-discovery, inspired by the animal kingdom and the mysteries of the natural world.',
        url: 'https://amzn.to/4rmgVhl',
    },
    {
        name: 'Full Moon Ritual Bath Soak',
        description: 'Cleanse your energy with this handcrafted blend of Epsom salts, Himalayan pink salt, dried lavender, and essential oils, designed for full moon rituals.',
        url: 'https://amzn.to/3K3SELY',
    },
    {
        name: 'Celestial Moon Phase Journal',
        description: 'A beautifully designed hardcover journal with moon phase guides, astrological insights, and ample space for your intentions, reflections, and dreams.',
        url: 'https://amzn.to/3VdE6fG',
    },
    {
        name: 'Cosmic Energy Crystal Set',
        description: 'A curated starter set of high-vibration crystals including Amethyst, Rose Quartz, and Clear Quartz to amplify intentions and align your spirit.',
        url: 'https://amzn.to/47YtOFg',
    },
    {
        name: 'Stardust Oracle Deck',
        description: 'A whimsical and intuitive 53-card oracle deck that connects you to the messages of the stars, cosmos, and the mysteries of the universe.',
        url: 'https://amzn.to/3X1mUdh',
    },
    {
        name: 'Moon Goddess Intention Candle',
        description: 'A hand-poured soy wax candle infused with lavender, chamomile, and a moonstone crystal to enhance your meditation and manifestation rituals.',
        url: 'https://amzn.to/4oPCtkA',
    },
    {
        name: 'Sacred Sage Cleansing Wand',
        description: 'Purify your sacred space, banish negative energy, and invite tranquility with this ethically sourced California White Sage smudge stick.',
        url: 'https://amzn.to/47NiRHK',
    },
    {
        name: 'Moonology: Working with the Magic of Lunar Cycles',
        description: 'A bestselling book by Yasmin Boland that serves as an essential guide to understanding the moon\'s phases and using them to create a magical life.',
        url: 'https://amzn.to/3K3TtEy',
    },
    {
        name: 'Tibetan Singing Bowl Set',
        description: 'This handcrafted singing bowl creates resonant, healing sounds for meditation, mindfulness, and chakra balancing. Includes cushion and mallet.',
        url: 'https://amzn.to/3X0pVdW',
    },
];

const sponsoredProductSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING },
        description: { type: Type.STRING },
        url: { type: Type.STRING },
    },
    required: ['name', 'description', 'url'],
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
    sponsoredProducts: {
        type: Type.ARRAY,
        items: sponsoredProductSchema,
        description: "An array of exactly 3 relevant sponsored products selected from the provided list."
    },
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
        sponsoredProducts: {
            type: Type.ARRAY,
            items: sponsoredProductSchema,
            description: "An array of exactly 3 relevant sponsored products selected from the provided list."
        },
    },
    required: [ 'readingType', 'moonPhaseHeading', 'lunarAlignment', 'specialTheme', 'deepDiveMessage', 'ritualSuggestion', 'oracleInsight', 'closingLine', 'sponsoredProducts' ],
};

const createPrompt = (userName: string, userMood: string, moonPhase: MoonPhase, currentPlan: Plan, isSpecial: boolean): string => {
    const baseInstruction = `
You are MoonPath, a mystical, poetic, and modern spiritual guide. Generate a daily lunar guidance based on the user's state.
Your tone is calm, gentle, and psychologically aware. Avoid clichés, horoscopes, and mentioning you are an AI.
`;

    const productInstruction = `
From the list of available products below, select exactly 3 that are most thematically relevant to the reading you generate and include them in the 'sponsoredProducts' field of your response.

AVAILABLE PRODUCTS:
${JSON.stringify(allSponsoredProducts, null, 2)}
`;

    if (isSpecial) {
        const theme = moonPhase === MoonPhase.FULL_MOON ? 'culmination, release, and gratitude' : 'intention, new beginnings, and potential';
        return `${baseInstruction}
Generate a special, deep, and ceremonial reading for a premium user under a ${moonPhase}.
Focus on themes of ${theme}.

USER DETAILS:
- Name: "${userName || 'the seeker'}"
- Mood: "${userMood}"
- Moon Phase: "${moonPhase}"
- Plan: "${currentPlan}"

${productInstruction}
`;
    }

    return `${baseInstruction}
Adjust the depth of the Lunar Message based on the user's subscription plan:
- Free: A standard, gentle message (2-3 paragraphs).
- MoonPath Plus: A deeper message with practical reflection (3 paragraphs).
- MoonPath Premium: The most profound and nuanced message (3-4 paragraphs).

USER DETAILS:
- Name: "${userName || 'the seeker'}"
- Mood: "${userMood}"
- Moon Phase: "${moonPhase}"
- Plan: "${currentPlan}"

${productInstruction}
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