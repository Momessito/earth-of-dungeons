
import React, { useState, useEffect, useMemo } from 'react';
import { useGame } from '../GameContext.tsx';

const D20Icon: React.FC<{ isRolling: boolean }> = ({ isRolling }) => (
    <svg 
        className={`w-24 h-24 text-white transition-transform duration-1000 ${isRolling ? 'animate-spin' : ''}`}
        fill="currentColor" 
        viewBox="0 0 20 20" 
        xmlns="http://www.w3.org/2000/svg"
    >
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
    </svg>
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
        const bonus = Math.floor((playerState.attributes[diceRollInfo.attribute] - 10) / 2);
        const total = rollResult + bonus;
        return { 
            bonus, 
            total, 
            outcome: total >= diceRollInfo.difficultyClass ? 'success' : 'failure', 
            dc: diceRollInfo.difficultyClass 
        };
    }, [rollResult, playerState, diceRollInfo]);


    useEffect(() => {
        if (!playerState || !diceRollInfo) return;

        // Start rolling animation
        setIsRolling(true);
        setShowOutcome(false);

        const rollTimer = setTimeout(() => {
            const result = Math.floor(Math.random() * 20) + 1;
            setRollResult(result);
            setIsRolling(false);
        }, 1500); // Roll animation duration

        return () => clearTimeout(rollTimer);

    }, [playerState, diceRollInfo]);

     useEffect(() => {
        if (!isRolling && rollResult > 0) {
            const outcomeTimer = setTimeout(() => {
                setShowOutcome(true);
            }, 500); // Brief pause before showing outcome
            
            const resolveTimer = setTimeout(() => {
                resolveDiceRoll(outcome);
            }, 3000); // Time to read outcome before continuing

            return () => {
                clearTimeout(outcomeTimer);
                clearTimeout(resolveTimer);
            }
        }
    }, [isRolling, rollResult, outcome, resolveDiceRoll]);

    if (!diceRollInfo) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col justify-center items-center animate-fade-in p-4">
            
            <div className="text-center w-full max-w-lg">
                <p className="text-gray-400 text-lg mb-2 capitalize">{diceRollInfo.attribute} Check</p>
                <h1 className="text-2xl sm:text-3xl font-bold text-amber-300 mb-8 px-4">
                    {diceRollInfo.text}
                </h1>
            
                <div className="relative flex justify-center items-center h-48">
                    {isRolling && <D20Icon isRolling={true} />}
                    {!isRolling && (
                         <div className="flex flex-col items-center justify-center animate-fade-in-fast">
                            <span className="text-7xl font-bold text-white">{rollResult}</span>
                         </div>
                    )}
                </div>

                <div className={`transition-opacity duration-500 min-h-[120px] ${showOutcome ? 'opacity-100' : 'opacity-0'}`}>
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

                </div>

            </div>
        </div>
    );
};

export default DiceRollScreen;
