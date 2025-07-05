

import React from 'react';
import { useGame } from './GameContext.tsx';
import StartMenu from './StartMenu.tsx';
import GameScreen from './components/GameScreen.tsx';
import GameOverScreen from './components/GameOverScreen.tsx';
import IntroScreen from './components/IntroScreen.tsx';
import TutorialScreen from './components/TutorialScreen.tsx';
import GameHeader from './components/GameHeader.tsx';
import WorldBriefingScreen from './components/WorldBriefingScreen.tsx';
import ShopScreen from './components/ShopScreen.tsx';
import CombatScreen from './components/CombatScreen.tsx';
import DiceRollScreen from './components/DiceRollScreen.tsx';
import JourneyLibraryScreen from './components/JourneyLibraryScreen.tsx';
import DebugConsole from './components/DebugConsole.tsx';
import { AnimatePresence } from 'framer-motion';
import ScenarioSelectionScreen from './components/ScenarioSelectionScreen.tsx';

const App: React.FC = () => {
  const { state: { gameStatus, gameOverMessage } } = useGame();

  const renderContent = () => {
    switch (gameStatus) {
      case 'tutorial':
        return <TutorialScreen key="tutorial" />;
      case 'scenario_selection':
        return <ScenarioSelectionScreen key="scenario_selection" />;
      case 'shop':
        return <ShopScreen key="shop" />;
      case 'world_briefing':
        return <WorldBriefingScreen key="world_briefing" />;
      case 'intro':
        return <IntroScreen key="intro" />;
      case 'start_menu':
        return <StartMenu key="start_menu" />;
      case 'game_library':
        return <JourneyLibraryScreen key="game_library" />;
      case 'playing':
        return <GameScreen key="playing" />;
      case 'in_combat':
        return <CombatScreen key="in_combat" />;
      case 'dice_rolling':
        return <DiceRollScreen key="dice_rolling" />;
      case 'game_over':
        return <GameOverScreen key="game_over" message={gameOverMessage} />;
      default:
        return <StartMenu key="default" />;
    }
  };

  return (
    <div
      className="bg-cover bg-center bg-fixed min-h-screen text-white flex flex-col items-center justify-start p-2 sm:p-4"
      style={{ backgroundImage: "url('https://eod.vercel.app/map.png')" }}
    >
      <DebugConsole />
      <div className="absolute inset-0 z-1" style={{ background: 'linear-gradient(to top, rgba(12, 15, 26, 1) 0%, rgba(12, 15, 26, 0.7) 30%, transparent 60%)' }}></div>
      
      <div className="relative z-20 w-full max-w-3xl mx-auto flex flex-col h-full">
        {(gameStatus === 'playing' || gameStatus === 'in_combat' || gameStatus === 'world_briefing') && <GameHeader />}
      </div>

      <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col h-full pt-4 flex-grow">
        <main className="flex-grow flex items-center justify-center">
          <AnimatePresence mode="wait">
            {renderContent()}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default App;