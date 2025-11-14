import React, { useState, useEffect } from 'react';
import { Product } from '../data/products';
import { ExternalLinkIcon } from './icons/ExternalLinkIcon';
import { generateProductDescription } from '../services/geminiService';

interface AdvertisementProps {
    product: Product;
}

const DescriptionSkeleton: React.FC = () => (
    <div className="space-y-2">
        <div className="h-4 bg-cloud-gray/50 dark:bg-starlight-silver/20 rounded-full w-full"></div>
        <div className="h-4 bg-cloud-gray/50 dark:bg-starlight-silver/20 rounded-full w-3/4"></div>
    </div>
)


export const Advertisement: React.FC<AdvertisementProps> = ({ product }) => {
    const [description, setDescription] = useState(product.description);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDescription = async () => {
            setIsLoading(true);
            try {
                const newDescription = await generateProductDescription(product.name);
                setDescription(newDescription);
            } catch (error) {
                console.warn(`Could not generate new description for ${product.name}, using default.`);
                setDescription(product.description);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDescription();
    }, [product]);


    return (
        <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <div className="flex-grow">
                <h4 className="font-serif font-bold text-lg text-deep-sapphire dark:text-white">{product.name}</h4>
                <div className="text-sm text-deep-sapphire/80 dark:text-starlight-silver/80 mt-1 min-h-[40px]">
                    {isLoading ? <DescriptionSkeleton /> : <p>{description}</p>}
                </div>
            </div>
            <a
                href={product.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center bg-sunbeam-gold dark:bg-moonbeam-gold text-white dark:text-celestial-blue font-bold py-2 px-5 rounded-lg hover:bg-amber-600 dark:hover:bg-amber-300 transition-colors duration-300 shadow-lg shadow-sunbeam-gold/30 dark:shadow-moonbeam-gold/20 flex-shrink-0 mt-3 sm:mt-0"
            >
                Explore
                <ExternalLinkIcon className="w-4 h-4 ml-2" />
            </a>
        </div>
    );
};