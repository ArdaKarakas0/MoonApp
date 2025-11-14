export interface Product {
    id: number;
    name: string;
    description: string;
    url: string;
}

export const products: Product[] = [
    {
        id: 1,
        name: 'Full Moon Crystal Singing Bowl Set',
        description: 'Enhance your meditation and sound healing practices with this beautiful, resonant crystal singing bowl.',
        url: 'https://amzn.to/4i0jsJH',
    },
    {
        id: 2,
        name: 'Spiritual Cleansing Smudge Kit',
        description: 'A complete set for cleansing your space, featuring sage, palo santo, and a beautiful abalone shell.',
        url: 'https://amzn.to/3WS8RXw',
    },
    {
        id: 3,
        name: 'Moon Phase Wall Hanging',
        description: 'Bring the magic of the lunar cycle into your home with this elegant, handcrafted wall decor.',
        url: 'https://amzn.to/3LJ6fZy',
    },
    {
        id: 4,
        name: 'The Moon Oracle Deck',
        description: 'A stunning 44-card oracle deck to connect with the moon\'s wisdom and receive intuitive guidance.',
        url: 'https://amzn.to/4nTMQSY',
    },
    {
        id: 5,
        name: 'Natural Himalayan Salt Lamp',
        description: 'Create a calming, warm ambiance in any room with the soothing glow of a natural salt lamp.',
        url: 'https://amzn.to/43Rf8qr',
    },
    {
        id: 6,
        name: 'Zodiac Constellation Necklace',
        description: 'A delicate and personal piece of jewelry celebrating your astrological sign and connection to the stars.',
        url: 'https://amzn.to/4nXR2l0',
    },
];
