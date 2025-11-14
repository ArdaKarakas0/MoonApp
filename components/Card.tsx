import React from 'react';

export const Card: React.FC<{title: string; children: React.ReactNode; className?: string}> = ({ title, children, className }) => (
    <div className={`bg-white/30 dark:bg-midnight-purple/30 backdrop-blur-md rounded-xl p-6 shadow-lg shadow-gray-400/20 dark:shadow-glow-white border border-cloud-gray/30 dark:border-starlight-silver/10 ${className}`}>
        <h3 className="text-sm font-semibold tracking-widest uppercase text-sunbeam-gold dark:text-moonbeam-gold mb-3">{title}</h3>
        <div className="text-deep-sapphire/90 dark:text-starlight-silver/90 space-y-4">{children}</div>
    </div>
);