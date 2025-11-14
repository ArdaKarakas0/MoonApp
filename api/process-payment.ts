// This is a Vercel serverless function to simulate a payment gateway.

// In a real application, these would be managed securely, but for demonstration, they are here.
const testCards = {
  '4242424242424242': { valid: true, scenario: 'success' },
  '5555555555555555': { valid: true, scenario: 'success' },
  '4111111111111111': { valid: false, error: 'Your card was declined.' },
  '4012888818888':    { valid: false, error: 'Your card number is invalid.' },
  '5105105105105100': { valid: true, scenario: 'insufficient_funds', error: 'Your card has insufficient funds.' },
};

interface VercelRequest {
    method?: string;
    body: {
        cardNumber: string;
        expiry: string;
        cvc: string;
        plan: { name: string; price: string };
    };
}

interface VercelResponse {
    status: (statusCode: number) => VercelResponse;
    json: (body: any) => void;
    setHeader: (key: string, value: string) => void;
}

// A simple Luhn algorithm check for basic card number structure validity
const isValidLuhn = (value: string): boolean => {
    let nCheck = 0;
    let bEven = false;
    if (!value || typeof value !== 'string') return false;
    const sCardNum = value.replace(/\D/g, "");

    for (let n = sCardNum.length - 1; n >= 0; n--) {
        const cDigit = sCardNum.charAt(n);
        let nDigit = parseInt(cDigit, 10);
        if (bEven) {
            if ((nDigit *= 2) > 9) nDigit -= 9;
        }
        nCheck += nDigit;
        bEven = !bEven;
    }
    return (nCheck % 10) === 0;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { cardNumber, expiry, cvc } = req.body;

    // --- Basic Server-Side Validation ---
    if (!cardNumber || !expiry || !cvc) {
        return res.status(400).json({ error: 'Missing required payment fields.' });
    }

    if (!isValidLuhn(cardNumber)) {
        return res.status(400).json({ error: 'Your card number is invalid.' });
    }

    // --- Test Card Simulation Logic ---
    const cardData = testCards[cardNumber as keyof typeof testCards];
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (cardData) {
        // FIX: Use the 'in' operator as a type guard to correctly handle the union type of test card data.
        // This resolves TypeScript errors by checking for the 'error' property, which correctly distinguishes
        // success from failure cases in the test data.
        if ('error' in cardData) {
            return res.status(400).json({ error: cardData.error });
        } else {
            return res.status(200).json({ success: true, message: `Successfully subscribed to ${req.body.plan.name}.` });
        }
    }

    // Default response for any other card number
    return res.status(400).json({ error: 'This card is not supported for testing.' });
}
