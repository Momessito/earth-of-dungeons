
import React from 'react';
import { PlayerAttributes as PlayerAttributesType } from '../types.ts';

const PlayerAttributes: React.FC<{ attributes: PlayerAttributesType, title: string }> = ({ attributes, title }) => (
    <div>
        <h4 className="font-semibold text-amber-300">{title}</h4>
        <div className="grid grid-cols-3 gap-x-4 gap-y-1 text-sm mt-1 text-gray-300">
            <span>STR: {attributes.strength}</span>
            <span>DEX: {attributes.dexterity}</span>
            <span>INT: {attributes.intelligence}</span>
            <span>CHA: {attributes.charisma}</span>
            <span>LUK: {attributes.luck}</span>
        </div>
    </div>
);

export default PlayerAttributes;
