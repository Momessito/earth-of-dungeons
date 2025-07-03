

import React, { createContext, useContext, ReactNode, useReducer, useEffect, useCallback, useRef } from 'react';
import { GameState, Action, StoryNode, PlayerState, Scenario, ShopItem, PurchasedUpgrades, DiceRollInfo, SavedJourney } from './types.ts';
import { useLanguage } from './LanguageContext.tsx';
import { useSettings } from './SettingsContext.tsx';
import { generateStoryStep, generateSceneryImage } from './services/geminiService.ts';
import * as journeyManager from './services/journeyManager.ts';

interface GameContextType {
  state: GameState;
  dispatch: React.Dispatch<Action>;
  makeChoice: (choiceText: string) => void;
  startDiceRoll: (rollInfo: DiceRollInfo) => void;
  resolveDiceRoll: (outcome: 'success' | 'failure') => void;
  finalizeCharacter: (description: string, url: string) => void;
  loadGame: () => void;
  saveGame: () => void;
  startTutorial: () => void;
  saveCompletedJourneyToLibrary: () => boolean;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

const scenarios: Scenario[] = ['king', 'church', 'mages', 'ancestral'];
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
        case 'START_TUTORIAL':
             if (state.tutorialSeen) {
                return { 
                    ...state, 
                    gameStatus: 'world_briefing',
                    isLoading: true,
                    characterDescription: "A traveler of mysterious origins",
                    characterPortraitUrl: null,
                };
            }
            return { ...state, gameStatus: 'tutorial' };
        case 'END_TUTORIAL':
            localStorage.setItem(TUTORIAL_KEY, 'true');
            return { 
                ...state, 
                tutorialSeen: true, 
                gameStatus: 'world_briefing',
                isLoading: true,
                characterDescription: "A traveler of mysterious origins",
                characterPortraitUrl: null,
             };
        case 'START_CHARACTER_CREATION':
            return { ...state, gameStatus: 'character_creation' };
        case 'SET_CHARACTER_DETAILS':
            return { ...state, characterDescription: action.payload.description, characterPortraitUrl: action.payload.url };
        case 'START_BRIEFING':
             return { ...state, storyNode: action.payload, playerState: action.payload.playerState || null, isLoading: false, fullHistory: action.payload.situation ? [action.payload.situation] : [] };
        case 'START_GAME':
            return { ...state, gameStatus: state.storyNode?.enemy ? 'in_combat' : 'playing' };
        case 'START_DICE_ROLL':
            return { ...state, gameStatus: 'dice_rolling', diceRollInfo: action.payload };
        case 'UPDATE_NODE':
            const nextStatus = action.payload.enemy ? 'in_combat' : 'playing';
            return { ...state, gameStatus: nextStatus, storyNode: action.payload, playerState: action.payload.playerState || state.playerState, isLoading: false, diceRollInfo: null, fullHistory: [...state.fullHistory, action.payload.situation] };
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
            };
        case 'ADD_CURRENCY':
            const newCurrency = state.currency + action.payload;
            localStorage.setItem(CURRENCY_KEY, newCurrency.toString());
            return { ...state, currency: newCurrency };
        case 'RESTART_GAME':
            return {
                ...initialState,
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
        default:
            return state;
    }
}

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(gameReducer, initialState);
    const { language } = useLanguage();
    const { narrativeMode, imageGenerationEnabled } = useSettings();

    // Ref to hold latest settings to prevent stale state in async callbacks
    const settingsRef = useRef({ language, narrativeMode, imageGenerationEnabled });
    useEffect(() => {
        settingsRef.current = { language, narrativeMode, imageGenerationEnabled };
    }, [language, narrativeMode, imageGenerationEnabled]);

    useEffect(() => {
      dispatch({ type: 'SET_STATUS', payload: 'intro' });
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
        if (!state.storyNode.enemy) {
          dispatch({ type: 'SET_IMAGE_URL', payload: null });
        }

        const nextNode = await generateStoryStep({
            scenario: null,
            previousSituation: state.storyNode.situation,
            playerState: state.playerState,
            previousEnemy: state.storyNode.enemy || null,
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
        } else {
            if (nextNode.playerState) {
                const updatedHistory = [...state.playerState.history, nextNode.situation].slice(-3);
                nextNode.playerState.history = updatedHistory;
            }
            dispatch({ type: 'UPDATE_NODE', payload: nextNode });
            if (nextNode.generateImage && settingsRef.current.imageGenerationEnabled) {
                handleImageGeneration(nextNode.situation);
            }
        }
    }, [state.storyNode, state.playerState, state.characterDescription]);


    const startBriefing = useCallback(async () => {
        if (!state.characterDescription) {
            console.error("Cannot start briefing without a character description.");
            dispatch({ type: 'SET_LOADING', payload: false });
            return;
        }
        const randomScenario = scenarios[Math.floor(Math.random() * scenarios.length)];
        const node = await generateStoryStep({
            scenario: randomScenario,
            previousSituation: null,
            playerState: null,
            previousEnemy: null,
            playerChoiceText: null,
            language: settingsRef.current.language,
            narrativeMode: settingsRef.current.narrativeMode,
            history: [],
            upgrades: state.purchasedUpgrades,
            characterDescription: state.characterDescription,
        });

        if (node.playerState) {
            const hpUpgradeLevel = state.purchasedUpgrades['hp_boost'] || 0;
            node.playerState.hp += hpUpgradeLevel * 5;

            const potionUpgradeLevel = state.purchasedUpgrades['start_potion'] || 0;
            if (potionUpgradeLevel > 0) {
                node.playerState.inventory.push("Health Potion");
            }
            node.playerState.history = [node.situation];
        }
        dispatch({ type: 'START_BRIEFING', payload: node });
        if (node.generateImage && settingsRef.current.imageGenerationEnabled) {
            handleImageGeneration(node.situation);
        }

    }, [state.purchasedUpgrades, state.characterDescription]);

    const makeChoice = useCallback(async (choiceText: string) => {
        fetchNextNode(choiceText);
    }, [fetchNextNode]);

    const startDiceRoll = useCallback((rollInfo: DiceRollInfo) => {
        dispatch({ type: 'START_DICE_ROLL', payload: rollInfo });
    }, []);

    const resolveDiceRoll = useCallback(async (outcome: 'success' | 'failure') => {
        if (!state.diceRollInfo) return;
        const resultText = `The player attempted to '${state.diceRollInfo.text}' and they ${outcome === 'success' ? 'SUCCEEDED' : 'FAILED'}.`;
        fetchNextNode(resultText);
    }, [fetchNextNode, state.diceRollInfo]);

    const finalizeCharacter = useCallback((description: string, url: string) => {
        dispatch({ type: 'SET_CHARACTER_DETAILS', payload: { description, url } });
        dispatch({ type: 'SET_STATUS', payload: 'world_briefing' });
        dispatch({ type: 'SET_LOADING', payload: true });
    }, []);

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
        }
    }, [state.playerState, state.storyNode, state.gameStatus, state.currentImageUrl, state.characterPortraitUrl]);

    const loadGame = useCallback(() => {
        const savedDataJSON = localStorage.getItem(SAVE_KEY);
        if (savedDataJSON) {
            const savedData = JSON.parse(savedDataJSON);
            if (!savedData.playerState.history) {
                savedData.playerState.history = [];
            }
            if (!savedData.playerState.characterDescription) {
                 savedData.playerState.characterDescription = "A person of mysterious origins.";
            }
            dispatch({ type: 'LOAD_GAME', payload: savedData });
        }
    }, []);

    const startTutorial = useCallback(() => {
        dispatch({ type: 'START_TUTORIAL' });
    }, []);

    const saveCompletedJourneyToLibrary = useCallback((): boolean => {
        if (state.completedJourney) {
            const now = new Date();
            const newJourney: SavedJourney = {
                ...state.completedJourney,
                id: now.toISOString(),
                date: now.toLocaleString(),
            };
            journeyManager.addJourney(newJourney);
            return true;
        }
        return false;
    }, [state.completedJourney]);

    const value = { state, dispatch, makeChoice, saveGame, loadGame, startTutorial, startDiceRoll, resolveDiceRoll, finalizeCharacter, saveCompletedJourneyToLibrary };

    return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export const useGame = (): GameContextType => {
    const context = useContext(GameContext);
    if (context === undefined) {
        throw new Error('useGame must be used within a GameProvider');
    }
    return context;
};