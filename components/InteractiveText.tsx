

import React, { useState, useRef, useLayoutEffect } from 'react';
import { Highlight } from '../types.ts';
import Tooltip from './Tooltip.tsx';

interface InteractiveTextProps {
  text: string;
  highlights: Highlight[];
}

const InteractiveText: React.FC<InteractiveTextProps> = ({ text, highlights }) => {
  const [activeTooltip, setActiveTooltip] = useState<{ text: string; position: { top: number; left: number } } | null>(null);
  const keywordRefs = useRef<{ [key: string]: HTMLSpanElement | null }>({});

  useLayoutEffect(() => {
    // This effect can be used to reposition the tooltip if the window resizes, etc.
  }, [activeTooltip]);

  const handleKeywordClick = (event: React.MouseEvent<HTMLSpanElement>, keyword: string, description: string) => {
    event.stopPropagation();
    const rect = event.currentTarget.getBoundingClientRect();
    
    const tooltipWidth = 250; // Approximate width of the tooltip, should match Tooltip.tsx max-w
    let left = rect.left + (rect.width / 2) - (tooltipWidth / 2);

    // Adjust if tooltip would go off-screen to the right
    if (left + tooltipWidth > window.innerWidth) {
      left = window.innerWidth - tooltipWidth - 16; // 16px padding from edge
    }
    // Adjust if tooltip would go off-screen to the left
    if (left < 16) {
        left = 16;
    }


    setActiveTooltip({
      text: description,
      position: {
        top: rect.top, // Position relative to viewport top of keyword
        left: left,
      },
    });
  };
  
  const renderText = () => {
    if (!highlights || highlights.length === 0) {
      return <p className="text-justify">{text}</p>;
    }

    const regex = new RegExp(`\\b(${highlights.map(h => h.keyword.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')).join('|')})\\b`, 'gi');
    const parts = text.split(regex);

    return (
      <p className="text-justify">
        {parts.map((part, index) => {
          const highlight = highlights.find(h => h.keyword.toLowerCase() === part.toLowerCase());
          if (highlight) {
            return (
              <span
                key={index}
                ref={el => { keywordRefs.current[highlight.keyword] = el; }}
                className="font-bold text-amber-400 cursor-pointer hover:underline"
                onClick={(e) => handleKeywordClick(e, highlight.keyword, highlight.description)}
              >
                {part}
              </span>
            );
          }
          return <span key={index}>{part}</span>;
        })}
      </p>
    );
  };

  return (
    <div onClick={() => setActiveTooltip(null)}>
      {renderText()}
      {activeTooltip && (
        <Tooltip
          text={activeTooltip.text}
          position={activeTooltip.position}
          onClose={() => setActiveTooltip(null)}
        />
      )}
    </div>
  );
};

export default InteractiveText;