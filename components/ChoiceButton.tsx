
import React from 'react';
import { Choice } from '../types.ts';
import { motion } from 'framer-motion';

interface ChoiceButtonProps {
  choice: Extract<Choice, { type: 'button' }>;
  onClick: () => void;
  disabled: boolean;
  isCombatMove?: boolean;
}

const ChoiceButton: React.FC<ChoiceButtonProps> = ({ choice, onClick, disabled, isCombatMove }) => {

  const baseClasses = "w-full p-4 border rounded-lg transition-colors duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 bg-gray-800 bg-opacity-60 border-gray-700 text-gray-300 hover:bg-yellow-900/30 hover:border-amber-600 hover:text-white focus:ring-amber-500";
  
  const combatClasses = isCombatMove ? 'text-center h-24 flex items-center justify-center font-semibold' : 'text-left';

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${combatClasses}`}
      whileHover={{ scale: disabled ? 1 : 1.03 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <span>{choice.text}</span>
    </motion.button>
  );
};

export default ChoiceButton;