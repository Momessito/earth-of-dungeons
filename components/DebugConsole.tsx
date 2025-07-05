
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useGame } from '../GameContext.tsx';
import { GameStatus, PlayerAttributes, GAME_STATUSES } from '../types.ts';
import { useSettings } from '../SettingsContext.tsx';
import { playSound, soundManifest } from '../services/soundService.ts';

const ATTRIBUTES: (keyof PlayerAttributes)[] = ['strength', 'dexterity', 'intelligence', 'charisma', 'luck'];
const soundNames = Object.keys(soundManifest) as (keyof typeof soundManifest)[];

const DebugConsole: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [log, setLog] = useState<string[]>(['[DEV] Console ready. Type "help" for commands.']);
    const [history, setHistory] = useState<string[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    
    const { state, dispatch } = useGame();
    const { soundEnabled, isPremium, setPremium } = useSettings();
    const inputRef = useRef<HTMLInputElement>(null);
    const logEndRef = useRef<HTMLDivElement>(null);

    const addToLog = (message: string) => {
        setLog(prevLog => [...prevLog, message]);
    };

    const executeCommand = (commandString: string) => {
        const [command, ...args] = commandString.split(' ');
        if (!command) return;
        
        addToLog(`> ${commandString}`);

        switch (command.toLowerCase()) {
            case 'help':
                addToLog('Available commands:');
                addToLog('- help: Show this message');
                addToLog('- clear: Clear the console log');
                addToLog('- log_state: Log current game state to browser console');
                addToLog('- premium <on|off>: Toggle premium features');
                addToLog('- set_status <status>: Set game status');
                addToLog('- set_hp <number>: Set player HP');
                addToLog('- set_attr <attr> <number>: Set player attribute');
                addToLog('- add_item <...name>: Add item to inventory');
                addToLog('- add_currency <number>: Add Echoes currency');
                addToLog('- force_combat: Start a test combat encounter');
                addToLog('- game_over <...message>: End the game');
                break;
            case 'clear':
                setLog([]);
                break;
            case 'log_state':
                console.log("Current Game State:", state);
                addToLog("Current game state logged to browser console.");
                break;
            case 'premium': {
                const arg = args[0]?.toLowerCase();
                if (arg === 'on') {
                    setPremium(true);
                    addToLog('Premium mode enabled.');
                } else if (arg === 'off') {
                    setPremium(false);
                    addToLog('Premium mode disabled.');
                } else {
                    addToLog(`Error: Use 'premium on' or 'premium off'. Current status: ${isPremium ? 'ON' : 'OFF'}`);
                }
                break;
            }
            case 'set_status':
                if (GAME_STATUSES.includes(args[0] as GameStatus)) {
                    dispatch({ type: 'DEBUG_SET_STATUS', payload: args[0] as GameStatus });
                    addToLog(`Game status set to: ${args[0]}`);
                } else {
                    addToLog(`Error: Invalid status. Valid statuses: ${GAME_STATUSES.join(', ')}`);
                }
                break;
            case 'set_hp': {
                const value = parseInt(args[0]);
                if (!isNaN(value)) {
                    dispatch({ type: 'DEBUG_SET_HP', payload: value });
                    addToLog(`Player HP set to: ${value}`);
                } else {
                    addToLog('Error: Invalid number for HP.');
                }
                break;
            }
            case 'set_attr': {
                const attr = args[0] as keyof PlayerAttributes;
                const value = parseInt(args[1]);
                if (ATTRIBUTES.includes(attr) && !isNaN(value)) {
                    dispatch({ type: 'DEBUG_SET_ATTRIBUTE', payload: { attribute: attr, value } });
                    addToLog(`Player attribute ${attr} set to: ${value}`);
                } else {
                    addToLog('Error: Invalid syntax. Use: set_attr <str|dex|int|cha|luck> <number>');
                }
                break;
            }
            case 'add_item': {
                const itemName = args.join(' ');
                if (itemName) {
                    dispatch({ type: 'DEBUG_ADD_ITEM', payload: itemName });
                    addToLog(`Item added: ${itemName}`);
                } else {
                    addToLog('Error: Item name cannot be empty.');
                }
                break;
            }
            case 'add_currency': {
                const value = parseInt(args[0]);
                if (!isNaN(value)) {
                    dispatch({ type: 'ADD_CURRENCY', payload: value });
                    addToLog(`${value} currency added.`);
                } else {
                    addToLog('Error: Invalid number for currency.');
                }
                break;
            }
            case 'force_combat':
                if (state.playerState) {
                    dispatch({ type: 'DEBUG_FORCE_COMBAT' });
                    addToLog('Forcing combat...');
                } else {
                    addToLog('Error: Cannot force combat, no active player state.');
                }
                break;
            case 'game_over': {
                const message = args.join(' ') || 'Debug Game Over.';
                dispatch({ type: 'DEBUG_GAME_OVER', payload: message });
                addToLog(`Forcing game over with message: "${message}"`);
                break;
            }
            default:
                addToLog(`Error: Unknown command "${command}". Type "help" for a list of commands.`);
        }
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;
        executeCommand(input);
        setHistory(prev => [input, ...prev]);
        setHistoryIndex(-1);
        setInput('');
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (historyIndex < history.length - 1) {
                const newIndex = historyIndex + 1;
                setHistoryIndex(newIndex);
                setInput(history[newIndex]);
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (historyIndex > 0) {
                const newIndex = historyIndex - 1;
                setHistoryIndex(newIndex);
                setInput(history[newIndex]);
            } else if (historyIndex === 0) {
                setHistoryIndex(-1);
                setInput('');
            }
        }
    };

    const toggleConsole = useCallback((e: KeyboardEvent) => {
        if (e.key === "'") { // Changed from Ctrl + ` to just '
            e.preventDefault();
            setIsOpen(prev => !prev);
        }
    }, []);

    useEffect(() => {
        window.addEventListener('keydown', toggleConsole);
        return () => window.removeEventListener('keydown', toggleConsole);
    }, [toggleConsole]);

    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
        }
    }, [isOpen]);

    useEffect(() => {
        logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [log]);

    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 p-4 flex flex-col font-mono" aria-modal="true" role="dialog">
            <div className="flex-shrink-0 mb-4 p-3 border border-gray-600 rounded bg-gray-900/50">
                <h3 className="text-amber-300 mb-2 font-bold text-base">Audio Test</h3>
                {!soundEnabled && <p className="text-yellow-500 text-xs mb-2">Sound is disabled in settings.</p>}
                <div className="flex flex-wrap gap-2">
                    {soundNames.map(name => (
                        <button 
                            key={name}
                            onClick={() => playSound(name)}
                            disabled={!soundEnabled}
                            className="px-3 py-1 bg-gray-700 text-white text-xs rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {name}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-grow overflow-y-auto pr-2 text-sm bg-black/30 p-2 rounded">
                {log.map((line, index) => (
                    <p key={index} className="text-white break-words">
                        {line.startsWith('>') && <span className="text-cyan-400">{line.substring(0, 1)}</span>}
                        {line.startsWith('Error:') && <span className="text-red-500">{line.substring(0, 6)}</span>}
                        {line.startsWith('>') ? line.substring(1) : (line.startsWith('Error:') ? line.substring(6) : line)}
                    </p>
                ))}
                <div ref={logEndRef} />
            </div>
            <form onSubmit={handleFormSubmit} className="flex-shrink-0 mt-2">
                <div className="flex items-center">
                    <span className="text-cyan-400 mr-2">&gt;</span>
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="w-full bg-gray-900 text-white border-0 focus:ring-0 p-1"
                        placeholder="Type a command..."
                        autoComplete="off"
                        spellCheck="false"
                    />
                </div>
            </form>
        </div>
    );
};

export default DebugConsole;
