






import React, { createContext, useContext, ReactNode, useReducer, useEffect, useCallback, useRef } from 'react';
import { GameState, Action, StoryNode, PlayerState, Scenario, PurchasedUpgrades, DiceRollInfo, SavedJourney, Language, GameStatus, Enemy, GAME_STATUSES, CombatAction, ShopItem, Companion, CompanionBehavior } from './types.ts';
import { useLanguage } from './LanguageContext.tsx';
import { useSettings } from './SettingsContext.tsx';
import { generateStoryStep, generateCombatTurn, generateSceneryImage } from './services/geminiService.ts';
import * as journeyManager from './services/journeyManager.ts';
import { playSound, SoundName } from './services/soundService.ts';

const speak = (text: string, lang: Language) => {
    if (!('speechSynthesis' in window)) {
        console.warn("Speech Synthesis not supported by this browser.");
        return;
    }
    const trySpeak = () => {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        const targetLang = lang === 'pt' ? 'pt-BR' : 'en-US';
        utterance.lang = targetLang;
        
        const voices = window.speechSynthesis.getVoices();
        const voice = voices.find(v => v.lang === targetLang);
        if (voice) {
            utterance.voice = voice;
        }
        
        window.speechSynthesis.speak(utterance);
    }
    
    if (window.speechSynthesis.getVoices().length === 0) {
        window.speechSynthesis.onvoiceschanged = () => {
            trySpeak();
            window.speechSynthesis.onvoiceschanged = null;
        };
    } else {
        trySpeak();
    }
};

interface GameContextType {
  state: GameState;
  dispatch: React.Dispatch<Action>;
  makeChoice: (choiceText: string) => void;
  executeCombatTurn: (actions: CombatAction[]) => void;
  startDiceRoll: (rollInfo: DiceRollInfo) => void;
  resolveDiceRoll: (outcome: 'success' | 'failure') => void;
  loadGame: () => void;
  saveGame: () => void;
  startTutorial: () => void;
  endTutorial: () => void;
  selectScenario: (scenario: Scenario) => void;
  saveCompletedJourneyToLibrary: () => boolean;
  buyItem: (item: ShopItem, newUpgrades: PurchasedUpgrades, newCurrency: number) => void;
  updateCompanionBehavior: (companionName: string, behavior: CompanionBehavior) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

const SAVE_KEY = 'isekai-life-savegame';
const TUTORIAL_KEY = 'isekai-life-tutorial-seen';
const CURRENCY_KEY = 'isekai-life-currency';
const UPGRADES_KEY = 'isekai-life-upgrades';

const initialState: GameState = {
    gameStatus: 'intro',
    isLoading: false,
    isGeneratingImage: false,
    storyNode: null,
    playerState: null,
    gameOverMessage: '',
    lastRunStats: null,
    currency: parseInt(localStorage.getItem(CURRENCY_KEY) || '0', 10),
    purchasedUpgrades: JSON.parse(localStorage.getItem(UPGRADES_KEY) || '{}'),
    hasSaveGame: false,
    tutorialSeen: !!localStorage.getItem(TUTORIAL_KEY),
    currentImageUrl: null,
    diceRollInfo: null,
    characterDescription: null,
    characterPortraitUrl: null,
    fullHistory: [],
    completedJourney: null,
    selectedScenario: null,
};

const gameReducer = (state: GameState, action: Action): GameState => {
    switch (action.type) {
        case 'SET_STATUS':
            return { ...state, gameStatus: action.payload };
        case 'SET_LOADING':
            return { ...state, isLoading: action.payload };
        case 'SET_IMAGE_GENERATING':
            return { ...state, isGeneratingImage: action.payload };
        case 'SET_IMAGE_URL':
            return { ...state, currentImageUrl: action.payload };
        case 'START_TUTORIAL': {
            const { isPremium } = action.payload;
            if (state.tutorialSeen) {
                if (isPremium) {
                    return { ...state, gameStatus: 'scenario_selection' };
                }
                const freeScenarios: Scenario[] = ['king', 'church', 'mages', 'ancestral'];
                const randomScenario = freeScenarios[Math.floor(Math.random() * freeScenarios.length)];
                return {
                    ...state,
                    selectedScenario: randomScenario,
                    gameStatus: 'world_briefing',
                    isLoading: true,
                    characterDescription: "A seasoned adventurer with watchful eyes and a ready stance.",
                    characterPortraitUrl: null,
                };
            }
            return { ...state, gameStatus: 'tutorial' };
        }
        case 'END_TUTORIAL': {
            const { isPremium } = action.payload;
            localStorage.setItem(TUTORIAL_KEY, 'true');
            if (isPremium) {
                return {
                    ...state,
                    tutorialSeen: true,
                    gameStatus: 'scenario_selection',
                };
            }
            const freeScenarios: Scenario[] = ['king', 'church', 'mages', 'ancestral'];
            const randomScenario = freeScenarios[Math.floor(Math.random() * freeScenarios.length)];
            return {
                ...state,
                tutorialSeen: true,
                selectedScenario: randomScenario,
                gameStatus: 'world_briefing',
                isLoading: true,
                characterDescription: "A seasoned adventurer with watchful eyes and a ready stance.",
                characterPortraitUrl: null,
            };
        }
        case 'SELECT_SCENARIO':
            return {
                ...state,
                selectedScenario: action.payload,
                gameStatus: 'world_briefing',
                isLoading: true,
                characterDescription: "A seasoned adventurer with watchful eyes and a ready stance.",
                characterPortraitUrl: null,
            };
        case 'START_BRIEFING':
             return { ...state, storyNode: action.payload, playerState: action.payload.playerState || null, isLoading: false, fullHistory: action.payload.situation ? [action.payload.situation] : [] };
        case 'START_GAME':
            return { ...state, gameStatus: state.storyNode?.enemy ? 'in_combat' : 'playing' };
        case 'START_DICE_ROLL':
            return { ...state, gameStatus: 'dice_rolling', diceRollInfo: action.payload };
        case 'UPDATE_NODE':
            const nextStatus = action.payload.enemy ? 'in_combat' : 'playing';
            if (action.payload.playerState) {
                // When combat starts, reset AP
                action.payload.playerState.ap = action.payload.playerState.maxAp;
            }
            return { ...state, gameStatus: nextStatus, storyNode: action.payload, playerState: action.payload.playerState || state.playerState, isLoading: false, diceRollInfo: null, fullHistory: [...state.fullHistory, action.payload.situation] };
        case 'COMBAT_UPDATE':
            if (!state.storyNode) return state;
            
            if (action.payload.isGameOver) {
                 const finalStats = { turns: action.payload.playerState.turn, difficulty: action.payload.playerState.worldDifficulty };
                 return gameReducer(state, { type: 'GAME_OVER', payload: { message: action.payload.combatLog, stats: finalStats } });
            }

            // If combat ends
            if (action.payload.enemy === null) {
                const newStoryNode: StoryNode = {
                    ...state.storyNode,
                    situation: action.payload.combatLog + "\n\nThe threat is eliminated. What will you do now?",
                    choices: [ {type: 'button', text: 'Continue exploring.'}],
                    enemy: null,
                    combatLog: undefined,
                };
                const newPlayerState = { ...action.payload.playerState, ap: action.payload.playerState.maxAp };
                return { ...state, gameStatus: 'playing', storyNode: newStoryNode, playerState: newPlayerState, isLoading: false };
            }
            
            return {
                ...state,
                playerState: action.payload.playerState,
                storyNode: {
                    ...state.storyNode,
                    enemy: action.payload.enemy,
                    combatLog: action.payload.combatLog,
                    situation: state.storyNode.situation, // Keep the original combat intro text
                },
                isLoading: false,
            };
        case 'GAME_OVER':
            localStorage.removeItem(SAVE_KEY);
            const journeyData: Omit<SavedJourney, 'id' | 'date'> = {
                worldName: state.storyNode?.worldName || 'Unknown World',
                finalStats: action.payload.stats,
                history: state.fullHistory,
                characterDescription: state.characterDescription,
                characterPortraitUrl: state.characterPortraitUrl,
                gameOverMessage: action.payload.message,
            };
            return { 
                ...state, 
                gameStatus: 'game_over', 
                gameOverMessage: action.payload.message, 
                lastRunStats: { ...action.payload.stats, initialCurrency: state.currency },
                storyNode: null, 
                playerState: null, 
                isLoading: false,
                isGeneratingImage: false,
                currentImageUrl: null,
                hasSaveGame: false,
                diceRollInfo: null,
                completedJourney: journeyData,
                selectedScenario: null,
            };
        case 'ADD_CURRENCY':
            const newCurrency = state.currency + action.payload;
            localStorage.setItem(CURRENCY_KEY, newCurrency.toString());
            return { ...state, currency: newCurrency };
        case 'RESTART_GAME':
            return {
                ...initialState,
                storyNode: null,
                playerState: null,
                gameOverMessage: '',
                lastRunStats: null,
                currentImageUrl: null,
                diceRollInfo: null,
                characterDescription: null,
                characterPortraitUrl: null,
                fullHistory: [],
                completedJourney: null,
                selectedScenario: null,
                gameStatus: 'start_menu',
                currency: state.currency,
                purchasedUpgrades: state.purchasedUpgrades,
                tutorialSeen: state.tutorialSeen,
                hasSaveGame: !!localStorage.getItem(SAVE_KEY)
            };
        case 'LOAD_GAME':
             const loadedStatus = action.payload.storyNode.enemy ? 'in_combat' : 'playing';
             return {
                ...state,
                gameStatus: loadedStatus,
                playerState: action.payload.playerState,
                storyNode: action.payload.storyNode,
                currentImageUrl: action.payload.currentImageUrl,
                characterDescription: action.payload.playerState.characterDescription,
                characterPortraitUrl: action.payload.characterPortraitUrl,
                isLoading: false,
             };
        case 'BUY_ITEM':
            localStorage.setItem(UPGRADES_KEY, JSON.stringify(action.payload.newUpgrades));
            localStorage.setItem(CURRENCY_KEY, action.payload.newCurrency.toString());
            return {
                ...state,
                currency: action.payload.newCurrency,
                purchasedUpgrades: action.payload.newUpgrades
            };
        case 'UPDATE_COMPANION_BEHAVIOR': {
            if (!state.playerState) return state;
            const { companionName, behavior } = action.payload;
            const updatedParty = state.playerState.party.map(c => 
                c.name === companionName ? { ...c, behavior } : c
            );
            return {
                ...state,
                playerState: {
                    ...state.playerState,
                    party: updatedParty
                }
            };
        }
        // --- Debug Actions ---
        case 'DEBUG_SET_STATUS':
            if (!GAME_STATUSES.includes(action.payload)) return state;
            return { ...state, gameStatus: action.payload };

        case 'DEBUG_SET_HP':
            if (!state.playerState) return state;
            return { ...state, playerState: { ...state.playerState, hp: action.payload } };

        case 'DEBUG_SET_ATTRIBUTE':
            if (!state.playerState || !state.playerState.attributes) return state;
            return { ...state, playerState: { ...state.playerState, attributes: { ...state.playerState.attributes, [action.payload.attribute]: action.payload.value } } };
        
        case 'DEBUG_ADD_ITEM':
            if (!state.playerState) return state;
            return { ...state, playerState: { ...state.playerState, inventory: [...state.playerState.inventory, action.payload] } };
            
        case 'DEBUG_FORCE_COMBAT': {
            if (!state.playerState || !state.storyNode) return state;
            const testEnemy: Enemy = {
                name: 'Debug Golem',
                hp: 50,
                maxHp: 50,
                ap: 4,
                maxAp: 4,
                attributes: { strength: 12, dexterity: 8, intelligence: 1, charisma: 1, luck: 5 },
                behavior: 'Follows test protocols.',
                statusEffects: [],
            };
            const combatNode: StoryNode = {
                ...state.storyNode,
                situation: 'A wild Debug Golem appears! It stares at you menacingly, awaiting a command.',
                choices: [],
                enemy: testEnemy,
                isGameOver: false,
            };
            const newPlayerState = { ...state.playerState, ap: state.playerState.maxAp };
            return { ...state, gameStatus: 'in_combat', storyNode: combatNode, playerState: newPlayerState };
        }

        case 'DEBUG_GAME_OVER':
            localStorage.removeItem(SAVE_KEY);
            return { 
                ...state, 
                gameStatus: 'game_over', 
                gameOverMessage: action.payload, 
                lastRunStats: { 
                    turns: state.playerState?.turn ?? 0, 
                    difficulty: state.playerState?.worldDifficulty ?? 0,
                    initialCurrency: state.currency 
                },
                storyNode: null, 
                playerState: null, 
                isLoading: false,
                isGeneratingImage: false,
                currentImageUrl: null,
                hasSaveGame: false,
                diceRollInfo: null,
                completedJourney: null,
            };

        default:
            return state;
    }
}

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(gameReducer, initialState);
    const { language } = useLanguage();
    const { narrativeMode, imageGenerationEnabled, narrationEnabled, soundEnabled, isPremium } = useSettings();

    const playSoundIfEnabled = (name: SoundName) => {
        if (soundEnabled) {
            playSound(name);
        }
    }

    const settingsRef = useRef({ language, narrativeMode, imageGenerationEnabled, narrationEnabled, soundEnabled, isPremium });
    useEffect(() => {
        settingsRef.current = { language, narrativeMode, imageGenerationEnabled, narrationEnabled, soundEnabled, isPremium };
    }, [language, narrativeMode, imageGenerationEnabled, narrationEnabled, soundEnabled, isPremium]);

    useEffect(() => {
      dispatch({ type: 'SET_STATUS', payload: 'intro' });
      return () => {
         if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
      }
    }, []);

    useEffect(() => {
        const checkSaveGame = () => {
             const hasSave = !!localStorage.getItem(SAVE_KEY);
             if (hasSave !== state.hasSaveGame) {
                 dispatch({ type: 'RESTART_GAME' });
             }
        }
        checkSaveGame();
    }, [state.gameStatus]);


    const handleImageGeneration = async (situation: string) => {
        dispatch({ type: 'SET_IMAGE_GENERATING', payload: true });
        dispatch({ type: 'SET_IMAGE_URL', payload: null });
        const imageUrl = await generateSceneryImage(situation);
        if (imageUrl) {
            dispatch({ type: 'SET_IMAGE_URL', payload: imageUrl });
        }
        dispatch({ type: 'SET_IMAGE_GENERATING', payload: false });
    }
    
    const fetchNextNode = useCallback(async (playerChoiceText: string) => {
        if (!state.storyNode || !state.playerState) return;

        dispatch({ type: 'SET_LOADING', payload: true });
        dispatch({ type: 'SET_IMAGE_URL', payload: null });

        const nextNode = await generateStoryStep({
            scenario: null,
            previousSituation: state.storyNode.situation,
            playerState: state.playerState,
            playerChoiceText: playerChoiceText,
            language: settingsRef.current.language,
            narrativeMode: settingsRef.current.narrativeMode,
            history: state.playerState.history,
            upgrades: null,
            characterDescription: state.characterDescription,
        });
        
        if (nextNode.isGameOver && nextNode.playerState) {
            const finalStats = { turns: nextNode.playerState.turn, difficulty: nextNode.playerState.worldDifficulty };
            dispatch({ type: 'GAME_OVER', payload: { message: nextNode.situation, stats: finalStats }});
            
            const difficultyMultiplier = 1 + (finalStats.difficulty / 10);
            const earned = Math.floor(finalStats.turns * 5 * difficultyMultiplier);
            dispatch({ type: 'ADD_CURRENCY', payload: earned });

            if (settingsRef.current.narrationEnabled) speak(nextNode.situation, settingsRef.current.language);
            if (settingsRef.current.soundEnabled) playSound('gameOver');
        } else {
            if (nextNode.playerState) {
                const updatedHistory = [...state.playerState.history, nextNode.situation].slice(-3);
                nextNode.playerState.history = updatedHistory;
            }
            dispatch({ type: 'UPDATE_NODE', payload: nextNode });
            if (settingsRef.current.narrationEnabled) {
                speak(nextNode.situation, settingsRef.current.language);
            }
            if (nextNode.generateImage && settingsRef.current.imageGenerationEnabled && !nextNode.enemy) {
                handleImageGeneration(nextNode.situation);
            }
        }
    }, [state.storyNode, state.playerState, state.characterDescription]);

    const executeCombatTurn = useCallback(async (actions: CombatAction[]) => {
        if (!state.playerState || !state.storyNode?.enemy) return;
        if (window.speechSynthesis) window.speechSynthesis.cancel();
        playSoundIfEnabled('combatHit');
        
        dispatch({ type: 'SET_LOADING', payload: true });

        const combatResult = await generateCombatTurn(
            state.playerState,
            state.storyNode.enemy,
            actions,
            settingsRef.current.language,
            settingsRef.current.narrativeMode
        );

        if (combatResult) {
            dispatch({ type: 'COMBAT_UPDATE', payload: combatResult });
             if (settingsRef.current.narrationEnabled) {
                speak(combatResult.combatLog, settingsRef.current.language);
            }
        } else {
            // Handle error case
            dispatch({ type: 'SET_LOADING', payload: false });
        }

    }, [state.playerState, state.storyNode?.enemy, soundEnabled]);


    const startBriefing = useCallback(async () => {
        if (!state.characterDescription || !state.selectedScenario) {
            console.error("Cannot start briefing without a character description and selected scenario.");
            dispatch({ type: 'SET_LOADING', payload: false });
            return;
        }
        
        const node = await generateStoryStep({
            scenario: state.selectedScenario,
            previousSituation: null,
            playerState: null,
            playerChoiceText: null,
            language: settingsRef.current.language,
            narrativeMode: settingsRef.current.narrativeMode,
            history: [],
            upgrades: state.purchasedUpgrades,
            characterDescription: state.characterDescription,
        });

        if (node.playerState) {
            const hpUpgradeLevel = state.purchasedUpgrades['hp_boost'] || 0;
            const baseHp = node.playerState.hp;
            node.playerState.hp = baseHp + (hpUpgradeLevel * 5);
            node.playerState.maxHp = baseHp + (hpUpgradeLevel * 5);

            const potionUpgradeLevel = state.purchasedUpgrades['start_potion'] || 0;
            if (potionUpgradeLevel > 0) {
                node.playerState.inventory.push("Health Potion");
            }

            const strUpgradeLevel = state.purchasedUpgrades['str_boost'] || 0;
            node.playerState.attributes.strength += strUpgradeLevel;

            const intUpgradeLevel = state.purchasedUpgrades['int_boost'] || 0;
            node.playerState.attributes.intelligence += intUpgradeLevel;

            const luckUpgradeLevel = state.purchasedUpgrades['luck_boost'] || 0;
            node.playerState.attributes.luck += luckUpgradeLevel;

            node.playerState.history = [node.situation];
        }
        dispatch({ type: 'START_BRIEFING', payload: node });

        if (settingsRef.current.narrationEnabled) {
            speak(node.situation, settingsRef.current.language);
        }
        if (node.generateImage && settingsRef.current.imageGenerationEnabled) {
            handleImageGeneration(node.situation);
        }

    }, [state.purchasedUpgrades, state.characterDescription, state.selectedScenario]);

    const makeChoice = useCallback(async (choiceText: string) => {
        if (window.speechSynthesis) window.speechSynthesis.cancel();
        playSoundIfEnabled('click');
        fetchNextNode(choiceText);
    }, [fetchNextNode, soundEnabled]);

    const startDiceRoll = useCallback((rollInfo: DiceRollInfo) => {
        if (window.speechSynthesis) window.speechSynthesis.cancel();
        dispatch({ type: 'START_DICE_ROLL', payload: rollInfo });
    }, []);

    const resolveDiceRoll = useCallback(async (outcome: 'success' | 'failure') => {
        if (!state.diceRollInfo) return;
        const resultText = `The player attempted to '${state.diceRollInfo.text}' and they ${outcome === 'success' ? 'SUCCEEDED' : 'FAILED'}.`;
        fetchNextNode(resultText);
    }, [fetchNextNode, state.diceRollInfo]);

    useEffect(() => {
        if (state.gameStatus === 'world_briefing' && state.isLoading) {
            startBriefing();
        }
    }, [state.gameStatus, state.isLoading, startBriefing]);

    const saveGame = useCallback(() => {
        if (state.playerState && state.storyNode && (state.gameStatus === 'playing' || state.gameStatus === 'in_combat')) {
            const saveData = { 
                playerState: state.playerState, 
                storyNode: state.storyNode, 
                currentImageUrl: state.currentImageUrl,
                characterPortraitUrl: state.characterPortraitUrl,
             };
            localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
            playSoundIfEnabled('save');
        }
    }, [state.playerState, state.storyNode, state.gameStatus, state.currentImageUrl, state.characterPortraitUrl, soundEnabled]);

    const loadGame = useCallback(() => {
        if (window.speechSynthesis) window.speechSynthesis.cancel();
        const savedDataJSON = localStorage.getItem(SAVE_KEY);
        if (savedDataJSON) {
            const savedData = JSON.parse(savedDataJSON);

            const { playerState, storyNode } = savedData;
            
            // Backwards compatibility for saves
            if (playerState.party && playerState.party.length > 0 && (typeof playerState.party[0] === 'string' || !(playerState.party[0] as Companion).behavior)) {
                playerState.party = (playerState.party as any[]).map((c: any): Companion => {
                    const isString = typeof c === 'string';
                    return {
                        name: isString ? c : c.name || 'Companion',
                        title: isString ? 'Companion' : c.title || 'Companion',
                        hp: isString ? 25 : c.hp || 25,
                        maxHp: isString ? 25 : c.maxHp || 25,
                        personality: isString ? 'Unknown' : c.personality || 'Unknown',
                        ability: isString ? 'Contributes to fights.' : c.ability || 'Contributes to fights.',
                        statusEffects: isString ? [] : c.statusEffects || [],
                        behavior: isString ? 'Aggressive' : c.behavior || 'Aggressive'
                    };
                });
            } else if (!playerState.party) {
                playerState.party = [];
            }

            if (!playerState.history) playerState.history = [];
            if (!playerState.characterDescription) playerState.characterDescription = "A person of mysterious origins.";
            if (!playerState.storySummary) playerState.storySummary = "Survive and uncover the mysteries of this world.";
            if (!playerState.plotPoints) playerState.plotPoints = [{ text: "Survive and rediscover your purpose.", completed: false }];
            if (!playerState.statusEffects) playerState.statusEffects = [];
            if (!playerState.worldContext) playerState.worldContext = "A standard fantasy world with swords and magic.";
            if (playerState.currentStance) delete playerState.currentStance;
            if (playerState.moves) delete playerState.moves;
            if (!playerState.ap) playerState.ap = 4;
            if (!playerState.maxAp) playerState.maxAp = 4;
            if (!playerState.maxHp) playerState.maxHp = playerState.hp;

            if (storyNode.enemy) {
                if (!storyNode.enemy.ap) storyNode.enemy.ap = 4;
                if (!storyNode.enemy.maxAp) storyNode.enemy.maxAp = 4;
                 if (!storyNode.enemy.statusEffects) storyNode.enemy.statusEffects = [];
            }
            
            dispatch({ type: 'LOAD_GAME', payload: savedData });
            playSoundIfEnabled('click');
        }
    }, [soundEnabled]);

    const startTutorial = useCallback(() => {
        if (window.speechSynthesis) window.speechSynthesis.cancel();
        playSoundIfEnabled('click');
        dispatch({ type: 'START_TUTORIAL', payload: { isPremium } });
    }, [soundEnabled, isPremium]);

    const endTutorial = useCallback(() => {
        playSoundIfEnabled('click');
        dispatch({ type: 'END_TUTORIAL', payload: { isPremium } });
    }, [isPremium, soundEnabled]);

    const selectScenario = useCallback((scenario: Scenario) => {
        playSoundIfEnabled('click');
        dispatch({ type: 'SELECT_SCENARIO', payload: scenario });
    }, [soundEnabled]);

    const saveCompletedJourneyToLibrary = useCallback((): boolean => {
        if (state.completedJourney) {
            const now = new Date();
            const newJourney: SavedJourney = {
                ...state.completedJourney,
                id: now.toISOString(),
                date: now.toLocaleString(),
            };
            journeyManager.addJourney(newJourney);
            playSoundIfEnabled('save');
            return true;
        }
        return false;
    }, [state.completedJourney, soundEnabled]);
    
    const buyItem = (item: ShopItem, newUpgrades: PurchasedUpgrades, newCurrency: number) => {
        playSoundIfEnabled('purchase');
        dispatch({ type: 'BUY_ITEM', payload: { item, newUpgrades, newCurrency } });
    };

    const updateCompanionBehavior = useCallback((companionName: string, behavior: CompanionBehavior) => {
        dispatch({ type: 'UPDATE_COMPANION_BEHAVIOR', payload: { companionName, behavior } });
    }, []);

    const value = { state, dispatch, makeChoice, saveGame, loadGame, startTutorial, endTutorial, selectScenario, startDiceRoll, resolveDiceRoll, saveCompletedJourneyToLibrary, executeCombatTurn, buyItem, updateCompanionBehavior };

    return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export const useGame = (): GameContextType => {
    const context = useContext(GameContext);
    if (context === undefined) {
        throw new Error('useGame must be used within a GameProvider');
    }
    return context;
};
