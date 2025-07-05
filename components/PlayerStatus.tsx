


import React from 'react';
import { useGame } from '../GameContext.tsx';
import { useLanguage } from '../LanguageContext.tsx';
import { translations } from '../translations.ts';
import PlayerAttributes from './PlayerAttributes.tsx';
import { CompanionBehavior } from '../types.ts';

interface PlayerStatusProps {
    onClose: () => void;
}

const ListSection: React.FC<{ title: string; items: string[] | React.ReactNode } > = ({ title, items }) => (
     <div>
        <h4 className="font-semibold text-amber-300">{title}</h4>
        {Array.isArray(items) && items.length > 0 ? (
            <ul className="list-disc list-inside text-sm mt-1 text-gray-300">
                {items.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
        ) : (
            <p className="text-sm text-gray-500 italic">Empty</p>
        )}
    </div>
);

const BehaviorButton: React.FC<{label: string, isActive: boolean, onClick: () => void}> = ({ label, isActive, onClick }) => {
    const baseClasses = "px-2 py-1 text-xs font-bold rounded-md transition-colors duration-200 flex-grow text-center";
    const activeClasses = "bg-amber-500 text-black shadow-md";
    const inactiveClasses = "bg-gray-600 hover:bg-gray-500 text-gray-200";
    return (
        <button onClick={onClick} className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}>
            {label}
        </button>
    )
}

const PlayerStatus: React.FC<PlayerStatusProps> = ({ onClose }) => {
    const { state: { playerState }, updateCompanionBehavior } = useGame();
    const { language } = useLanguage();
    const t = translations[language];

    if (!playerState) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-40 flex justify-center items-center p-4" onClick={onClose}>
            <div
                className="bg-gray-800 border-2 border-amber-500/50 p-6 rounded-xl shadow-2xl w-full max-w-md animate-fade-in-fast space-y-4"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center">
                    <h3 className="text-2xl font-bold font-serif text-amber-200">{t.status_title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
                </div>

                <div className="border-t border-gray-700 pt-4">
                    <h4 className="font-semibold text-amber-300">{t.hp}</h4>
                    <p className="text-lg font-mono text-green-400">{playerState.hp} / {playerState.maxHp}</p>
                </div>
                
                <PlayerAttributes attributes={playerState.attributes} title={t.attributes}/>
                <ListSection title={t.inventory} items={playerState.inventory} />
                
                <div>
                    <h4 className="font-semibold text-amber-300">{t.party}</h4>
                    {playerState.party.length > 0 ? (
                        <div className="space-y-3 mt-1">
                            {playerState.party.map((companion, i) => (
                                <div key={i} className="bg-gray-700/50 p-3 rounded-lg">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-bold text-base text-gray-100">{companion.name}</p>
                                            <p className="text-xs italic text-gray-400">{companion.title}</p>
                                        </div>
                                        <p className="font-mono text-sm text-green-400">{companion.hp} / {companion.maxHp} HP</p>
                                    </div>
                                    <p className="text-sm mt-2 text-gray-300">
                                        <span className="font-semibold">Ability: </span>{companion.ability}
                                    </p>
                                    <div className="mt-3 pt-2 border-t border-gray-600/50">
                                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Behavior</span>
                                        <div className="flex justify-stretch gap-2 mt-1">
                                            {(['Aggressive', 'Defensive', 'Support'] as CompanionBehavior[]).map(behavior => (
                                                <BehaviorButton 
                                                    key={behavior}
                                                    label={language === 'pt' ? (
                                                        {Aggressive: 'Agressivo', Defensive: 'Defensivo', Support: 'Suporte'}[behavior]
                                                    ) : behavior}
                                                    isActive={companion.behavior === behavior} 
                                                    onClick={() => updateCompanionBehavior(companion.name, behavior)}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                         <p className="text-sm text-gray-500 italic">{language === 'pt' ? 'Viajando sozinho(a)' : 'Traveling alone'}</p>
                    )}
                </div>
                
            </div>
        </div>
    )
}

export default PlayerStatus;