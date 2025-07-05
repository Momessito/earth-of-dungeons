
import React from 'react';
import { useLanguage } from '../LanguageContext.tsx';
import { useSettings } from '../SettingsContext.tsx';
import { translations, languageNames } from '../translations.ts';
import { Language, NarrativeMode } from '../types.ts';
import { motion } from 'framer-motion';

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
} as const;

const modalVariants = {
  hidden: { y: "50%", opacity: 0 },
  visible: { y: "0%", opacity: 1, transition: { type: "spring", stiffness: 300, damping: 30 } },
  exit: { y: "50%", opacity: 0 },
} as const;

const SettingsToggle: React.FC<{
    label: string;
    checked: boolean;
    onChange: () => void;
    disabled: boolean;
    id: string;
}> = ({ label, checked, onChange, disabled, id }) => (
    <label htmlFor={id} className="flex items-center justify-between cursor-pointer text-gray-300 w-full">
        <span className="font-semibold">{label}</span>
        <div className="relative">
            <input
                id={id}
                type="checkbox"
                className="sr-only"
                disabled={disabled}
                checked={checked}
                onChange={onChange}
            />
            <div className="block bg-gray-700 w-12 h-6 rounded-full"></div>
            <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${checked ? 'translate-x-6 bg-amber-400' : ''}`}></div>
        </div>
    </label>
);

interface SettingsModalProps {
    onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
    const { language, setLanguage } = useLanguage();
    const { narrativeMode, setNarrativeMode, imageGenerationEnabled, setImageGenerationEnabled, narrationEnabled, setNarrationEnabled, soundEnabled, setSoundEnabled } = useSettings();
    const t = translations[language];

    return (
        <motion.div
            className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={onClose}
        >
            <motion.div
                className="bg-gray-800 border-2 border-amber-500/50 p-6 rounded-xl shadow-2xl w-full max-w-md space-y-6"
                variants={modalVariants}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold font-serif text-amber-200">{t.settings_title}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl leading-none">&times;</button>
                </div>

                <div className="border-t border-gray-700 pt-4 space-y-4">
                     {/* Narrative Mode */}
                    <div>
                        <label className="font-semibold block mb-2 text-gray-300 text-left">{t.narrativeModeLabel}</label>
                        <div className="flex justify-center gap-2">
                            <button
                                onClick={() => setNarrativeMode('complete')}
                                className={`w-full px-4 py-2 rounded-md font-semibold transition-colors duration-300 ${narrativeMode === 'complete' ? 'bg-amber-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}`}
                            >
                                {t.narrativeModeComplete}
                            </button>
                            <button
                                onClick={() => setNarrativeMode('summary')}
                                className={`w-full px-4 py-2 rounded-md font-semibold transition-colors duration-300 ${narrativeMode === 'summary' ? 'bg-amber-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}`}
                            >
                                {t.narrativeModeSummary}
                            </button>
                        </div>
                    </div>

                    <SettingsToggle 
                        id="image-gen-toggle"
                        label={t.enableImageGeneration}
                        checked={imageGenerationEnabled}
                        onChange={() => setImageGenerationEnabled(!imageGenerationEnabled)}
                        disabled={false}
                    />
                    <SettingsToggle 
                        id="narration-toggle"
                        label={t.enableNarration}
                        checked={narrationEnabled}
                        onChange={() => setNarrationEnabled(!narrationEnabled)}
                        disabled={false}
                    />
                     <SettingsToggle 
                        id="sound-toggle"
                        label={t.enableSoundEffects}
                        checked={soundEnabled}
                        onChange={() => setSoundEnabled(!soundEnabled)}
                        disabled={false}
                    />
                </div>
                 {/* Language Selector */}
                <div className="border-t border-gray-700 pt-4">
                    <label className="font-semibold block mb-2 text-gray-300 text-left">{t.selectLanguage}</label>
                    <div className="flex justify-center items-center gap-2">
                        {(Object.keys(languageNames) as Language[]).map(lang => (
                        <button
                            key={lang}
                            onClick={() => setLanguage(lang)}
                            className={`w-full px-3 py-2 rounded-md font-semibold transition-colors duration-300 ${
                            language === lang 
                            ? 'bg-amber-600 text-white' 
                            : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                            }`}
                        >
                            {languageNames[lang]}
                        </button>
                        ))}
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default SettingsModal;