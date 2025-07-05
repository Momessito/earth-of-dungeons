import { Howl } from 'howler';

// Using free sounds from Pixabay
export const soundManifest = {
  click: 'https://cdn.pixabay.com/audio/2022/06/15/audio_17316a3c61.mp3', // UI Button Click
  purchase: 'https://cdn.pixabay.com/audio/2022/03/10/audio_2c274f4b09.mp3', // Cash register
  gameOver: 'https://cdn.pixabay.com/audio/2021/08/09/audio_2522a1b506.mp3', // Sad chime
  combatHit: 'https://cdn.pixabay.com/audio/2021/08/09/audio_5594b3a88c.mp3', // Sword slash
  save: 'https://cdn.pixabay.com/audio/2022/04/18/audio_0314a54992.mp3' // Pencil writing
};

export type SoundName = keyof typeof soundManifest;

const sounds: Partial<Record<SoundName, Howl>> = {};

// Preload sounds for better performance
try {
    (Object.keys(soundManifest) as SoundName[]).forEach(name => {
        sounds[name] = new Howl({
            src: [soundManifest[name]],
            volume: 0.3,
            // html5: true, // Removed to default to Web Audio API, resolving pool exhaustion issues.
        });
    });
} catch (error) {
    console.error("Error initializing Howler sounds:", error);
}


export const playSound = (name: SoundName) => {
    try {
        const sound = sounds[name];
        if (sound) {
            sound.play();
        } else {
            console.warn(`Sound "${name}" not found.`);
        }
    } catch (error) {
        console.error(`Error playing sound "${name}":`, error);
    }
};