
import React from 'react';
import { useGame } from '../GameContext.tsx';
import { useLanguage } from '../LanguageContext.tsx';
import { useSettings } from '../SettingsContext.tsx';
import { translations } from '../translations.ts';
import type { Scenario } from '../types.ts';
import { motion } from 'framer-motion';

type TranslationSet = typeof translations['en'];

const screenVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut", staggerChildren: 0.1 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3, ease: "easeIn" } }
} as const;

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
};

const scenarios: { key: Scenario; nameKey: keyof TranslationSet; isPremium: boolean; }[] = [
    { key: 'king', nameKey: 'scenario_king_name', isPremium: false },
    { key: 'church', nameKey: 'scenario_church_name', isPremium: false },
    { key: 'mages', nameKey: 'scenario_mages_name', isPremium: false },
    { key: 'ancestral', nameKey: 'scenario_ancestral_name', isPremium: false },
    { key: 'skyrim', nameKey: 'scenario_skyrim_name', isPremium: true },
    { key: 'mushoku_tensei', nameKey: 'scenario_mushoku_tensei_name', isPremium: true },
    { key: 're_zero', nameKey: 'scenario_re_zero_name', isPremium: true },
    { key: 'shield_hero', nameKey: 'scenario_shield_hero_name', isPremium: true },
];

const ScenarioSelectionScreen: React.FC = () => {
    const { language } = useLanguage();
    const { isPremium } = useSettings();
    const { selectScenario } = useGame();
    const t = translations[language];

    return (
        <motion.div 
            className="bg-gray-900 bg-opacity-80 backdrop-blur-md p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-2xl mx-auto"
            variants={screenVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
        >
            <h2 className="text-3xl font-bold font-serif text-center mb-6 text-amber-200">{t.scenario_selection_title}</h2>

            <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-4" variants={screenVariants}>
                {scenarios.map(scenario => {
                    const isDisabled = scenario.isPremium && !isPremium;
                    return (
                        <motion.button
                            key={scenario.key}
                            variants={itemVariants}
                            onClick={() => selectScenario(scenario.key)}
                            disabled={isDisabled}
                            className="relative text-left p-4 border-2 rounded-lg transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-opacity-50 disabled:opacity-60 disabled:cursor-not-allowed group
                                     border-gray-700 bg-gray-800/60 hover:border-amber-600 hover:bg-yellow-900/20 focus:ring-amber-500
                                     disabled:border-gray-700 disabled:bg-gray-800/40 disabled:hover:border-gray-700"
                        >
                            <h3 className="text-lg font-bold text-gray-100 group-hover:text-white transition-colors">{t[scenario.nameKey]}</h3>
                            {scenario.isPremium && (
                                <span className={`absolute top-2 right-2 px-2 py-0.5 text-xs font-bold rounded-full ${isPremium ? 'bg-amber-500 text-black' : 'bg-gray-600 text-gray-300'}`}>
                                    {t.premium_badge}
                                </span>
                            )}
                        </motion.button>
                    )
                })}
            </motion.div>
        </motion.div>
    );
};

export default ScenarioSelectionScreen;
