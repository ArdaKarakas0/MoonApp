import { GoogleGenAI, Type } from "@google/genai";
import { MoonPhase, DailyReading, Plan, HistoricReading, WeeklyReport, SpecialReading } from '../types';

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

====================================
3) WEEKLY_REPORT
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

// FIX: Switched from `import.meta.env.VITE_API_KEY` to `process.env.API_KEY` to get the API key.
// This resolves the TypeScript error and aligns with the coding guidelines.
const apiKey = process.env.API_KEY;

if (!apiKey) {
  // This error will be shown on the onboarding screen if the key is missing.
  throw new Error("API_KEY environment variable is not set. Please configure it in your deployment settings.");
}
const ai = new GoogleGenAI({ apiKey });


export const generateReading = async (userName: string, userMood: string, moonPhase: MoonPhase, currentPlan: Plan): Promise<DailyReading | SpecialReading> => {
  const isSpecialReading = currentPlan === Plan.PREMIUM && (moonPhase === MoonPhase.FULL_MOON || moonPhase === MoonPhase.NEW_MOON);
  const taskType = isSpecialReading ? 'special_reading' : 'daily_reading';
  const schema = isSpecialReading ? specialReadingSchema : dailyReadingSchema;

  const userPrompt = `
  ---
  INSTRUCTIONS FOR THIS SPECIFIC REQUEST:
  task_type: '${taskType}'
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
        responseSchema: schema,
      },
    });

    const jsonText = response.text.trim();
    const parsedJson = JSON.parse(jsonText);

    return parsedJson as DailyReading | SpecialReading;

  } catch (error) {
    console.error(`Error generating ${taskType}:`, error);
    throw new Error("The moon's message is veiled at the moment. Please try again later.");
  }
};

export const generateWeeklyReport = async (userName: string, history: HistoricReading[]): Promise<WeeklyReport> => {
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

    return parsedJson as WeeklyReport;

  } catch (error) {
    console.error("Error generating weekly report:", error);
    throw new Error("The moon's currents are unclear right now. A weekly reflection is not yet available.");
  }
};