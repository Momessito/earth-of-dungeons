

import React, { useState, useEffect } from 'react';
import { useLanguage } from '../LanguageContext.tsx';
import { useGame } from '../GameContext.tsx';
import { translations } from '../translations.ts';

const IntroScreen: React.FC = () => {
  const { language } = useLanguage();
  const { dispatch } = useGame();
  const t = translations[language];
  const [lineIndex, setLineIndex] = useState(0);
  const [showButton, setShowButton] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);

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
    setIsFadingOut(true);
    setTimeout(() => dispatch({ type: 'SET_STATUS', payload: 'start_menu' }), 500);
  }

  return (
    <div className={`flex flex-col items-center justify-center h-full w-full max-w-4xl mx-auto text-center transition-opacity duration-500 ${isFadingOut ? 'opacity-0' : 'opacity-100'}`}>
        <div className="min-h-[200px] w-full relative font-serif flex items-center justify-center">
            {t.intro_prologue.map((line, index) => (
            <p
                key={index}
                className={`text-3xl md:text-4xl text-gray-200 transition-opacity duration-1000 absolute w-full left-1/2 -translate-x-1/2 ${
                index === lineIndex ? 'opacity-100' : 'opacity-0'
                }`}
            >
                {line}
            </p>
            ))}
      </div>

      {showButton && (
        <button
          onClick={handleContinue}
          className="mt-8 px-8 py-3 bg-red-800 text-white font-bold rounded-lg hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-500 focus:ring-opacity-50 transition-all duration-300 animate-fade-in"
        >
          {t.intro_continue}
        </button>
      )}
    </div>
  );
};

export default IntroScreen;