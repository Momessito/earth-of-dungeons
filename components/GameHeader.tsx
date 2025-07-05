

import React, { useState } from 'react';
import { useGame } from '../GameContext.tsx';
import { useLanguage } from '../LanguageContext.tsx';
import { translations } from '../translations.ts';
import PlayerStatus from './PlayerStatus.tsx';

const GameHeader: React.FC = () => {
    const { state, saveGame } = useGame();
    const { characterPortraitUrl, playerState } = state;
    const { language } = useLanguage();
    const t = translations[language];
    
    const [showStatus, setShowStatus] = useState(false);
    const [showSaveMessage, setShowSaveMessage] = useState(false);

    const handleSave = () => {
        saveGame();
        setShowSaveMessage(true);
        setTimeout(() => setShowSaveMessage(false), 2000);
    }

    return (
        <header className="w-full">
            <div className="flex justify-between items-center p-3 bg-black/40 backdrop-blur-sm rounded-t-xl border-b border-gray-700">
                <div className="flex items-center gap-3">
                    {characterPortraitUrl && (
                        <img 
                            src={characterPortraitUrl} 
                            alt="Character Portrait" 
                            className="w-10 h-10 rounded-full border-2 border-amber-500 object-cover" 
                        />
                    )}
                     {playerState?.party && playerState.party.map((companion, index) => (
                        <div 
                            key={index} 
                            title={`${companion.name}\n${companion.hp}/${companion.maxHp} HP`} 
                            className="h-8 w-8 bg-gray-600 rounded-full flex items-center justify-center border-2 border-blue-400 cursor-help"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-200" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0115 8a1 1 0 10-2 0 3 3 0 00-3 3 1 1 0 001 1h1.53c.187.63.49 1.2.87 1.67a1 1 0 11-1.4 1.43c-.42-.51-.75-1.1-1-1.74a4.978 4.978 0 01-1.554 1.455A4.003 4.003 0 019 19a4 4 0 01-4-4 1 1 0 011-1h1.53a3.001 3.001 0 001.9-5.43A5 5 0 015 8a1 1 0 10-2 0 7 7 0 005.93 6.93A4.001 4.001 0 0112.93 17z" />
                            </svg>
                        </div>
                    ))}
                    <button
                        onClick={() => setShowStatus(true)}
                        className="px-4 py-2 bg-gray-700/80 text-white font-semibold rounded-lg hover:bg-gray-600/80 transition-colors"
                    >
                        {t.status_button}
                    </button>
                </div>
                <div className="relative">
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-amber-800/80 text-white font-semibold rounded-lg hover:bg-amber-700/80 transition-colors"
                    >
                        {t.save_game}
                    </button>
                    {showSaveMessage && (
                        <div className="absolute top-full mt-2 right-0 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-md animate-fade-in-out">
                            {t.game_saved}
                        </div>
                    )}
                </div>
            </div>
            {showStatus && <PlayerStatus onClose={() => setShowStatus(false)} />}
        </header>
    );
};

export default GameHeader;