


import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { NarrativeMode, SettingsContextType } from './types.ts';

const NARRATIVE_MODE_KEY = 'isekai-life-narrative-mode';
const IMAGE_GEN_KEY = 'isekai-life-image-gen-enabled';
const NARRATION_KEY = 'isekai-life-narration-enabled';
const SOUND_KEY = 'isekai-life-sound-enabled';
const PREMIUM_KEY = 'isekai-life-premium-status';


const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const getInitialNarrativeMode = (): NarrativeMode => {
    const savedMode = localStorage.getItem(NARRATIVE_MODE_KEY);
    return (savedMode === 'complete' || savedMode === 'summary') ? savedMode : 'complete';
}

const getInitialImageGeneration = (): boolean => {
    const savedValue = localStorage.getItem(IMAGE_GEN_KEY);
    return savedValue !== 'false'; // Default to true
}

const getInitialNarration = (): boolean => {
    const savedValue = localStorage.getItem(NARRATION_KEY);
    return savedValue === 'true'; // Default to false
}

const getInitialSound = (): boolean => {
    const savedValue = localStorage.getItem(SOUND_KEY);
    return savedValue !== 'false'; // Default to true
}

const getInitialPremium = (): boolean => {
    const savedValue = localStorage.getItem(PREMIUM_KEY);
    return savedValue === 'true'; // Default to false
}


export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [narrativeMode, setNarrativeModeState] = useState<NarrativeMode>(getInitialNarrativeMode);
  const [imageGenerationEnabled, setImageGenerationEnabledState] = useState<boolean>(getInitialImageGeneration);
  const [narrationEnabled, setNarrationEnabledState] = useState<boolean>(getInitialNarration);
  const [soundEnabled, setSoundEnabledState] = useState<boolean>(getInitialSound);
  const [isPremium, setPremiumState] = useState<boolean>(getInitialPremium);
  
  const setNarrativeMode = useCallback((mode: NarrativeMode) => {
    localStorage.setItem(NARRATIVE_MODE_KEY, mode);
    setNarrativeModeState(mode);
  }, []);

  const setImageGenerationEnabled = useCallback((enabled: boolean) => {
    localStorage.setItem(IMAGE_GEN_KEY, String(enabled));
    setImageGenerationEnabledState(enabled);
  }, []);

  const setNarrationEnabled = useCallback((enabled: boolean) => {
    localStorage.setItem(NARRATION_KEY, String(enabled));
    setNarrationEnabledState(enabled);
    if (!enabled && window.speechSynthesis) {
        window.speechSynthesis.cancel();
    }
  }, []);
  
  const setSoundEnabled = useCallback((enabled: boolean) => {
    localStorage.setItem(SOUND_KEY, String(enabled));
    setSoundEnabledState(enabled);
  }, []);

  const setPremium = useCallback((premium: boolean) => {
    localStorage.setItem(PREMIUM_KEY, String(premium));
    setPremiumState(premium);
  }, []);

  const value = {
      narrativeMode,
      setNarrativeMode,
      imageGenerationEnabled,
      setImageGenerationEnabled,
      narrationEnabled,
      setNarrationEnabled,
      soundEnabled,
      setSoundEnabled,
      isPremium,
      setPremium,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};