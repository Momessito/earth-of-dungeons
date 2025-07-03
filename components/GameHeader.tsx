
import React, { useState } from 'react';
import { useGame } from '../GameContext.tsx';
import { useLanguage } from '../LanguageContext.tsx';
import { translations } from '../translations.ts';
import PlayerStatus from './PlayerStatus.tsx';

const GameHeader: React.FC = () => {
    const { state, saveGame } = useGame();
    const { characterPortraitUrl } = state;
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