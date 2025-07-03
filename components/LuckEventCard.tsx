
import React from 'react';
import { LuckEvent } from '../types.ts';

interface LuckEventCardProps {
    event: LuckEvent;
}

const eventStyles = {
    positive: {
        borderColor: 'border-green-400',
        shadowColor: 'shadow-green-500/30',
        icon: '✨',
    },
    negative: {
        borderColor: 'border-red-500',
        shadowColor: 'shadow-red-500/30',
        icon: '💀',
    },
    neutral: {
        borderColor: 'border-gray-500',
        shadowColor: 'shadow-gray-400/20',
        icon: '🌀',
    },
};

const LuckEventCard: React.FC<LuckEventCardProps> = ({ event }) => {
    const styles = eventStyles[event.type] || eventStyles.neutral;

    return (
        <div className={`mb-6 p-4 rounded-lg border-2 bg-gray-800/60 animate-fade-in shadow-lg ${styles.borderColor} ${styles.shadowColor}`}>
            <div className="flex items-center gap-4">
                <div className="text-3xl">{styles.icon}</div>
                <div>
                    <h3 className="font-bold text-lg font-cinzel text-amber-200">{event.title}</h3>
                    <p className="text-gray-300">{event.description}</p>
                </div>
            </div>
        </div>
    );
};

export default LuckEventCard;
