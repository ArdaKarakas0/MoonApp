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
        description: 'A breathtakingly beautiful tarot deck and guidebook for self-discovery, inspired by the animal kingdom.',
        url: 'https://amzn.to/4rmgVhl',
        imageUrl: 'https://placehold.co/200x200/1a2a6c/d1d5db/png?text=Tarot+Deck',
    },
    {
        name: 'Full Moon Ritual Bath Soak',
        description: 'Cleanse your energy with this handcrafted blend of Epsom salts, dried lavender, and essential oils.',
        url: 'https://amzn.to/3K3SELY',
        imageUrl: 'https://placehold.co/200x200/2e1a47/fde68a/png?text=Bath+Soak',
    },
    {
        name: 'Celestial Moon Phase Journal',
        description: 'A hardcover journal with moon phase guides, astrological insights, and space for your intentions.',
        url: 'https://amzn.to/3VdE6fG',
        imageUrl: 'https://placehold.co/200x200/1a2a6c/d1d5db/png?text=Journal',
    },
    {
        name: 'Cosmic Energy Crystal Set',
        description: 'A curated starter set of high-vibration crystals including Amethyst, Rose Quartz, and Clear Quartz.',
        url: 'https://amzn.to/47YtOFg',
        imageUrl: 'https://placehold.co/200x200/2e1a47/fde68a/png?text=Crystals',
    },
    {
        name: 'Stardust Oracle Deck',
        description: 'An intuitive 53-card oracle deck that connects you to the messages of the stars and the universe.',
        url: 'https://amzn.to/3X1mUdh',
        imageUrl: 'https://placehold.co/200x200/1a2a6c/d1d5db/png?text=Oracle+Deck',
    },
    {
        name: 'Moon Goddess Intention Candle',
        description: 'A hand-poured soy wax candle infused with lavender and a moonstone crystal to enhance meditation.',
        url: 'https://amzn.to/4oPCtkA',
        imageUrl: 'https://placehold.co/200x200/2e1a47/fde68a/png?text=Candle',
    },
    {
        name: 'Sacred Sage Cleansing Wand',
        description: 'Purify your sacred space and banish negative energy with this ethically sourced California White Sage.',
        url: 'https://amzn.to/47NiRHK',
        imageUrl: 'https://placehold.co/200x200/1a2a6c/d1d5db/png?text=Sage',
    },
    {
        name: 'Moonology Oracle Cards',
        description: 'A powerful deck by Yasmin Boland to work with the moon\'s power and gain clarity on your life.',
        url: 'https://amzn.to/3K3TtEy',
        imageUrl: 'https://placehold.co/200x200/2e1a47/fde68a/png?text=Moonology+Deck',
    },
    {
        name: 'Tibetan Singing Bowl Set',
        description: 'This handcrafted singing bowl creates resonant, healing sounds for meditation and mindfulness.',
        url: 'https://amzn.to/3X0pVdW',
        imageUrl: 'https://placehold.co/200x200/1a2a6c/d1d5db/png?text=Singing+Bowl',
    },
];


const sponsoredProductSchema = {
    type: Type.OBJECT,
    properties: {
        marketingName: { 
            type: Type.STRING,
            description: "A mystical, intriguing name for the product, not its real name." 
        },
        marketingDescription: { 
            type: Type.STRING,
            description: "A curious description hinting at the product's purpose without revealing it."
        },
        url: { 
            type: Type.STRING,
            description: "The original URL of the selected product."
        },
    },
    required: ['marketingName', 'marketingDescription', 'url'],
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
        description: "An array of exactly 3 relevant sponsored products, each with a creative marketing name and description, selected from the provided list."
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
            description: "An array of exactly 3 relevant sponsored products, each with a creative marketing name and description, selected from the provided list."
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
From the list of available products below, select exactly 3 that are most thematically relevant to the reading you generate.
For each selected product, you MUST NOT use its real name or description. Instead, invent a new, mystical, and intriguing 'marketingName' and 'marketingDescription' that hints at the product's purpose without revealing what it is, creating a sense of a 'surprise gift'. The goal is to make the user curious.
For example, for a tarot deck, you could generate a marketingName like 'Whispers of Destiny' and a description like 'Unlock the secrets coded in the stars and embrace the path meant for you.'
Ensure you use the original 'url' from the selected product in your response.

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