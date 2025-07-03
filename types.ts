

export interface PlayerAttributes {
    strength: number;
    dexterity: number;
    intelligence: number;
    charisma: number;
    luck: number;
}

export interface PlayerState {
  attributes: PlayerAttributes;
  hp: number;
  inventory: string[];
  party: string[];
  approach: 'solo' | 'party' | 'army';
  moves: string[];
  turn: number;
  worldDifficulty: number;
  history: string[];
  characterDescription: string | null;
}

export type Choice = {
    type: 'button' | 'combat';
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
}

export type GameStatus = 'intro' | 'start_menu' | 'playing' | 'game_over' | 'tutorial' | 'world_briefing' | 'shop' | 'in_combat' | 'dice_rolling' | 'character_creation' | 'game_library';

export type Language = 'en' | 'pt';

export type Scenario = 'church' | 'king' | 'mages' | 'ancestral';

export type NarrativeMode = 'complete' | 'summary';

export interface ShopItem {
  id: string;
  nameKey: 'shop_item_hp_name' | 'shop_item_potion_name';
  descriptionKey: 'shop_item_hp_desc' | 'shop_item_potion_desc';
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

export interface CharacterDetails {
  sex: 'Male' | 'Female';
  age: string;
  personality: string;
  skinTone: string;
  hairStyle: string;
  hairColor: string;
  eyeColor: string;
}

export interface SavedJourney {
  id: string; // ISO date string
  date: string;
  worldName: string;
  finalStats: { turns: number; difficulty: number; };
  history: string[];
  characterDescription: string | null;
  characterPortraitUrl: string | null;
  gameOverMessage: string;
}

// --- Reducer Types ---
export interface GameState {
  gameStatus: GameStatus;
  isLoading: boolean;
  isGeneratingImage: boolean;
  storyNode: StoryNode | null;
  playerState: PlayerState | null;
  gameOverMessage: string;
  lastRunStats: { turns: number; difficulty: number; initialCurrency: number; } | null;
  currency: number;
  purchasedUpgrades: PurchasedUpgrades;
  hasSaveGame: boolean;
  tutorialSeen: boolean;
  currentImageUrl: string | null;
  diceRollInfo: DiceRollInfo | null;
  characterDescription: string | null;
  characterPortraitUrl: string | null;
  fullHistory: string[];
  completedJourney: Omit<SavedJourney, 'id' | 'date'> | null;
}

export type Action =
  | { type: 'SET_STATUS'; payload: GameStatus }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_IMAGE_GENERATING'; payload: boolean }
  | { type: 'SET_IMAGE_URL'; payload: string | null }
  | { type: 'START_TUTORIAL' }
  | { type: 'END_TUTORIAL' }
  | { type: 'START_CHARACTER_CREATION' }
  | { type: 'SET_CHARACTER_DETAILS'; payload: { description: string; url: string; } }
  | { type: 'START_BRIEFING'; payload: StoryNode }
  | { type: 'START_GAME' }
  | { type: 'START_DICE_ROLL'; payload: DiceRollInfo }
  | { type: 'UPDATE_NODE'; payload: StoryNode }
  | { type: 'GAME_OVER'; payload: { message: string; stats: { turns: number; difficulty: number } } }
  | { type: 'ADD_CURRENCY'; payload: number }
  | { type: 'RESTART_GAME' }
  | { type: 'LOAD_GAME'; payload: { playerState: PlayerState; storyNode: StoryNode, currentImageUrl: string | null, characterPortraitUrl: string | null } }
  | { type: 'BUY_ITEM'; payload: { item: ShopItem; newUpgrades: PurchasedUpgrades; newCurrency: number } };