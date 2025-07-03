

import React, { useEffect, useRef } from 'react';

interface TooltipProps {
  text: string;
  position: { top: number; left: number };
  onClose: () => void;
}

const Tooltip: React.FC<TooltipProps> = ({ text, position, onClose }) => {
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Close tooltip if clicking outside of it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    const timerId = setTimeout(() => {
         document.addEventListener('mousedown', handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timerId);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <div
      ref={tooltipRef}
      className="fixed z-50 p-3 text-sm font-sans text-white bg-gray-800 border border-amber-500 rounded-lg shadow-xl max-w-[250px] animate-fade-in"
      style={{ 
        top: position.top, 
        left: position.left,
        transform: 'translateY(-100%) translateY(-8px)' // Move up above keyword
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {text}
    </div>
  );
};

export default Tooltip;