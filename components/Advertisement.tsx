import React from 'react';
import { Product } from '../data/products';
import { ExternalLinkIcon } from './icons/ExternalLinkIcon';

interface AdvertisementProps {
    product: Product;
}

export const Advertisement: React.FC<AdvertisementProps> = ({ product }) => {
    return (
        <div className="bg-white/20 dark:bg-midnight-purple/20 backdrop-blur-sm rounded-xl p-4 shadow-md shadow-gray-400/10 dark:shadow-glow-white/5 border border-cloud-gray/20 dark:border-starlight-silver/10 relative">
            <span className="absolute top-2 right-2 text-xs font-semibold uppercase text-deep-sapphire/50 dark:text-starlight-silver/50">Sponsored</span>
            <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                <div className="flex-grow">
                    <h4 className="font-serif font-bold text-lg text-deep-sapphire dark:text-white">{product.name}</h4>
                    <p className="text-sm text-deep-sapphire/80 dark:text-starlight-silver/80 mt-1">{product.description}</p>
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
        </div>
    );
};
