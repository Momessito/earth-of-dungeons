
import React from 'react';
import { useGame } from '../GameContext.tsx';
import { useLanguage } from '../LanguageContext.tsx';
import { translations } from '../translations.ts';
import LoadingSpinner from './LoadingSpinner.tsx';
import ChoiceButton from './ChoiceButton.tsx';
import InteractiveText from './InteractiveText.tsx';

const CombatScreen: React.FC = () => {
    const { state, makeChoice } = useGame();
    const { storyNode, playerState, isLoading, currentImageUrl } = state;
    const { language } = useLanguage();
    const t = translations[language];

    if (!storyNode || !playerState || !storyNode.enemy) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <LoadingSpinner />
                <p className="text-gray-300 mt-4 text-lg">{t.writingDestiny}</p>
            </div>
        );
    }

    const { enemy } = storyNode;

    return (
        <div className="bg-gray-900 bg-opacity-75 backdrop-blur-md p-6 sm:p-8 rounded-b-xl shadow-2xl w-full max-w-3xl mx-auto transition-opacity duration-500 ease-in-out relative overflow-hidden">
            {currentImageUrl && (
                 <div 
                    className="absolute inset-0 bg-cover bg-center z-0"
                    style={{ backgroundImage: `url(${currentImageUrl})` }}
                >
                     <div className="absolute inset-0 bg-black/70"></div>
                 </div>
            )}
            
            <div className="relative z-10">
                {/* Combatant Info */}
                <div className="grid grid-cols-2 gap-4 mb-6 text-center">
                    <div className="bg-blue-900/50 p-3 rounded-lg border border-blue-400">
                        <h2 className="text-lg font-bold text-blue-300">You</h2>
                        <p className="text-xl font-mono text-green-400">{playerState.hp} HP</p>
                    </div>
                     <div className="bg-red-900/50 p-3 rounded-lg border border-red-400">
                        <h2 className="text-lg font-bold text-red-300">{enemy.name}</h2>
                        <p className="text-xl font-mono text-green-400">{enemy.hp} HP</p>
                    </div>
                </div>

                {/* Battle Log */}
                <div className="mb-6 min-h-[150px] font-serif text-lg leading-relaxed text-gray-200 prose prose-invert prose-p:my-3 flex items-center justify-center border-t border-b border-gray-700 py-6">
                     <div className={`transition-opacity duration-300 w-full ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
                         <InteractiveText text={storyNode.situation} highlights={storyNode.highlights || []} />
                     </div>
                     {isLoading && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/70 rounded-md">
                         <LoadingSpinner />
                         <p className="mt-4 text-gray-400">{t.writingDestiny}</p>
                        </div>
                     )}
                </div>

                {/* Combat Moves */}
                 {!isLoading && (
                    <div className="mt-6 grid grid-cols-2 gap-4 animate-fade-in">
                        {storyNode.choices.map((choice, index) => {
                             if (choice.type !== 'combat' && choice.type !== 'button') return null;
                            return (
                                <ChoiceButton
                                    key={index}
                                    choice={choice}
                                    onClick={() => makeChoice(choice.text)}
                                    disabled={isLoading}
                                    isCombatMove={true}
                                />
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CombatScreen;
