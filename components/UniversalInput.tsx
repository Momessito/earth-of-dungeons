
import React, { useState } from 'react';
import { useGame } from '../GameContext.tsx';
import { useLanguage } from '../LanguageContext.tsx';
import { translations } from '../translations.ts';

const UniversalInput: React.FC = () => {
  const { makeChoice, state: { isLoading } } = useGame();
  const { language } = useLanguage();
  const t = translations[language];

  const [value, setValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim() && !isLoading) {
      makeChoice(value.trim());
      setValue('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t-2 border-amber-600/50 pt-4 mt-4">
      <label htmlFor="universal-input" className="sr-only">{t.universal_input_placeholder}</label>
      <div className="flex flex-col sm:flex-row gap-2 items-center">
        <input
            id="universal-input"
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={t.universal_input_placeholder}
            disabled={isLoading}
            className="w-full p-4 border rounded-lg transition-all duration-200 ease-in-out bg-gray-800 bg-opacity-80 border-gray-700 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50"
            autoComplete="off"
        />
        <button
            type="submit"
            disabled={isLoading || !value.trim()}
            className="w-full sm:w-auto px-6 py-4 bg-amber-800 text-white font-bold rounded-lg hover:bg-amber-700 focus:outline-none focus:ring-4 focus:ring-amber-500 focus:ring-opacity-50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
            Send
        </button>
      </div>
    </form>
  );
};

export default UniversalInput;
