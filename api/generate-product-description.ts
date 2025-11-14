import { GoogleGenAI } from '@google/genai';

interface VercelRequest {
    method?: string;
    body: {
        productName: string;
    };
}

interface VercelResponse {
    status: (statusCode: number) => VercelResponse;
    json: (body: any) => void;
    setHeader: (key: string, value: string) => void;
}

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
        const { productName } = req.body;

        if (!productName) {
            return res.status(400).json({ error: 'productName is required.' });
        }

        const prompt = `
            You are a mystical copywriter for a spiritual guidance app called MoonPath.
            Your task is to write a short, poetic, and enchanting description for a product.
            The description should be around 15-25 words.
            It must connect the product to themes of spirituality, lunar energy, self-care, or introspection.
            Do not mention the product name in the description.
            Respond with only the description text, nothing else.

            Product Name: "${productName}"
        `;
        
        const ai = new GoogleGenAI({ apiKey });

        const geminiResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });

        const description = geminiResponse.text;
        if (!description) {
            console.error('Could not extract text from Gemini response:', JSON.stringify(geminiResponse));
            return res.status(500).json({ error: "Received an invalid format from the creative source." });
        }

        res.status(200).json({ description: description.trim() });

    } catch (error) {
        console.error("Error generating product description:", error);
        const errorMessage = error instanceof Error ? error.message : "The product's essence is currently veiled.";
        res.status(500).json({ error: errorMessage });
    }
}
