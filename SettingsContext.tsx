

import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { NarrativeMode } from './types.ts';

const NARRATIVE_MODE_KEY = 'isekai-life-narrative-mode';
const IMAGE_GEN_KEY = 'isekai-life-image-gen-enabled';

interface SettingsContextType {
  narrativeMode: NarrativeMode;
  setNarrativeMode: (mode: NarrativeMode) => void;
  imageGenerationEnabled: boolean;
  setImageGenerationEnabled: (enabled: boolean) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const getInitialNarrativeMode = (): NarrativeMode => {
    const savedMode = localStorage.getItem(NARRATIVE_MODE_KEY);
    return (savedMode === 'complete' || savedMode === 'summary') ? savedMode : 'complete';
}

const getInitialImageGeneration = (): boolean => {
    const savedValue = localStorage.getItem(IMAGE_GEN_KEY);
    return savedValue !== 'false'; // Default to true
}

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [narrativeMode, setNarrativeModeState] = useState<NarrativeMode>(getInitialNarrativeMode);
  const [imageGenerationEnabled, setImageGenerationEnabledState] = useState<boolean>(getInitialImageGeneration);
  
  const setNarrativeMode = useCallback((mode: NarrativeMode) => {
    localStorage.setItem(NARRATIVE_MODE_KEY, mode);
    setNarrativeModeState(mode);
  }, []);

  const setImageGenerationEnabled = useCallback((enabled: boolean) => {
    localStorage.setItem(IMAGE_GEN_KEY, String(enabled));
    setImageGenerationEnabledState(enabled);
  }, []);

  const value = {
      narrativeMode,
      setNarrativeMode,
      imageGenerationEnabled,
      setImageGenerationEnabled
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