import React, { useEffect } from 'react';
import { playBackgroundMusic, stopBackgroundMusic, MusicTrack } from '../utils/audioService';

// Generate stars with random properties for a more natural look
const stars = Array.from({ length: 50 }, (_, i) => ({
  id: i,
  // Random size between 1px and 3px
  size: Math.random() * 2 + 1, 
  // Random position across the screen
  top: `${Math.random() * 100}%`,
  left: `${Math.random() * 100}%`,
  // Random animation duration and delay to desynchronize the twinkling
  animationDuration: `${Math.random() * 1.5 + 0.5}s`,
  animationDelay: `${Math.random() * 1}s`,
}));

export const Loading: React.FC = () => {
    useEffect(() => {
        playBackgroundMusic(MusicTrack.SPIRITUAL_CHILL);
        // Cleanup function to stop music when the component unmounts
        return () => {
          stopBackgroundMusic();
        };
    }, []); // Empty dependency array ensures this runs only on mount and unmount

  return (
    <div className="fixed inset-0 bg-sky-blue/50 dark:bg-celestial-blue/50 backdrop-blur-sm flex flex-col items-center justify-center z-50 transition-opacity duration-300 overflow-hidden">
        {/* Starfield Background */}
        {stars.map(star => (
            <div
                key={star.id}
                className="absolute rounded-full bg-moonbeam-gold animate-twinkle"
                style={{
                    width: `${star.size}px`,
                    height: `${star.size}px`,
                    top: star.top,
                    left: star.left,
                    animationDuration: star.animationDuration,
                    animationDelay: star.animationDelay,
                    opacity: 0, // Start invisible, animation will fade it in
                }}
            />
        ))}

        {/* Central Content */}
        <div className="relative z-10 flex flex-col items-center justify-center">
            {/* Moon Phase Animator */}
            <div className="w-24 h-24 relative rounded-full overflow-hidden shadow-2xl shadow-black/30">
                {/* The glowing, color-changing moon */}
                <div className="w-full h-full rounded-full bg-moonbeam-gold animate-moon-glow"></div>
                {/* The shadow that moves across */}
                <div className="absolute top-0 left-0 w-full h-full rounded-full bg-sky-blue dark:bg-celestial-blue animate-moon-cycle"></div>
            </div>
            
            <p className="mt-6 text-lg font-serif tracking-wider text-moonbeam-gold animate-fade-in">
                The moon is listening...
            </p>
        </div>
    </div>
  );
};