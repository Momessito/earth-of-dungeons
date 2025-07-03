

import React from 'react';
import { Choice } from '../types.ts';
import { useGame } from '../GameContext.tsx';
import { useLanguage } from '../LanguageContext.tsx';
import { translations } from '../translations.ts';
import LoadingSpinner from './LoadingSpinner.tsx';
import ChoiceButton from './ChoiceButton.tsx';
import InteractiveText from './InteractiveText.tsx';
import InputChoiceComponent from './InputChoiceComponent.tsx';
import LuckEventCard from './LuckEventCard.tsx';

const GameScreen: React.FC = () => {
  const { 
    state, 
    makeChoice,
    startDiceRoll
  } = useGame();
  const { storyNode, isLoading, isGeneratingImage, currentImageUrl } = state;
  const { language } = useLanguage();
  const t = translations[language];

  if (isLoading && !storyNode) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <LoadingSpinner />
        <p className="text-gray-300 mt-4 text-lg">{t.summoningWorld}</p>
      </div>
    );
  }

  if (!storyNode) {
     return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <LoadingSpinner />
        <p className="text-gray-300 mt-4 text-lg">{t.writingDestiny}</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 bg-opacity-75 backdrop-blur-md p-6 sm:p-8 rounded-b-xl shadow-2xl w-full max-w-3xl mx-auto transition-opacity duration-500 ease-in-out">
      
      {storyNode.luckEvent && (
        <LuckEventCard event={storyNode.luckEvent} />
      )}

      {isGeneratingImage && (
        <div className="mb-4 text-center p-4 bg-gray-800/50 rounded-lg animate-pulse">
          <p className="text-amber-300">{t.generating_image}</p>
        </div>
      )}

      {currentImageUrl && !isGeneratingImage && (
        <div className="mb-6 rounded-lg overflow-hidden shadow-lg animate-fade-in text-center">
          <img src={currentImageUrl} alt="A vision of the current scenery" className="w-full h-auto object-cover"/>
           <p className="text-xs text-gray-500 italic p-1 bg-black/30">{t.imageDisclaimer}</p>
        </div>
      )}

      <div className="mb-6 min-h-[150px] font-serif text-lg leading-relaxed text-gray-200 prose prose-invert prose-p:my-3 flex items-center justify-center border-t border-b border-gray-700 py-6 relative">
        <div className={`transition-opacity duration-300 w-full ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
          <InteractiveText text={storyNode.situation} highlights={storyNode.highlights || []} />
        </div>
        {isLoading && (
           <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/50">
            <LoadingSpinner />
            <p className="mt-4 text-gray-400">{t.writingDestiny}</p>
           </div>
        )}
      </div>
      
      {!isLoading && (
        <div className={`mt-6 grid grid-cols-1 gap-4 animate-fade-in`}>
          {storyNode.choices.map((choice, index) => {
            if (choice.type === 'input') {
              return (
                <InputChoiceComponent
                  key={index}
                  choice={choice}
                  onSubmit={(value) => makeChoice(value)}
                  disabled={isLoading}
                />
              );
            }
            if (choice.type === 'dice_roll') {
               return (
                  <ChoiceButton
                    key={index}
                    choice={{ type: 'button', text: `[${choice.attribute.slice(0,3).toUpperCase()}] ${choice.text}` }}
                    onClick={() => startDiceRoll(choice)}
                    disabled={isLoading}
                  />
               )
            }
            return (
              <ChoiceButton
                key={index}
                choice={choice}
                onClick={() => makeChoice(choice.text)}
                disabled={isLoading}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default GameScreen;