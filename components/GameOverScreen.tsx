


import React, { useState, useMemo } from 'react';
import { useLanguage } from '../LanguageContext.tsx';
import { useGame } from '../GameContext.tsx';
import { translations } from '../translations.ts';

interface GameOverScreenProps {
  message: string;
}

const GameOverScreen: React.FC<GameOverScreenProps> = ({ message }) => {
  const { language } = useLanguage();
  const { state, dispatch, saveCompletedJourneyToLibrary } = useGame();
  const { lastRunStats, currency, completedJourney } = state;
  const t = translations[language];

  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    if (saveCompletedJourneyToLibrary()) {
        setIsSaved(true);
    }
  }

  return (
    <div className="bg-gray-900 bg-opacity-80 backdrop-blur-sm p-8 rounded-xl shadow-2xl text-center flex flex-col items-center max-w-md mx-auto animate-fade-in">
      <h1 className="text-4xl font-bold font-serif text-red-400 mb-4">
        {t.endOfTale}
      </h1>
      <p className="text-gray-300 mb-6 font-serif text-lg leading-relaxed">
        {message}
      </p>

      {lastRunStats && (
        <div className="bg-gray-800/50 p-4 rounded-lg mb-6 w-full">
            <p className="text-lg text-yellow-300 font-bold">{t.echoes_earned.replace('{count}', (currency - lastRunStats.initialCurrency).toString() )}</p>
            <p className="text-sm text-gray-400">{t.run_summary.replace('{turns}', lastRunStats.turns.toString()).replace('{difficulty}', lastRunStats.difficulty.toString())}</p>
        </div>
      )}

      <div className="flex flex-col gap-4 w-full">
        {completedJourney && (
            <button
                onClick={handleSave}
                disabled={isSaved}
                className="w-full px-8 py-3 bg-amber-700 text-white font-bold rounded-lg hover:bg-amber-800 focus:outline-none focus:ring-4 focus:ring-amber-500 focus:ring-opacity-50 transition-all duration-300 transform hover:scale-105 disabled:bg-gray-500 disabled:cursor-not-allowed"
            >
                {isSaved ? t.library_journey_saved : t.library_save_journey}
            </button>
        )}
        <button
            onClick={() => dispatch({ type: 'RESTART_GAME' })}
            className="w-full px-8 py-3 bg-gray-600 text-white font-bold rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-4 focus:ring-gray-500 focus:ring-opacity-50 transition-all duration-300 transform hover:scale-105"
        >
            {t.playAgain}
        </button>
      </div>
    </div>
  );
};

export default GameOverScreen;