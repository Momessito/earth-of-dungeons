
import React, { useState, useEffect, useMemo } from 'react';
import { useGame } from '../GameContext.tsx';
import { motion, AnimatePresence } from 'framer-motion';

const D20Icon: React.FC<{ isRolling: boolean }> = ({ isRolling }) => (
    <motion.svg 
        className={`w-24 h-24 text-white`}
        fill="currentColor" 
        viewBox="0 0 20 20" 
        xmlns="http://www.w3.org/2000/svg"
        animate={{ rotate: isRolling ? 360*2 : 0 }}
        transition={{ duration: 1.5, ease: "linear", repeat: isRolling ? Infinity : 0 }}
    >
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
    </motion.svg>
);


const DiceRollScreen: React.FC = () => {
    const { state, resolveDiceRoll } = useGame();
    const { playerState, diceRollInfo } = state;
    
    const [isRolling, setIsRolling] = useState(true);
    const [rollResult, setRollResult] = useState(0);
    const [showOutcome, setShowOutcome] = useState(false);

    const { bonus, total, outcome, dc } = useMemo((): {
        bonus: number;
        total: number;
        outcome: 'success' | 'failure';
        dc: number;
    } => {
        if (!playerState || !diceRollInfo) {
            return { bonus: 0, total: 0, outcome: 'failure', dc: 10 };
        }
        const bonusValue = Math.floor((playerState.attributes[diceRollInfo.attribute] - 10) / 2);
        const totalValue = rollResult + bonusValue;
        return { 
            bonus: bonusValue, 
            total: totalValue, 
            outcome: totalValue >= diceRollInfo.difficultyClass ? 'success' : 'failure', 
            dc: diceRollInfo.difficultyClass 
        };
    }, [rollResult, playerState, diceRollInfo]);


    useEffect(() => {
        if (!playerState || !diceRollInfo) return;

        setIsRolling(true);
        setShowOutcome(false);

        const rollTimer = setTimeout(() => {
            const result = Math.floor(Math.random() * 20) + 1;
            setRollResult(result);
            setIsRolling(false);
        }, 1500);

        return () => clearTimeout(rollTimer);

    }, [playerState, diceRollInfo]);

     useEffect(() => {
        if (!isRolling && rollResult > 0) {
            const outcomeTimer = setTimeout(() => {
                setShowOutcome(true);
            }, 500);
            
            const resolveTimer = setTimeout(() => {
                resolveDiceRoll(outcome);
            }, 3000);

            return () => {
                clearTimeout(outcomeTimer);
                clearTimeout(resolveTimer);
            }
        }
    }, [isRolling, rollResult, outcome, resolveDiceRoll]);

    if (!diceRollInfo) return null;

    return (
        <motion.div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col justify-center items-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            
            <div className="text-center w-full max-w-lg">
                <p className="text-gray-400 text-lg mb-2 capitalize">{diceRollInfo.attribute} Check</p>
                <h1 className="text-2xl sm:text-3xl font-bold text-amber-300 mb-8 px-4">
                    {diceRollInfo.text}
                </h1>
            
                <div className="relative flex justify-center items-center h-48">
                    <AnimatePresence>
                    {isRolling && (
                        <motion.div
                            key="rolling"
                            exit={{ opacity: 0, scale: 0.5 }}
                        >
                            <D20Icon isRolling={true} />
                        </motion.div>
                    )}
                    {!isRolling && (
                         <motion.div 
                            key="result"
                            className="flex flex-col items-center justify-center"
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                         >
                            <span className="text-7xl font-bold text-white">{rollResult}</span>
                         </motion.div>
                    )}
                    </AnimatePresence>
                </div>

                <AnimatePresence>
                {showOutcome && (
                    <motion.div 
                        className="min-h-[120px]"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="text-2xl text-gray-300">
                            <span className="text-white font-bold">{rollResult}</span>
                            <span className="text-green-400 font-bold"> {bonus >= 0 ? `+ ${bonus}`: `- ${Math.abs(bonus)}`} </span>
                            <span> = </span>
                            <span className="text-amber-400 font-bold text-3xl">{total}</span>
                        </div>

                        <div className="mt-4 text-xl">
                            <span className="text-gray-400">Difficulty: </span>
                            <span className="font-bold text-white">{dc}</span>
                        </div>

                        <div className="mt-6">
                            {outcome === 'success' ? (
                                <p className="text-4xl font-extrabold text-green-400 tracking-wider" style={{textShadow: '0 0 10px #2f2'}}>SUCCESS</p>
                            ) : (
                                <p className="text-4xl font-extrabold text-red-500 tracking-wider" style={{textShadow: '0 0 10px #f22'}}>FAILURE</p>
                            )}
                        </div>
                    </motion.div>
                )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default DiceRollScreen;