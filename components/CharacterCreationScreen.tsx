import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useGame } from '../GameContext.tsx';
import { generateCharacterPortrait } from '../services/geminiService.ts';
import LoadingSpinner from './LoadingSpinner.tsx';
import { useLanguage } from '../LanguageContext.tsx';
import { translations } from '../translations.ts';
import { CharacterDetails } from '../types.ts';

// --- Component-specific types and data ---
type Sex = 'Male' | 'Female';

const sexes: { key: Sex; tKey: 'character_creation_male' | 'character_creation_female' }[] = [
    { key: 'Male', tKey: 'character_creation_male' },
    { key: 'Female', tKey: 'character_creation_female' }
];

const ages: { key: string; tKey: 'age_young_adult' | 'age_adult' | 'age_middle_aged' | 'age_elder' }[] = [
    { key: 'Young Adult (18-25)', tKey: 'age_young_adult' },
    { key: 'Adult (26-40)', tKey: 'age_adult' },
    { key: 'Middle-aged (41-60)', tKey: 'age_middle_aged' },
    { key: 'Elder (60+)', tKey: 'age_elder' }
];

const personalities: { key: string; tKey: 'personality_stoic' | 'personality_jovial' | 'personality_cynical' | 'personality_brave' | 'personality_scholarly' }[] = [
    { key: 'Brave', tKey: 'personality_brave' },
    { key: 'Stoic', tKey: 'personality_stoic' },
    { key: 'Jovial', tKey: 'personality_jovial' },
    { key: 'Cynical', tKey: 'personality_cynical' },
    { key: 'Scholarly', tKey: 'personality_scholarly' },
];

const hairStyles: { key: string; tKey: 'hair_style_short_messy' | 'hair_style_long_straight' | 'hair_style_braided' | 'hair_style_top_knot' | 'hair_style_curly_wild' | 'hair_style_bald' | 'hair_style_ponytail' | 'hair_style_undercut' | 'hair_style_buzz_cut' | 'hair_style_wavy_bob' }[] = [
    { key: 'long and straight', tKey: 'hair_style_long_straight' },
    { key: 'short and messy', tKey: 'hair_style_short_messy' },
    { key: 'wavy bob', tKey: 'hair_style_wavy_bob' },
    { key: 'curly and wild', tKey: 'hair_style_curly_wild' },
    { key: 'ponytail', tKey: 'hair_style_ponytail' },
    { key: 'braided', tKey: 'hair_style_braided' },
    { key: 'top-knot', tKey: 'hair_style_top_knot' },
    { key: 'undercut', tKey: 'hair_style_undercut' },
    { key: 'buzz cut', tKey: 'hair_style_buzz_cut' },
    { key: 'bald', tKey: 'hair_style_bald' },
];

const skinTones = ['#8d5524', '#c68642', '#e0ac69', '#f1c27d', '#ffdbac', '#5c3811', '#281801'];
const hairColors = ['#090806', '#2C1B18', '#B88663', '#F8DE7E', '#D34B3D', '#E9E4D4', '#6F6F6F'];
const eyeColors = ['#664228', '#2E5A88', '#5A8B28', '#A9A9A9', '#E6C975'];

// --- Reusable Child Components ---
const OptionButton: React.FC<{ onClick: () => void; isActive: boolean; children: React.ReactNode, disabled?: boolean }> = ({ onClick, isActive, children, disabled }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`px-4 py-2 text-sm rounded-md font-semibold transition-all duration-200 disabled:opacity-50 ${isActive ? 'bg-amber-600 text-white shadow-lg scale-105' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}`}
    >
        {children}
    </button>
);

const ColorSwatch: React.FC<{ color: string; onClick: () => void; isActive: boolean, disabled?: boolean }> = ({ color, onClick, isActive, disabled }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`w-8 h-8 rounded-full transition-all duration-200 border-2 ${isActive ? 'border-white scale-110' : 'border-transparent hover:border-gray-400'} disabled:opacity-50`}
        style={{ backgroundColor: color }}
        aria-label={`Select color ${color}`}
    />
);


// --- Main Component ---
const CharacterCreationScreen: React.FC = () => {
    const { finalizeCharacter } = useGame();
    const { language } = useLanguage();
    const t = translations[language];
    
    const [sex, setSex] = useState<Sex>('Female');
    const [age, setAge] = useState<string>(ages[0].key);
    const [personality, setPersonality] = useState<string>(personalities[0].key);
    const [skinTone, setSkinTone] = useState(skinTones[2]);
    const [hairStyle, setHairStyle] = useState<string>(hairStyles[0].key);
    const [hairColor, setHairColor] = useState(hairColors[1]);
    const [eyeColor, setEyeColor] = useState(eyeColors[1]);
    
    const [portraitUrl, setPortraitUrl] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(true);
    const [isCooldown, setIsCooldown] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const cooldownTimer = useRef<number | null>(null);

    const characterDescription = useMemo(() => {
        return `${age}, ${sex.toLowerCase()} human with a ${personality.toLowerCase()} demeanor, skin tone of ${skinTone}, ${eyeColor} eyes, and ${hairColor} hair styled as ${hairStyle}.`;
    }, [sex, age, personality, skinTone, hairStyle, hairColor, eyeColor]);

    const handleGeneratePortrait = useCallback(async () => {
        setIsGenerating(true);
        setError(null);
        
        const details: CharacterDetails = {
            sex,
            age,
            personality,
            skinTone,
            hairStyle,
            hairColor,
            eyeColor,
        };
        try {
            const url = await generateCharacterPortrait(details);
            if (url) {
                setPortraitUrl(url);
            } else {
                setError(t.character_creation_error);
            }
        } catch (e) {
            setError(t.character_creation_error_generic);
            console.error(e);
        } finally {
            setIsGenerating(false);
            setIsCooldown(true);
            if (cooldownTimer.current) {
                clearTimeout(cooldownTimer.current);
            }
            cooldownTimer.current = window.setTimeout(() => {
                setIsCooldown(false);
            }, 5000); // 5-second cooldown
        }
    }, [sex, age, personality, skinTone, hairStyle, hairColor, eyeColor, t]);

    useEffect(() => {
        handleGeneratePortrait();
    }, []); // Generate default portrait on mount

    // Cleanup timer on unmount
    useEffect(() => {
        return () => {
            if (cooldownTimer.current) {
                clearTimeout(cooldownTimer.current);
            }
        };
    }, []);

    const handleConfirm = () => {
        if (portraitUrl) {
            finalizeCharacter(characterDescription, portraitUrl);
        }
    };
    
    const renderSection = (title: string, children: React.ReactNode) => (
        <div className="space-y-3">
            <h3 className="font-semibold text-lg text-amber-200">{title}</h3>
            {children}
        </div>
    );

    const isButtonDisabled = isGenerating || isCooldown;

    return (
        <div className="bg-gray-900 bg-opacity-80 backdrop-blur-md p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-5xl mx-auto animate-fade-in">
            <h2 className="text-3xl font-bold font-serif text-center mb-6 text-amber-100">{t.character_creation_title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Side - Options */}
                <div className="md:col-span-2 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {renderSection(t.character_creation_sex, <div className="flex flex-wrap gap-2">{sexes.map(s => <OptionButton key={s.key} onClick={() => setSex(s.key)} isActive={sex === s.key} disabled={isButtonDisabled}>{t[s.tKey]}</OptionButton>)}</div>)}
                        {renderSection(t.character_creation_age, <div className="flex flex-wrap gap-2">{ages.map(a => <OptionButton key={a.key} onClick={() => setAge(a.key)} isActive={age === a.key} disabled={isButtonDisabled}>{t[a.tKey]}</OptionButton>)}</div>)}
                    </div>
                    {renderSection(t.character_creation_personality, <div className="flex flex-wrap gap-2">{personalities.map(p => <OptionButton key={p.key} onClick={() => setPersonality(p.key)} isActive={personality === p.key} disabled={isButtonDisabled}>{t[p.tKey]}</OptionButton>)}</div>)}
                    {renderSection(t.character_creation_skin_tone, <div className="flex flex-wrap gap-2">{skinTones.map(s => <ColorSwatch key={s} color={s} onClick={() => setSkinTone(s)} isActive={skinTone === s} disabled={isButtonDisabled}/>)}</div>)}
                    {renderSection(t.character_creation_hair_style, <div className="flex flex-wrap gap-2">{hairStyles.map(s => <OptionButton key={s.key} onClick={() => setHairStyle(s.key)} isActive={hairStyle === s.key} disabled={isButtonDisabled}>{t[s.tKey]}</OptionButton>)}</div>)}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {renderSection(t.character_creation_hair_color, <div className="flex flex-wrap gap-2">{hairColors.map(s => <ColorSwatch key={s} color={s} onClick={() => setHairColor(s)} isActive={hairColor === s} disabled={isButtonDisabled}/>)}</div>)}
                        {renderSection(t.character_creation_eye_color, <div className="flex flex-wrap gap-2">{eyeColors.map(s => <ColorSwatch key={s} color={s} onClick={() => setEyeColor(s)} isActive={eyeColor === s} disabled={isButtonDisabled}/>)}</div>)}
                    </div>
                </div>

                {/* Right Side - Portrait & Actions */}
                <div className="flex flex-col items-center justify-between gap-4">
                    <div className="w-full aspect-square bg-gray-800/50 rounded-lg flex items-center justify-center border-2 border-gray-700 overflow-hidden relative">
                        {portraitUrl && <img src={portraitUrl} alt="Character Portrait" className="w-full h-full object-cover transition-opacity duration-300" style={{ opacity: isGenerating ? 0.5 : 1 }} />}
                        {isGenerating && <div className="absolute inset-0 flex items-center justify-center"><LoadingSpinner /></div>}
                        {!isGenerating && !portraitUrl && error && <p className="text-red-400 text-center p-4">{error}</p>}
                    </div>
                    <div className="w-full flex flex-col gap-3">
                        <button onClick={handleGeneratePortrait} disabled={isButtonDisabled} className="w-full px-6 py-3 bg-gray-600 text-white font-bold rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-4 focus:ring-gray-500 transition-colors disabled:opacity-50 disabled:cursor-wait">
                            {isGenerating ? t.character_creation_generating : (isCooldown ? t.character_creation_cooldown : t.character_creation_regenerate)}
                        </button>
                         <button onClick={handleConfirm} disabled={!portraitUrl || isButtonDisabled} className="w-full px-6 py-4 bg-red-800 text-white font-bold text-lg rounded-lg hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-500 transition-colors disabled:bg-red-900/50 disabled:cursor-not-allowed">
                            {t.character_creation_begin_journey}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CharacterCreationScreen;