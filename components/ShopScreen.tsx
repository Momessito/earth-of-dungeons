

import React from 'react';
import { useGame } from '../GameContext.tsx';
import { useLanguage } from '../LanguageContext.tsx';
import { translations } from '../translations.ts';
import { ShopItem } from '../types.ts';
import { motion } from 'framer-motion';

const SHOP_ITEMS: ShopItem[] = [
    {
        id: 'hp_boost',
        nameKey: 'shop_item_hp_name',
        descriptionKey: 'shop_item_hp_desc',
        cost: 100,
        maxLevel: 5,
    },
    {
        id: 'start_potion',
        nameKey: 'shop_item_potion_name',
        descriptionKey: 'shop_item_potion_desc',
        cost: 250,
        maxLevel: 1,
    },
    {
        id: 'str_boost',
        nameKey: 'shop_item_strength_name',
        descriptionKey: 'shop_item_strength_desc',
        cost: 150,
        maxLevel: 3,
    },
    {
        id: 'int_boost',
        nameKey: 'shop_item_intellect_name',
        descriptionKey: 'shop_item_intellect_desc',
        cost: 150,
        maxLevel: 3,
    },
    {
        id: 'luck_boost',
        nameKey: 'shop_item_luck_name',
        descriptionKey: 'shop_item_luck_desc',
        cost: 150,
        maxLevel: 3,
    }
]

const screenVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut", staggerChildren: 0.1 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3, ease: "easeIn" } }
} as const;

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
};


const ShopScreen: React.FC = () => {
    const { state, buyItem, dispatch } = useGame();
    const { currency, purchasedUpgrades } = state;
    const { language } = useLanguage();
    const t = translations[language];

    const handleBuyItem = (item: ShopItem) => {
        const currentLevel = purchasedUpgrades[item.id] || 0;
        const canAfford = currency >= item.cost;
        const canLevelUp = !item.maxLevel || currentLevel < item.maxLevel;

        if (canAfford && canLevelUp) {
            const newCurrency = currency - item.cost;
            const newUpgrades = { ...purchasedUpgrades, [item.id]: currentLevel + 1 };
            buyItem(item, newUpgrades, newCurrency);
        }
    };

    return (
        <motion.div 
            className="bg-gray-900 bg-opacity-80 backdrop-blur-sm p-8 rounded-xl shadow-2xl w-full max-w-2xl mx-auto"
            variants={screenVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
        >
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold font-serif text-amber-200">{t.shop_title}</h2>
                <button onClick={() => dispatch({ type: 'SET_STATUS', payload: 'start_menu' })} className="px-4 py-2 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors">
                    {t.shop_back_to_menu}
                </button>
            </div>

            <div className="text-right mb-6">
                <p className="text-xl font-bold text-yellow-300">{t.shop_your_echoes} {currency}</p>
            </div>

            <motion.div className="space-y-4" variants={screenVariants}>
                {SHOP_ITEMS.map(item => {
                    const currentLevel = purchasedUpgrades[item.id] || 0;
                    const isMaxLevel = item.maxLevel && currentLevel >= item.maxLevel;
                    const canAfford = currency >= item.cost;
                    
                    return (
                        <motion.div 
                            key={item.id} 
                            className="bg-gray-800/50 p-4 rounded-lg flex justify-between items-center gap-4"
                            variants={itemVariants}
                        >
                            <div>
                                <h3 className="text-lg font-bold text-amber-300">{t[item.nameKey]}</h3>
                                <p className="text-sm text-gray-400">{t[item.descriptionKey]}</p>
                                {item.maxLevel && <p className="text-xs text-gray-500">Level: {currentLevel}/{item.maxLevel}</p>}
                            </div>
                            <button
                                onClick={() => handleBuyItem(item)}
                                disabled={isMaxLevel || !canAfford}
                                className="px-4 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed whitespace-nowrap"
                            >
                                {isMaxLevel ? t.shop_max_level : t.shop_buy_button.replace('{cost}', item.cost.toString())}
                            </button>
                        </motion.div>
                    )
                })}
            </motion.div>
        </motion.div>
    );
};

export default ShopScreen;