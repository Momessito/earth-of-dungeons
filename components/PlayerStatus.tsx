
import React from 'react';
import { useGame } from '../GameContext.tsx';
import { useLanguage } from '../LanguageContext.tsx';
import { translations } from '../translations.ts';
import { PlayerAttributes } from '../types.ts';

interface PlayerStatusProps {
    onClose: () => void;
}

const AttributesTable: React.FC<{ attributes: PlayerAttributes, title: string }> = ({ attributes, title }) => (
    <div>
        <h4 className="font-semibold text-amber-300">{title}</h4>
        <div className="grid grid-cols-3 gap-x-4 gap-y-1 text-sm mt-1 text-gray-300">
            <span>STR: {attributes.strength}</span>
            <span>DEX: {attributes.dexterity}</span>
            <span>INT: {attributes.intelligence}</span>
            <span>CHA: {attributes.charisma}</span>
            <span>LUK: {attributes.luck}</span>
        </div>
    </div>
);

const ListSection: React.FC<{ title: string; items: string[] }> = ({ title, items }) => (
     <div>
        <h4 className="font-semibold text-amber-300">{title}</h4>
        {items.length > 0 ? (
            <ul className="list-disc list-inside text-sm mt-1 text-gray-300">
                {items.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
        ) : (
            <p className="text-sm text-gray-500 italic">Empty</p>
        )}
    </div>
);


const PlayerStatus: React.FC<PlayerStatusProps> = ({ onClose }) => {
    const { state: { playerState } } = useGame();
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
                    <p className="text-lg font-mono text-green-400">{playerState.hp}</p>
                </div>
                
                <AttributesTable attributes={playerState.attributes} title={t.attributes}/>
                <ListSection title={t.inventory} items={playerState.inventory} />
                <ListSection title={t.party} items={playerState.party} />
                <ListSection title={t.moves} items={playerState.moves} />

            </div>
        </div>
    )
}

export default PlayerStatus;