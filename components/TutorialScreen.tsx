


import React from 'react';
import { useLanguage } from '../LanguageContext.tsx';
import { useGame } from '../GameContext.tsx';
import { translations } from '../translations.ts';
import { motion } from 'framer-motion';

const screenVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3, ease: "easeIn" } }
} as const;

const TutorialScreen: React.FC = () => {
    const { language } = useLanguage();
    const { endTutorial } = useGame();
    const t = translations[language];

    const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
        <div className="mb-6">
            <h3 className="text-xl font-bold text-amber-300 mb-2">{title}</h3>
            <div className="text-gray-300 text-base" dangerouslySetInnerHTML={{ __html: children as string }} />
        </div>
    );

    return (
        <motion.div 
            className="bg-gray-900 bg-opacity-80 backdrop-blur-md p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-2xl mx-auto"
            variants={screenVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
        >
            <h2 className="text-3xl font-bold font-serif text-center mb-6 text-amber-200">{t.tutorial_title}</h2>
            
            <div className="space-y-4">
                <Section title={t.tutorial_welcome_title}>{t.tutorial_welcome_desc}</Section>
                <Section title={t.tutorial_keywords_title}>{t.tutorial_keywords_desc}</Section>
                <Section title={t.tutorial_choices_title}>{t.tutorial_choices_desc}</Section>
                <Section title={t.tutorial_combat_title}>{t.tutorial_combat_desc}</Section>
                <Section title={t.tutorial_status_title}>{t.tutorial_status_desc}</Section>
            </div>

            <div className="text-center mt-8">
                 <button
                    onClick={endTutorial}
                    className="px-8 py-3 bg-red-800 text-white font-bold text-lg rounded-lg hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-500 focus:ring-opacity-50 transition-all duration-300 transform hover:scale-105"
                >
                    {t.tutorial_begin_adventure}
                </button>
            </div>
        </motion.div>
    );
}

export default TutorialScreen;