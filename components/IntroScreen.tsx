

import React, { useState, useEffect } from 'react';
import { useLanguage } from '../LanguageContext.tsx';
import { useGame } from '../GameContext.tsx';
import { translations } from '../translations.ts';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettings } from '../SettingsContext.tsx';
import { playSound } from '../services/soundService.ts';

const screenVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } },
  exit: { opacity: 0, transition: { duration: 0.5 } }
};


const IntroScreen: React.FC = () => {
  const { language } = useLanguage();
  const { dispatch } = useGame();
  const { soundEnabled } = useSettings();
  const t = translations[language];
  const [lineIndex, setLineIndex] = useState(0);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const prologue = t.intro_prologue;

    if (lineIndex < prologue.length) {
      const timer = setTimeout(() => {
        setLineIndex(lineIndex + 1);
      }, 2500);
      return () => clearTimeout(timer);
    } else {
      const showButtonTimer = setTimeout(() => {
        setShowButton(true);
      }, 1500);
      return () => clearTimeout(showButtonTimer);
    }
  }, [lineIndex, t.intro_prologue]);
  
  const handleContinue = () => {
    if (soundEnabled) playSound('click');
    dispatch({ type: 'SET_STATUS', payload: 'start_menu' });
  }

  return (
    <motion.div 
      className="flex flex-col items-center justify-center h-full w-full max-w-4xl mx-auto text-center"
      variants={screenVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
        <div className="min-h-[200px] w-full relative font-serif flex items-center justify-center">
            <AnimatePresence>
                {t.intro_prologue.map((line, index) => 
                    index === lineIndex && (
                        <motion.p
                            key={index}
                            className="text-3xl md:text-4xl text-gray-200 absolute w-full left-1/2 -translate-x-1/2"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1 }}
                        >
                            {line}
                        </motion.p>
                    )
                )}
            </AnimatePresence>
      </div>

      <AnimatePresence>
      {showButton && (
        <motion.button
          onClick={handleContinue}
          className="mt-8 px-8 py-3 bg-red-800 text-white font-bold rounded-lg hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-500 focus:ring-opacity-50 transition-colors duration-300"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
        >
          {t.intro_continue}
        </motion.button>
      )}
      </AnimatePresence>
    </motion.div>
  );
};

export default IntroScreen;