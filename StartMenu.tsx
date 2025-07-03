

import React from 'react';
import { useLanguage } from './LanguageContext.tsx';
import { translations, languageNames } from './translations.ts';
import { Language, NarrativeMode } from './types.ts';
import { useGame } from './GameContext.tsx';
import { useSettings } from './SettingsContext.tsx';

const StartMenu: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const { state, loadGame, startTutorial, dispatch } = useGame();
  const { isLoading, hasSaveGame } = state;
  const { narrativeMode, setNarrativeMode, imageGenerationEnabled, setImageGenerationEnabled } = useSettings();
  
  const t = translations[language];

  return (
    <div className="flex flex-col justify-center items-center text-center w-full min-h-screen py-8 animate-fade-in">
        <div className="w-full max-w-lg">
            <h1 className="font-cinzel text-6xl md:text-7xl font-bold text-amber-300 mb-2 tracking-widest" style={{ textShadow: '0 0 15px rgba(252, 211, 77, 0.5), 0 0 5px rgba(0,0,0,0.5)'}}>
                {t.title}
            </h1>
            <p className="text-lg text-amber-100 mb-8 tracking-wider">
                {t.description}
            </p>

            <div className="flex flex-col items-center gap-4 mt-4">
                <button
                    onClick={startTutorial}
                    disabled={isLoading}
                    className="px-12 py-3 bg-red-800/80 border-2 border-amber-400 text-white font-bold text-xl rounded-md hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-amber-500 focus:ring-opacity-50 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-wait shadow-lg hover:shadow-red-500/50"
                >
                    {isLoading ? t.summoningWorld : t.beginJourney}
                </button>

                <div className="flex gap-4">
                    {hasSaveGame && (
                        <button
                            onClick={() => loadGame()}
                            disabled={isLoading}
                            className="px-6 py-2 bg-black/30 border border-gray-600 text-gray-300 font-semibold rounded-md hover:bg-black/50 hover:border-gray-500 focus:outline-none focus:ring-4 focus:ring-gray-500 focus:ring-opacity-50 transition-all duration-300 disabled:opacity-50"
                        >
                            {t.load_game}
                        </button>
                    )}
                     <button
                        onClick={() => dispatch({ type: 'SET_STATUS', payload: 'game_library' })}
                        disabled={isLoading}
                        className="px-6 py-2 bg-black/30 border border-gray-600 text-gray-300 font-semibold rounded-md hover:bg-black/50 hover:border-gray-500 focus:outline-none focus:ring-4 focus:ring-gray-500 focus:ring-opacity-50 transition-all duration-300 disabled:opacity-50"
                    >
                        {t.library_button}
                    </button>
                    <button
                        onClick={() => dispatch({ type: 'SET_STATUS', payload: 'shop' })}
                        disabled={isLoading}
                        className="px-6 py-2 bg-black/30 border border-gray-600 text-gray-300 font-semibold rounded-md hover:bg-black/50 hover:border-gray-500 focus:outline-none focus:ring-4 focus:ring-gray-500 focus:ring-opacity-50 transition-all duration-300 disabled:opacity-50"
                    >
                        {t.shop_button}
                    </button>
                </div>
            </div>

            {/* Settings */}
            <div className="mt-8 w-full max-w-sm mx-auto p-4 bg-black/20 rounded-lg space-y-4">
                {/* Narrative Mode */}
                <div>
                    <label className="font-semibold block mb-2 text-gray-300">{t.narrativeModeLabel}</label>
                    <div className="flex justify-center gap-2">
                        <button
                            onClick={() => setNarrativeMode('complete')}
                            disabled={isLoading}
                            className={`px-4 py-2 text-xs rounded-md font-semibold transition-colors duration-300 disabled:opacity-50 ${narrativeMode === 'complete' ? 'bg-amber-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}`}
                        >
                            {t.narrativeModeComplete}
                        </button>
                        <button
                            onClick={() => setNarrativeMode('summary')}
                            disabled={isLoading}
                            className={`px-4 py-2 text-xs rounded-md font-semibold transition-colors duration-300 disabled:opacity-50 ${narrativeMode === 'summary' ? 'bg-amber-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}`}
                        >
                            {t.narrativeModeSummary}
                        </button>
                    </div>
                </div>
                {/* Image Generation Toggle */}
                <div>
                     <label htmlFor="image-gen-toggle" className="flex items-center justify-center cursor-pointer text-gray-300">
                        <span className="font-semibold mr-3">{t.enableImageGeneration}</span>
                        <div className="relative">
                            <input
                                id="image-gen-toggle"
                                type="checkbox"
                                className="sr-only"
                                disabled={isLoading}
                                checked={imageGenerationEnabled}
                                onChange={() => setImageGenerationEnabled(!imageGenerationEnabled)}
                            />
                            <div className="block bg-gray-700 w-12 h-6 rounded-full"></div>
                            <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${imageGenerationEnabled ? 'translate-x-6 bg-amber-400' : ''}`}></div>
                        </div>
                    </label>
                </div>
            </div>
            
            {/* Language Selector */}
            <div className="mt-8 text-xs text-gray-400">
                 <div className="flex justify-center items-center gap-2">
                     <span>{t.selectLanguage}</span>
                    {(Object.keys(languageNames) as Language[]).map(lang => (
                    <button
                        key={lang}
                        onClick={() => setLanguage(lang)}
                        disabled={isLoading}
                        className={`px-3 py-1 rounded-md font-semibold transition-colors duration-300 ${
                        language === lang 
                        ? 'text-amber-300' 
                        : 'text-gray-500 hover:text-gray-300'
                        }`}
                    >
                        {languageNames[lang]}
                    </button>
                    ))}
                </div>
            </div>
        </div>
    </div>
  );
};

export default StartMenu;