

import React, { useState, useEffect } from 'react';
import { SavedJourney } from '../types.ts';
import { useGame } from '../GameContext.tsx';
import { useLanguage } from '../LanguageContext.tsx';
import { translations } from '../translations.ts';
import * as journeyManager from '../services/journeyManager.ts';
import { motion, AnimatePresence } from 'framer-motion';

const screenVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut", staggerChildren: 0.1 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3, ease: "easeIn" } }
} as const;

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
};


const JourneyLibraryScreen: React.FC = () => {
    const [journeys, setJourneys] = useState<SavedJourney[]>([]);
    const [selectedJourney, setSelectedJourney] = useState<SavedJourney | null>(null);
    const { dispatch } = useGame();
    const { language } = useLanguage();
    const t = translations[language];

    useEffect(() => {
        setJourneys(journeyManager.getJourneys());
    }, []);

    const handleDelete = (journeyId: string) => {
        if (window.confirm(t.library_delete_confirm)) {
            journeyManager.deleteJourney(journeyId);
            setJourneys(journeys.filter(j => j.id !== journeyId));
            if (selectedJourney?.id === journeyId) {
                setSelectedJourney(null);
            }
        }
    };

    const handleExport = (journey: SavedJourney) => {
        const jsonString = JSON.stringify(journey, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `EOD_Journey_${journey.worldName.replace(/\s/g, '_')}_${journey.id}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
         <AnimatePresence mode="wait">
         {selectedJourney ? (
                <motion.div 
                    key="details"
                    className="bg-gray-900 bg-opacity-90 backdrop-blur-md p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-4xl mx-auto"
                    variants={screenVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                >
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold font-serif text-amber-200">{selectedJourney.worldName}</h2>
                         <button onClick={() => setSelectedJourney(null)} className="px-4 py-2 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors">
                            &larr; {t.library_back_to_menu}
                        </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div className="md:col-span-1 bg-gray-800/50 p-4 rounded-lg space-y-4">
                             <div>
                                <h3 className="font-semibold text-amber-300">{t.library_character}</h3>
                                <div className="flex items-center gap-3 mt-2">
                                    {selectedJourney.characterPortraitUrl && <img src={selectedJourney.characterPortraitUrl} alt="portrait" className="w-16 h-16 rounded-full border-2 border-amber-400 object-cover" />}
                                    <p className="text-sm text-gray-300">{selectedJourney.characterDescription}</p>
                                </div>
                            </div>
                            <div>
                                <h3 className="font-semibold text-amber-300">{t.run_summary.replace('{turns}', selectedJourney.finalStats.turns.toString()).replace('{difficulty}', selectedJourney.finalStats.difficulty.toString())}</h3>
                            </div>
                             <div>
                                <h3 className="font-semibold text-amber-300">{t.library_final_outcome}</h3>
                                <p className="text-sm text-gray-300 italic">"{selectedJourney.gameOverMessage}"</p>
                            </div>
                            <div className="pt-4 border-t border-gray-700">
                                 <button onClick={() => handleExport(selectedJourney)} className="w-full text-center px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors">
                                    {t.library_export_button}
                                </button>
                            </div>
                        </div>
                        <div className="md:col-span-2 bg-gray-800/50 p-4 rounded-lg">
                            <h3 className="font-semibold text-amber-300 mb-2">{t.library_story_log}</h3>
                            <div className="h-96 overflow-y-auto pr-2 space-y-4 font-serif text-gray-300 text-base leading-relaxed">
                                {selectedJourney.history.map((entry, index) => (
                                    <p key={index} className="pb-4 border-b border-gray-700/50 last:border-b-0">{entry}</p>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>
            ) : (
                <motion.div
                    key="list"
                    className="bg-gray-900 bg-opacity-80 backdrop-blur-sm p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-3xl mx-auto"
                    variants={screenVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                >
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-3xl font-bold font-serif text-amber-200">{t.library_title}</h2>
                        <button onClick={() => dispatch({ type: 'SET_STATUS', payload: 'start_menu' })} className="px-4 py-2 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors">
                            {t.library_back_to_menu}
                        </button>
                    </div>
                    {journeys.length === 0 ? (
                        <p className="text-center text-gray-400 py-8">{t.library_no_journeys}</p>
                    ) : (
                        <motion.div className="space-y-3" variants={screenVariants}>
                            <AnimatePresence>
                            {journeys.map(journey => (
                                <motion.div 
                                    key={journey.id}
                                    className="bg-gray-800/50 p-4 rounded-lg flex flex-col sm:flex-row justify-between items-center gap-4"
                                    variants={itemVariants}
                                    exit="exit"
                                    layout
                                >
                                    <div>
                                        <h3 className="text-lg font-bold text-amber-300">{journey.worldName}</h3>
                                        <p className="text-sm text-gray-400">{journey.date}</p>
                                        <p className="text-xs text-gray-500">
                                            {t.library_journey_turns}: {journey.finalStats.turns} | {t.library_journey_difficulty}: {journey.finalStats.difficulty}/10
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => setSelectedJourney(journey)} className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors">
                                            {t.library_view_button}
                                        </button>
                                        <button onClick={() => handleDelete(journey.id)} className="px-4 py-2 bg-red-800 text-white font-bold rounded-lg hover:bg-red-700 transition-colors">
                                            {t.library_delete_button}
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                            </AnimatePresence>
                        </motion.div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default JourneyLibraryScreen;