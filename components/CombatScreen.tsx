

import React, { useState, useMemo, useEffect } from 'react';
import { useGame } from '../GameContext.tsx';
import { useLanguage } from '../LanguageContext.tsx';
import { translations } from '../translations.ts';
import LoadingSpinner from './LoadingSpinner.tsx';
import InteractiveText from './InteractiveText.tsx';
import { StatusEffect, PlayerAttributes, CombatAction } from '../types.ts';
import { motion, AnimatePresence } from 'framer-motion';

const AttributesDisplay: React.FC<{ attributes: PlayerAttributes }> = ({ attributes }) => (
    <div className="grid grid-cols-3 gap-x-3 gap-y-1 text-xs text-gray-400 mt-2 border-t border-gray-600/50 pt-2">
        <span>STR: {attributes.strength}</span>
        <span>DEX: {attributes.dexterity}</span>
        <span>INT: {attributes.intelligence}</span>
        <span>CHA: {attributes.charisma}</span>
        <span>LUK: {attributes.luck}</span>
    </div>
);


const CombatantStatus: React.FC<{
    name: string;
    hp: number;
    maxHp: number;
    ap: number;
    maxAp: number;
    statusEffects: StatusEffect[];
    attributes: PlayerAttributes;
    isPlayer: boolean;
}> = ({ name, hp, maxHp, ap, maxAp, statusEffects, attributes, isPlayer }) => {
    const hpPercentage = maxHp > 0 ? (hp / maxHp) * 100 : 0;
    const barColor = isPlayer ? 'bg-green-600' : 'bg-red-600';
    const bgColor = isPlayer ? 'bg-blue-900/50 border-blue-400' : 'bg-red-900/50 border-red-400';
    const nameColor = isPlayer ? 'text-blue-300' : 'text-red-300';
    
    return (
        <div className={`p-3 rounded-lg border ${bgColor} backdrop-blur-sm`}>
            <div className="flex justify-between items-baseline">
                <h2 className={`text-lg font-bold ${nameColor}`}>{name}</h2>
                <div className="flex items-baseline gap-3">
                    <p className="text-sm font-mono text-yellow-300">{ap} / {maxAp} AP</p>
                    <p className="text-xl font-mono text-green-300">{hp} / {maxHp}</p>
                </div>
            </div>
            <motion.div className="w-full bg-gray-700 rounded-full h-2.5 mt-2">
                <motion.div 
                    className={`${barColor} h-2.5 rounded-full`}
                    initial={{ width: `${hpPercentage}%`}}
                    animate={{ width: `${hpPercentage}%`}}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                />
            </motion.div>
             {statusEffects.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                    {statusEffects.map(effect => (
                        <span key={effect.type} className="text-xs bg-gray-800/70 text-yellow-300 px-2 py-1 rounded-full">
                            {effect.type} ({effect.duration})
                        </span>
                    ))}
                </div>
            )}
            <AttributesDisplay attributes={attributes} />
        </div>
    );
};

const ActionBar: React.FC<{ 
    actions: CombatAction[];
    onActionClick: (action: CombatAction) => void;
    disabled: boolean;
    currentAp: number;
}> = ({ actions, onActionClick, disabled, currentAp }) => {
     return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {actions.map(action => (
                <motion.button
                    key={action.name}
                    onClick={() => onActionClick(action)}
                    disabled={disabled || currentAp < action.cost}
                    className="p-2 border rounded-lg transition-colors duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 bg-gray-800 bg-opacity-60 border-gray-700 text-gray-300 hover:bg-yellow-900/30 hover:border-amber-600 hover:text-white focus:ring-amber-500 flex flex-col items-center justify-center text-center h-24"
                    title={action.description}
                    whileHover={{ scale: (disabled || currentAp < action.cost) ? 1 : 1.05 }}
                    whileTap={{ scale: (disabled || currentAp < action.cost) ? 1 : 0.95 }}
                >
                    <span className="font-bold text-sm">{action.name}</span>
                    <span className="text-amber-400 font-mono text-lg">{action.cost} AP</span>
                </motion.button>
            ))}
        </div>
    );
}

const screenVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3, ease: "easeIn" } }
} as const;

const CombatScreen: React.FC = () => {
    const { state, executeCombatTurn } = useGame();
    const { storyNode, playerState, isLoading } = state;
    const { language } = useLanguage();
    const t = translations[language];

    const [turnActions, setTurnActions] = useState<CombatAction[]>([]);
    const [currentAp, setCurrentAp] = useState(playerState?.ap || 0);

    useEffect(() => {
        if(playerState) {
            setCurrentAp(playerState.ap);
            setTurnActions([]);
        }
    }, [playerState?.turn, playerState?.ap]);

    const playerActions = useMemo((): CombatAction[] => {
        if (!playerState) return [];
        const specialDesc = t.combat_action_special_move_desc;
        return [
            { name: 'Quick Attack', cost: 1, description: t.combat_action_quick_attack_desc },
            { name: 'Standard Attack', cost: 2, description: t.combat_action_standard_attack_desc },
            { name: 'Power Attack', cost: 3, description: t.combat_action_power_attack_desc },
            { name: 'Defend', cost: 1, description: t.combat_action_defend_desc },
            { name: 'Aim', cost: 2, description: t.combat_action_aim_desc },
            { name: 'Use Item', cost: 2, description: t.combat_action_use_item_desc },
            { name: 'Special Move', cost: 4, description: specialDesc },
        ];
    }, [playerState, language, t]);

    if (!storyNode || !playerState || !storyNode.enemy) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <LoadingSpinner />
                <p className="text-gray-300 mt-4 text-lg">{t.writingDestiny}</p>
            </div>
        );
    }
    
    const { enemy } = storyNode;

    const handleActionClick = (action: CombatAction) => {
        if (currentAp >= action.cost) {
            setTurnActions([...turnActions, action]);
            setCurrentAp(currentAp - action.cost);
        }
    }

    const handleEndTurn = () => {
        if (turnActions.length > 0) {
            executeCombatTurn(turnActions);
        }
    }

    const battleLog = storyNode.combatLog || storyNode.situation;

    return (
        <motion.div 
            className="bg-gray-900 bg-opacity-75 backdrop-blur-md p-4 sm:p-6 rounded-b-xl shadow-2xl w-full max-w-4xl mx-auto relative overflow-hidden"
            variants={screenVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
        >
             <div className="relative z-10">
                {/* Combatant Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                   <CombatantStatus 
                        name="You" 
                        hp={playerState.hp} 
                        maxHp={playerState.maxHp}
                        ap={playerState.ap}
                        maxAp={playerState.maxAp}
                        statusEffects={playerState.statusEffects} 
                        attributes={playerState.attributes}
                        isPlayer={true} 
                   />
                   <CombatantStatus 
                        name={enemy.name} 
                        hp={enemy.hp} 
                        maxHp={enemy.maxHp} 
                        ap={enemy.ap}
                        maxAp={enemy.maxAp}
                        statusEffects={enemy.statusEffects}
                        attributes={enemy.attributes}
                        isPlayer={false} 
                   />
                </div>

                {/* Battle Log */}
                <div className="mb-4 min-h-[150px] font-serif text-lg leading-relaxed text-gray-200 prose prose-invert prose-p:my-3 flex items-center justify-center border-t border-b border-gray-700 py-6 bg-black/40 rounded-md">
                     <div className={`transition-opacity duration-300 w-full px-4 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
                         <AnimatePresence mode="wait">
                            <motion.div
                                key={battleLog}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <InteractiveText text={battleLog} highlights={storyNode.highlights || []} />
                            </motion.div>
                         </AnimatePresence>
                     </div>
                     {isLoading && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/70 rounded-md">
                         <LoadingSpinner />
                         <p className="mt-4 text-gray-400">{t.writingDestiny}</p>
                        </div>
                     )}
                </div>
                
                {/* Turn Summary */}
                 {!isLoading && turnActions.length > 0 && (
                    <motion.div 
                        className="my-2 p-2 bg-gray-800/60 rounded-lg text-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <p className="text-sm text-gray-300">
                            Queued Actions: <span className="font-semibold text-amber-300">{turnActions.map(a => a.name).join(', ')}</span>
                        </p>
                    </motion.div>
                 )}


                {/* Combat Controls */}
                 {!isLoading && (
                    <motion.div 
                        className="mt-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <ActionBar actions={playerActions} onActionClick={handleActionClick} disabled={isLoading} currentAp={currentAp} />
                        <div className="mt-4 flex justify-end gap-4">
                             <div className="flex items-center font-mono text-xl">
                                <span className="text-gray-400 mr-2">{t.ap}:</span>
                                <span className="text-amber-300 font-bold">{currentAp} / {playerState.maxAp}</span>
                            </div>
                            <button
                                onClick={handleEndTurn}
                                disabled={isLoading || turnActions.length === 0}
                                className="px-8 py-3 bg-red-800/80 border-2 border-amber-400 text-white font-bold text-xl rounded-md hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-amber-500 focus:ring-opacity-50 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {t.combat_end_turn}
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
};

export default CombatScreen;