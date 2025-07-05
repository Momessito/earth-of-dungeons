
import React, { useState } from 'react';
import { useLanguage } from './LanguageContext.tsx';
import { translations } from './translations.ts';
import { useGame } from './GameContext.tsx';
import { motion, AnimatePresence } from 'framer-motion';
import SettingsModal from './components/SettingsModal.tsx';

const screenVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3, ease: "easeIn" } }
} as const;

interface MenuButtonProps {
    onClick: () => void;
    disabled: boolean;
    children: React.ReactNode;
    isPrimary?: boolean;
}

const MenuButton: React.FC<MenuButtonProps> = ({ onClick, disabled, children, isPrimary }) => {
    const primaryClasses = "bg-red-800/80 border-amber-400 text-2xl py-4 shadow-lg hover:shadow-red-500/50";
    const secondaryClasses = "bg-black/40 border-gray-600 text-lg py-2 hover:bg-black/60 hover:border-gray-500";

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`w-full font-cinzel tracking-wider border-2 text-white font-bold rounded-md focus:outline-none focus:ring-4 focus:ring-amber-500 focus:ring-opacity-50 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-wait ${isPrimary ? primaryClasses : secondaryClasses}`}
        >
             {children}
        </button>
    )
}


const StartMenu: React.FC = () => {
  const { language } = useLanguage();
  const { state, loadGame, startTutorial, dispatch } = useGame();
  const { isLoading, hasSaveGame } = state;
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const t = translations[language];

  return (
    <>
    <motion.div 
      className="flex flex-col justify-center items-center text-center w-full min-h-screen py-8 px-4"
      variants={screenVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
        <div className="w-full max-w-md">
            <h1 className="font-cinzel text-6xl md:text-7xl font-bold text-amber-300 mb-2 tracking-widest" style={{ textShadow: '0 0 15px rgba(252, 211, 77, 0.5), 0 0 5px rgba(0,0,0,0.5)'}}>
                {t.title}
            </h1>
            <p className="text-lg text-amber-100 mb-12 tracking-wider">
                {t.description}
            </p>

            <motion.div 
                className="flex flex-col items-center gap-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { delay: 0.2, staggerChildren: 0.1 } }}
            >
                <MenuButton onClick={startTutorial} disabled={isLoading} isPrimary>
                    {isLoading ? t.summoningWorld : t.beginJourney}
                </MenuButton>

                {hasSaveGame && (
                    <MenuButton onClick={() => loadGame()} disabled={isLoading}>
                        {t.load_game}
                    </MenuButton>
                )}
                 <MenuButton onClick={() => dispatch({ type: 'SET_STATUS', payload: 'game_library' })} disabled={isLoading}>
                    {t.library_button}
                </MenuButton>
                <MenuButton onClick={() => dispatch({ type: 'SET_STATUS', payload: 'shop' })} disabled={isLoading}>
                    {t.shop_button}
                </MenuButton>
                <MenuButton onClick={() => setIsSettingsOpen(true)} disabled={isLoading}>
                    {t.settings_button}
                </MenuButton>
            </motion.div>
        </div>
    </motion.div>

    <AnimatePresence>
        {isSettingsOpen && <SettingsModal onClose={() => setIsSettingsOpen(false)} />}
    </AnimatePresence>
    </>
  );
};

export default StartMenu;
