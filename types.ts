


export type CompanionBehavior = 'Aggressive' | 'Defensive' | 'Support';

export interface Companion {
  name: string;
  title: string;
  hp: number;
  maxHp: number;
  personality: string; // e.g., "Brave", "Greedy", "Cautious"
  ability: string; // e.g., "Can create a magical shield once per day."
  statusEffects: StatusEffect[];
  behavior: CompanionBehavior;
}

export interface PlayerAttributes {
    strength: number;
    dexterity: number;
    intelligence: number;
    charisma: number;
    luck: number;
}

export interface StatusEffect {
    type: string; // e.g., "Bleeding", "Stunned", "Guarded"
    duration: number; // in turns
}

export interface PlayerState {
  attributes: PlayerAttributes;
  hp: number;
  maxHp: number;
  ap: number;
  maxAp: number;
  inventory: string[];
  party: Companion[];
  approach: 'solo' | 'party' | 'army';
  turn: number;
  worldDifficulty: number;
  history: string[];
  characterDescription: string | null;
  storySummary: string; // The overall goal
  plotPoints: { text: string; completed: boolean; }[]; // The step-by-step path to the goal
  statusEffects: StatusEffect[];
  worldContext: string; // A short description of the world's core rules and theme.
}

export type Choice = {
    type: 'button';
    text: string;
} | {
    type: 'input';
    text: string; // The prompt for the input
    placeholder?: string;
} | {
    type: 'dice_roll';
    text: string;
    attribute: keyof PlayerAttributes;
    difficultyClass: number; // DC
};


export interface Enemy {
  name: string;
  hp: number;
  maxHp: number;
  ap: number;
  maxAp: number;
  attributes: PlayerAttributes;
  behavior: string; // e.g., "Fights recklessly", "Uses cunning tactics"
  statusEffects: StatusEffect[];
}

export interface Highlight {
  keyword: string;
  description: string;
}

export interface LuckEvent {
    type: 'positive' | 'negative' | 'neutral';
    title: string;
    description: string;
}

export interface StoryNode {
  situation: string;
  choices: Choice[];
  isGameOver: boolean;
  playerState?: PlayerState;
  enemy?: Enemy | null;
  highlights?: Highlight[];
  worldName?: string;
  worldDifficulty?: number;
  generateImage?: boolean;
  luckEvent?: LuckEvent;
  combatLog?: string; // A specific field for the turn-by-turn combat narration
}

export type GameStatus = 'intro' | 'start_menu' | 'playing' | 'game_over' | 'tutorial' | 'world_briefing' | 'shop' | 'in_combat' | 'dice_rolling' | 'game_library' | 'in_camp' | 'scenario_selection';

export const GAME_STATUSES: GameStatus[] = ['intro', 'start_menu', 'playing', 'game_over', 'tutorial', 'world_briefing', 'shop', 'in_combat', 'dice_rolling', 'game_library', 'in_camp', 'scenario_selection'];

export type Language = 'en' | 'pt';

export type Scenario = 'church' | 'king' | 'mages' | 'ancestral' | 'skyrim' | 'mushoku_tensei' | 're_zero' | 'shield_hero';

export type NarrativeMode = 'complete' | 'summary';

export interface SettingsContextType {
  narrativeMode: NarrativeMode;
  setNarrativeMode: (mode: NarrativeMode) => void;
  imageGenerationEnabled: boolean;
  setImageGenerationEnabled: (enabled: boolean) => void;
  narrationEnabled: boolean;
  setNarrationEnabled: (enabled: boolean) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  isPremium: boolean;
  setPremium: (isPremium: boolean) => void;
}

export interface ShopItem {
  id: string;
  nameKey: 'shop_item_hp_name' | 'shop_item_potion_name' | 'shop_item_strength_name' | 'shop_item_intellect_name' | 'shop_item_luck_name';
  descriptionKey: 'shop_item_hp_desc' | 'shop_item_potion_desc' | 'shop_item_strength_desc' | 'shop_item_intellect_desc' | 'shop_item_luck_desc';
  cost: number;
  maxLevel?: number;
}

export type PurchasedUpgrades = {
  [key: string]: number; // id: level
}

export interface DiceRollInfo {
    text: string;
    attribute: keyof PlayerAttributes;
    difficultyClass: number;
}

export interface SavedJourney {
  id:string; // ISO date string
  date: string;
  worldName: string;
  finalStats: { turns: number; difficulty: number; };
  history: string[];
  characterDescription: string | null;
  characterPortraitUrl: string | null;
  gameOverMessage: string;
}

export type CombatAction = {
    name: 'Quick Attack' | 'Standard Attack' | 'Power Attack' | 'Defend' | 'Aim' | 'Use Item' | 'Special Move';
    cost: number;
    description: string;
    target?: 'enemy' | 'self';
    payload?: any; // e.g., item name for 'Use Item'
};

export interface CraftingResult {
    success: boolean;
    resultItem?: { name: string };
    description: string;
    usedItems: string[];
}


// --- Reducer Types ---
export interface GameState {
  gameStatus: GameStatus;
  isLoading: boolean;
  isGeneratingImage: boolean;
  storyNode: StoryNode | null;
  playerState: PlayerState | null;
  gameOverMessage: string;
  lastRunStats: {
      initialCurrency: number;
      turns: number;
      difficulty: number;
  } | null;
  currency: number;
  purchasedUpgrades: PurchasedUpgrades;
  hasSaveGame: boolean;
  tutorialSeen: boolean;
  currentImageUrl: string | null;
  diceRollInfo: DiceRollInfo | null;
  characterDescription: string | null;
  characterPortraitUrl: string | null;
  fullHistory: string[];
  completedJourney: Omit<SavedJourney, 'id'|'date'> | null;
  selectedScenario: Scenario | null;
}

export type Action =
  | { type: 'SET_STATUS'; payload: GameStatus }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_IMAGE_GENERATING'; payload: boolean }
  | { type: 'SET_IMAGE_URL'; payload: string | null }
  | { type: 'START_TUTORIAL'; payload: { isPremium: boolean } }
  | { type: 'END_TUTORIAL'; payload: { isPremium: boolean } }
  | { type: 'SELECT_SCENARIO'; payload: Scenario }
  | { type: 'START_BRIEFING'; payload: StoryNode }
  | { type: 'START_GAME' }
  | { type: 'START_DICE_ROLL'; payload: DiceRollInfo }
  | { type: 'UPDATE_NODE'; payload: StoryNode }
  | { type: 'COMBAT_UPDATE'; payload: { playerState: PlayerState, enemy: Enemy | null, combatLog: string, isGameOver: boolean } }
  | { type: 'GAME_OVER'; payload: { message: string; stats: { turns: number; difficulty: number } } }
  | { type: 'RESTART_GAME' }
  | { type: 'LOAD_GAME'; payload: { playerState: PlayerState, storyNode: StoryNode, currentImageUrl: string | null, characterPortraitUrl: string | null } }
  | { type: 'ADD_CURRENCY', payload: number }
  | { type: 'BUY_ITEM', payload: { item: ShopItem, newUpgrades: PurchasedUpgrades, newCurrency: number } }
  | { type: 'UPDATE_COMPANION_BEHAVIOR', payload: { companionName: string, behavior: CompanionBehavior } }
  // Debug Actions
  | { type: 'DEBUG_SET_STATUS', payload: GameStatus }
  | { type: 'DEBUG_SET_HP', payload: number }
  | { type: 'DEBUG_SET_ATTRIBUTE', payload: { attribute: keyof PlayerAttributes, value: number } }
  | { type: 'DEBUG_ADD_ITEM', payload: string }
  | { type: 'DEBUG_FORCE_COMBAT' }
  | { type: 'DEBUG_GAME_OVER', payload: string };
