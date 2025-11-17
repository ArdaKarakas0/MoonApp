const AUDIO_MUTED_KEY = 'moonpath_audio_muted';

// --- State ---
let audioContext: AudioContext | null = null;
let isMuted = false;
let isInitialized = false;

/**
 * Defines the types of synthetic sound effects used in the application.
 */
export enum SoundEffect {
    REVEAL,
    SWOOSH_FORWARD,
    SWOOSH_BACK,
    SAVE,
    CLICK,
    CHIME,
}

// We can call this early in the app lifecycle, e.g., in App.tsx
export const initializeAudio = () => {
    if (isInitialized || typeof window === 'undefined') {
        return;
    }

    try {
        isMuted = getIsMuted(); // Sync mute state on init
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
        // Resume context on first user interaction, which is required by modern browsers.
        const resumeContext = async () => {
            if (audioContext?.state === 'suspended') {
                await audioContext.resume();
            }
            // Remove listeners after first interaction
            document.removeEventListener('click', resumeContext);
            document.removeEventListener('touchstart', resumeContext);
            document.removeEventListener('keydown', resumeContext);
        };
        document.addEventListener('click', resumeContext);
        document.addEventListener('touchstart', resumeContext);
        document.addEventListener('keydown', resumeContext);
        
        isInitialized = true;
    } catch (e) {
        console.error("Failed to initialize audio service:", e);
    }
};

/**
 * Generates and plays a synthetic sound effect.
 * This removes the need for external .mp3 files and avoids 404 errors.
 */
export const playSound = (sound: SoundEffect, volume: number = 0.5) => {
    if (getIsMuted() || !audioContext) return;
    
    // Ensure context is running (it might have been suspended again by the browser)
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
    
    const now = audioContext.currentTime;
    const gainNode = audioContext.createGain();
    gainNode.connect(audioContext.destination);
    gainNode.gain.setValueAtTime(0, now); // Start silent

    try {
        switch (sound) {
            case SoundEffect.CLICK: {
                const osc = audioContext.createOscillator();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(880, now);
                osc.connect(gainNode);
                gainNode.gain.linearRampToValueAtTime(volume * 0.8, now + 0.01);
                gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);
                osc.start(now);
                osc.stop(now + 0.1);
                break;
            }
            
            case SoundEffect.SAVE: {
                const osc = audioContext.createOscillator();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(523.25, now); // C5
                osc.frequency.linearRampToValueAtTime(659.25, now + 0.1); // E5
                osc.connect(gainNode);
                gainNode.gain.linearRampToValueAtTime(volume * 0.6, now + 0.01);
                gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
                osc.start(now);
                osc.stop(now + 0.2);
                break;
            }

            case SoundEffect.REVEAL:
            case SoundEffect.CHIME: {
                 const osc1 = audioContext.createOscillator();
                 const osc2 = audioContext.createOscillator();
                 osc1.type = 'sine';
                 osc2.type = 'sine';
                 osc1.frequency.setValueAtTime(987.77, now); // B5
                 osc2.frequency.setValueAtTime(1318.51, now); // E6
                 osc1.connect(gainNode);
                 osc2.connect(gainNode);
                 gainNode.gain.linearRampToValueAtTime(volume * 0.5, now + 0.05);
                 gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 1.5);
                 osc1.start(now);
                 osc2.start(now);
                 osc1.stop(now + 1.5);
                 osc2.stop(now + 1.5);
                break;
            }

            case SoundEffect.SWOOSH_FORWARD:
            case SoundEffect.SWOOSH_BACK: {
                const bufferSize = audioContext.sampleRate * 0.3; // 0.3 second swoosh
                const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
                const output = buffer.getChannelData(0);

                for (let i = 0; i < bufferSize; i++) {
                    output[i] = Math.random() * 2 - 1;
                }

                const noise = audioContext.createBufferSource();
                noise.buffer = buffer;

                const filter = audioContext.createBiquadFilter();
                filter.type = 'bandpass';
                filter.Q.value = 10;
                
                const startFreq = sound === SoundEffect.SWOOSH_FORWARD ? 400 : 2000;
                const endFreq = sound === SoundEffect.SWOOSH_FORWARD ? 2000 : 400;

                filter.frequency.setValueAtTime(startFreq, now);
                filter.frequency.exponentialRampToValueAtTime(endFreq, now + 0.25);
                
                noise.connect(filter);
                filter.connect(gainNode);

                gainNode.gain.linearRampToValueAtTime(volume * 0.4, now + 0.05);
                gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
                
                noise.start(now);
                noise.stop(now + 0.3);
                break;
            }
        }
    } catch (e) {
        console.error(`Error playing sound effect: ${SoundEffect[sound]}`, e);
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
    try {
        if (typeof window !== 'undefined' && window.localStorage) {
            const storedMute = localStorage.getItem(AUDIO_MUTED_KEY) === 'true';
            isMuted = storedMute; // Keep internal state in sync
            return storedMute;
        }
    } catch(e) {
        console.warn("Could not access localStorage to get audio muted state.");
    }
    // Return the in-memory state if localStorage fails
    return isMuted;
};
