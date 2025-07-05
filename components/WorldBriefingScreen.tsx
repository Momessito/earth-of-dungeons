

import React from 'react';
import { useGame } from '../GameContext.tsx';
import { useLanguage } from '../LanguageContext.tsx';
import { translations } from '../translations.ts';
import LoadingSpinner from './LoadingSpinner.tsx';
import { motion } from 'framer-motion';

const screenVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.3, ease: "easeIn" } }
} as const;


const WorldBriefingScreen: React.FC = () => {
    const { state, dispatch } = useGame();
    const { storyNode, isLoading } = state;
    const { language } = useLanguage();
    const t = translations[language];

    if (isLoading || !storyNode) {
        return (
            <div className="flex flex-col items-center justify-center">
                <LoadingSpinner />
                <p className="text-gray-300 mt-4 text-lg">{t.summoningWorld}</p>
            </div>
        );
    }
    
    const { worldName, worldDifficulty } = storyNode;

    return (
        <motion.div 
            className="bg-gray-900 bg-opacity-80 backdrop-blur-sm p-8 rounded-xl shadow-2xl text-center flex flex-col items-center max-w-md mx-auto"
            variants={screenVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
        >
            <h1 className="text-3xl font-bold font-serif text-amber-300 mb-6">{t.briefing_title}</h1>
            
            <div className="space-y-4 mb-8 text-lg w-full">
                <div className="bg-gray-800/50 p-3 rounded-lg">
                    <h2 className="text-sm font-bold text-gray-400 tracking-widest uppercase">{t.briefing_world_name}</h2>
                    <p className="text-2xl text-white font-serif">{worldName || '???'}</p>
                </div>
                 <div className="bg-gray-800/50 p-3 rounded-lg">
                    <h2 className="text-sm font-bold text-gray-400 tracking-widest uppercase">{t.briefing_difficulty}</h2>
                    <p className="text-2xl font-mono" style={{color: `hsl(${(10 - (worldDifficulty || 5)) * 12}, 70%, 60%)`}}>
                        {worldDifficulty || '?'} / 10
                    </p>
                </div>
            </div>

            <button
                onClick={() => dispatch({ type: 'START_GAME' })}
                className="px-12 py-4 bg-red-800 text-white font-bold text-lg rounded-lg hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-500 focus:ring-opacity-50 transition-all duration-300 transform hover:scale-105"
            >
                {t.briefing_begin}
            </button>
        </motion.div>
    );
};

export default WorldBriefingScreen;