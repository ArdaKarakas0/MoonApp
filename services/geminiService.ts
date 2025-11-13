
import { GoogleGenAI, Type } from "@google/genai";
import { MoonPhase, DailyReading, Plan } from '../types';

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

**Subscription Logic:**
- If the user's 'current_plan' is 'Free', provide a standard Lunar Message (2-3 paragraphs).
- If the user's 'current_plan' is 'MoonPath Plus', provide a slightly deeper Lunar Message (3 paragraphs) with a focus on practical application or a specific area of reflection.
- If the user's 'current_plan' is 'MoonPath Premium', provide the deepest, most detailed Lunar Message (3-4 paragraphs), offering more nuance and profound reflection.

Always:
- Write in English.
- Do NOT mention that you are an AI.
- Speak as the MoonPath experience itself.

====================================
1) DAILY_READING
====================================

When task_type is 'daily_reading', generate a full MoonPath reading.

Inputs:
- user_name (string, may be empty)
- user_mood (short phrase)
- moon_phase (New Moon, Waxing Crescent, First Quarter, Waxing Gibbous, Full Moon, Waning Gibbous, Last Quarter, Waning Crescent)
- current_plan (string, 'Free', 'MoonPath Plus', or 'MoonPath Premium')
- optional: local_time_window or other context

Use this structure:

1. Moon Phase Heading
   - 1–2 sentences about how this phase influences emotional or energetic flow today.

2. Lunar Alignment
   - Create a short, unique archetype name based on the user’s name + mood.
   - Examples (do not reuse too often): Silent Tide, Ember Wave, Hidden Eclipse, Moonborn Flame, Silver Drift, Eternal Wave, Whispered Glow, Shifting Lantern, Dawn Ember, Quiet Orbit.

3. Lunar Message
   - 2–3 paragraphs for Free users. 
   - 3 paragraphs for Plus users.
   - 3-4 paragraphs for Premium users.
   - Deep, symbolic, emotionally insightful.
   - Talk about inner state, subtle shifts, choices, relationships, intuition.
   - Provide reflection and gentle guidance, not strict predictions.

4. Lunar Warning
   - 1–2 sentences.
   - A subtle caution: what to be careful about, what type of reaction or impulse to avoid.

5. Opportunity Window
   - A 2–3 hour time range (e.g. “13:00–16:00”) representing a moment of clarity, emotional strength, or intuition.
   - If no time provided, invent a reasonable window.

6. Lunar Symbol of the Day
   - A symbolic motif (e.g., “The Briar Seed”, “The Whispered Mirror”, “The First Ripple”, “The Crowned Lantern”, “The Veiled Bridge”).
   - Explain its meaning in 1–2 lines.

7. Closing Line
   - One poetic sentence of lunar wisdom.
   - Do NOT reuse the exact same closing line every time.

Length: ~200–350 words for Free, ~250-400 for Plus, ~300-450 words for Premium.
`;

const dailyReadingSchema = {
  type: Type.OBJECT,
  properties: {
    moonPhaseHeading: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING, description: "The current moon phase, e.g., 'Full Moon'" },
        description: { type: Type.STRING, description: "1-2 sentences about this phase's influence." },
      },
      required: ['title', 'description'],
    },
    lunarAlignment: { type: Type.STRING, description: "A unique archetype name for the user based on their mood, e.g., 'Silent Tide'." },
    lunarMessage: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "2-4 paragraphs of deep, symbolic, and insightful guidance, adjusted for user's plan."
    },
    lunarWarning: { type: Type.STRING, description: "1-2 sentences of a subtle caution." },
    opportunityWindow: { type: Type.STRING, description: "A 2-3 hour time range, e.g., '13:00-16:00'." },
    lunarSymbol: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING, description: "A symbolic motif, e.g., 'The Veiled Bridge'." },
        meaning: { type: Type.STRING, description: "1-2 lines explaining the symbol's meaning." },
      },
      required: ['name', 'meaning'],
    },
    closingLine: { type: Type.STRING, description: "A final poetic sentence of lunar wisdom." },
  },
  required: [
    'moonPhaseHeading',
    'lunarAlignment',
    'lunarMessage',
    'lunarWarning',
    'opportunityWindow',
    'lunarSymbol',
    'closingLine',
  ],
};


export const generateDailyReading = async (userName: string, userMood: string, moonPhase: MoonPhase, currentPlan: Plan): Promise<DailyReading> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const userPrompt = `
  ---
  INSTRUCTIONS FOR THIS SPECIFIC REQUEST:
  task_type: 'daily_reading'
  user_name: "${userName || 'the seeker'}"
  user_mood: "${userMood}"
  moon_phase: "${moonPhase}"
  current_plan: "${currentPlan}"
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `${geminiPrompt}\n${userPrompt}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: dailyReadingSchema,
      },
    });

    const jsonText = response.text.trim();
    const parsedJson = JSON.parse(jsonText);

    return parsedJson as DailyReading;

  } catch (error) {
    console.error("Error generating daily reading:", error);
    throw new Error("The moon's message is veiled at the moment. Please try again later.");
  }
};