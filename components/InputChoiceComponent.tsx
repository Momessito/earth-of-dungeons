
import React, { useState } from 'react';
import { Choice } from '../types.ts';

interface InputChoiceProps {
  choice: Extract<Choice, { type: 'input' }>;
  onSubmit: (value: string) => void;
  disabled: boolean;
}

const InputChoiceComponent: React.FC<InputChoiceProps> = ({ choice, onSubmit, disabled }) => {
  const [value, setValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onSubmit(value.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 items-center">
      <label htmlFor="player-input" className="sr-only">{choice.text}</label>
      <input
        id="player-input"
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={choice.placeholder || choice.text}
        disabled={disabled}
        className="w-full p-4 border rounded-lg transition-all duration-200 ease-in-out bg-gray-800 bg-opacity-80 border-gray-700 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50"
        autoComplete="off"
      />
      <button
        type="submit"
        disabled={disabled || !value.trim()}
        className="w-full sm:w-auto px-6 py-4 bg-red-800 text-white font-bold rounded-lg hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-500 focus:ring-opacity-50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Submit
      </button>
    </form>
  );
};

export default InputChoiceComponent;