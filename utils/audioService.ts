
const AUDIO_MUTED_KEY = 'moonpath_audio_muted';

let isMuted = false;
try {
  // Check if localStorage is available before using it
  if (typeof window !== 'undefined' && window.localStorage) {
    isMuted = localStorage.getItem(AUDIO_MUTED_KEY) === 'true';
  }
} catch (e) {
  console.warn("Could not access localStorage to get audio muted state.");
}

const audioCache: { [key: string]: HTMLAudioElement } = {};

/**
 * Defines the sound effects used in the application.
 * These files would need to be placed in the /public/sounds/ directory.
 */
export enum SoundEffect {
    REVEAL = '/sounds/reveal.mp3', // A magical shimmer
    SWOOSH_FORWARD = '/sounds/swoosh-forward.mp3', // A gentle forward whoosh
    SWOOSH_BACK = '/sounds/swoosh-back.mp3', // A gentle backward whoosh
    SAVE = '/sounds/save.mp3', // A satisfying, soft confirmation sound
    CLICK = '/sounds/click.mp3', // A subtle, clean tap for buttons
    CHIME = '/sounds/chime.mp3', // A gentle notification chime
}

const preloadSounds = (soundUrls: string[]) => {
    soundUrls.forEach(url => {
        if (!audioCache[url]) {
            const audio = new Audio(url);
            audio.preload = 'auto';
            audioCache[url] = audio;
        }
    });
};

// We can call this early in the app lifecycle, e.g., in App.tsx
export const initializeAudio = () => {
    preloadSounds(Object.values(SoundEffect));
}

export const playSound = (soundUrl: string, volume: number = 0.5) => {
    if (isMuted) return;

    try {
        const audio = audioCache[soundUrl];
        if (!audio) {
            console.warn(`Sound not preloaded: ${soundUrl}. Cannot play.`);
            return;
        }

        // To allow rapid playback, we clone the audio node.
        const audioInstance = audio.cloneNode() as HTMLAudioElement;
        audioInstance.volume = volume;
        audioInstance.play().catch(error => {
            // This can happen if the user hasn't interacted with the page yet.
            // We can largely ignore this for subtle UI sounds.
        });
    } catch (e) {
        console.error("Error playing sound:", e);
    }
};

export const toggleMute = (): boolean => {
    isMuted = !isMuted;
    try {
        if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.setItem(AUDIO_MUTED_KEY, String(isMuted));
        }
    } catch (e) {
        console.warn("Could not access localStorage to set audio muted state.");
    }
    return isMuted;
};

export const getIsMuted = (): boolean => {
    return isMuted;
};
