






import { GoogleGenAI } from "@google/genai";
import { StoryNode, Language, PlayerState, Scenario, Enemy, NarrativeMode, PurchasedUpgrades, CombatAction, Companion } from '../types.ts';
import { translations, languageNames } from '../translations.ts';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const parseJsonResponse = (jsonString: string): any => {
    let cleanedString = jsonString.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = cleanedString.match(fenceRegex);

    if (match && match[2]) {
        cleanedString = match[2].trim();
    }
    
    try {
        const parsedData = JSON.parse(cleanedString);
        return parsedData;
    } catch (e) {
        console.error("Failed to parse JSON response:", e, "Raw response:", cleanedString);
        return null;
    }
};

const getErrorStoryNode = (errorType: 'parse' | 'connection', language: Language): StoryNode => {
    const t = translations[language];
    const errorMessage = errorType === 'parse' ? t.errorParse : t.errorConnection;

    return {
        situation: `${errorMessage}`,
        choices: [],
        isGameOver: true,
    };
}


const getInitialPrompt = (language: Language, scenario: Scenario, narrativeMode: NarrativeMode, upgrades: PurchasedUpgrades, characterDescription: string): string => {
  const t = translations[language];

  const scenarioPrompts: Record<Scenario, string> = {
    church: t.scenario_church_prompt,
    king: t.scenario_king_prompt,
    mages: t.scenario_mages_prompt,
    ancestral: t.scenario_ancestral_prompt,
    skyrim: t.scenario_skyrim_prompt,
    mushoku_tensei: t.scenario_mushoku_tensei_prompt,
    re_zero: t.scenario_re_zero_prompt,
    shield_hero: t.scenario_shield_hero_prompt,
  };
  
  const narrativeStyle = narrativeMode === 'complete' 
    ? "verbose, rich, and descriptive" 
    : "concise and to-the-point";

  const difficultyTheming = `
WORLD DIFFICULTY THEME:
You will generate a worldDifficulty from 1 to 10. This difficulty MUST dictate the world's core conflict:
- Difficulty 1-3 (Political Intrigue): The world is not yet aware of the Demon King's threat. The main problems are political, like a succession crisis, feuding nobles, or corrupt councils. The player is summoned into this politically charged environment.
- Difficulty 4-6 (Incipient Evil): The Demon King's influence is a creeping shadow. There are strange occurrences, monster sightings in the borderlands, or nascent evil cults. The established powers are dismissive or ignorant of the true threat.
- Difficulty 7-9 (War against Evil): The war against the Demon King is in full swing, and humanity is losing. Cities are besieged, the land is corrupted, and hope is dwindling. The player is summoned as a desperate measure in an ongoing, brutal conflict.
- Difficulty 10 (Post-Apocalyptic Vengeance): The war is over. Humanity lost. The Demon King reigns over a desolate world. The player is summoned as a final, desperate echo of humanity's will, a lone avenger in a world of monsters and ruins. Their goal is not to save the world, but to avenge it.

Based on the difficulty you choose, the scenario (${scenarioPrompts[scenario]}) and the starting situation MUST reflect one of these themes.
`;

  let upgradeText = "";
  if (upgrades.start_potion > 0) {
      upgradeText += "The player starts with a Health Potion. Mention this item.\n"
  }
  if (upgrades.hp_boost > 0) {
      upgradeText += `The player has a higher starting vitality (+${upgrades.hp_boost * 5} HP). Reflect this as feeling more resilient.\n`
  }
  if (upgrades.str_boost > 0) {
      upgradeText += `The player has enhanced Strength (+${upgrades.str_boost}). Reflect this as feeling physically stronger.\n`
  }
  if (upgrades.int_boost > 0) {
      upgradeText += `The player has enhanced Intelligence (+${upgrades.int_boost}). Reflect this as having a sharper mind.\n`
  }
  if (upgrades.luck_boost > 0) {
      upgradeText += `The player is unnaturally lucky (+${upgrades.luck_boost}). Reflect this as a subtle feeling of good fortune.\n`
  }

  return `
You are a Dungeon Master for a text adventure. Your narrative style will be ${narrativeStyle}.
The player is a human summoned to a fantasy world.
The core principle is "Show, Don't Tell". Player condition and stats are described through the story.
The story begins with this scenario: ${scenarioPrompts[scenario]}.

${scenario === 'king' || scenario === 'church' || scenario === 'mages' || scenario === 'ancestral' ? difficultyTheming : 'For this special scenario, the world difficulty is pre-determined by its lore. Set worldDifficulty to a fitting value (e.g., Skyrim: 7, Re:Zero: 8, Shield Hero: 9, Mushoku Tensei: 5). The core conflict is defined by the source material.'}

PLAYER'S APPEARANCE: ${characterDescription}. Describe the player character in the opening scene using these details. If no specific details are provided, invent a suitable appearance for an adventurer.
${upgradeText ? `\nPLAYER UPGRADES:\n${upgradeText}` : ''}

Generate a highly unique and creative starting scene that is faithful to the chosen scenario. Avoid common clichés.

In 'playerState', create a 'worldContext' field. This field must be a concise, 1-2 sentence summary of the core rules and premise of the world (e.g., "A high fantasy world of dragons and civil war based on Skyrim." or "A world based on Re:Zero where the player has the 'Return by Death' ability."). This context is crucial to keep the story consistent.

Also create a 'storySummary' and a 'plotPoints' array. The 'storySummary' is a 1-2 sentence main goal based on the scenario. The 'plotPoints' array should contain 3-5 objects outlining the key steps to achieve the summary. Each object must have a 'text' (the plot point description) and 'completed: false'.

Your response MUST be a valid JSON object in ${languageNames[language]}.
The JSON object must have this exact structure:
{
  "situation": "A description of the starting scene, matching the narrative style. Weave in the player's appearance and any upgrades they have.",
  "choices": [
    {"type": "button", "text": "A description of the first possible action."},
    {"type": "input", "text": "A prompt asking for the character's name.", "placeholder": "Enter your name..."}
  ],
  "playerState": { 
    "attributes": { "strength": <num 5-15>, "dexterity": <num 5-15>, "intelligence": <num 5-15>, "charisma": <num 5-15>, "luck": <num 5-15> }, 
    "hp": <num 15-25>, 
    "maxHp": <same as hp>,
    "ap": 4,
    "maxAp": 4,
    "inventory": [], 
    "party": [], 
    "approach": "solo",
    "turn": 0,
    "worldDifficulty": <world's difficulty, from 1 to 10>,
    "history": [],
    "characterDescription": "${characterDescription}",
    "storySummary": "A concise, 1-2 sentence summary of the main quest or goal for this specific journey, based on the world difficulty theme. This summary will guide the entire adventure.",
    "plotPoints": [{"text": "The first key step of the story.", "completed": false}, {"text": "The second key step.", "completed": false}, {"text": "A climactic final step.", "completed": false}],
    "statusEffects": [],
    "worldContext": "The concise 1-2 sentence summary of the world's rules generated above."
  },
  "worldName": "A cool and evocative name for this world.",
  "worldDifficulty": <a number from 1 (easy) to 10 (impossible) for the world's difficulty>,
  "enemy": null,
  "isGameOver": false,
  "generateImage": true,
  "highlights": [{"keyword": "a key term", "description": "a brief explanation."}]
}
`;
}

const getCombatPrompt = (playerState: PlayerState, enemy: Enemy, playerActions: CombatAction[], language: Language, narrativeMode: NarrativeMode): string => {
    const narrativeStyle = narrativeMode === 'complete' ? "verbose and descriptive" : "concise and to-the-point";
    
    return `
You are a Dungeon Master for a tactical, AP-based text adventure. The narrative style is ${narrativeStyle}.
The goal is to create a tactical puzzle where a clever player can defeat a stronger enemy.

**COMBAT CONTEXT:**
- PLAYER'S STATE: ${JSON.stringify(playerState)}
- ENEMY'S STATE: ${JSON.stringify(enemy)}
- PLAYER'S ACTIONS THIS TURN: ${JSON.stringify(playerActions)}
- WORLD DIFFICULTY: ${playerState.worldDifficulty}/10.

**YOUR TASK: EXECUTE AND NARRATE THE FULL COMBAT ROUND**

**1. Process Pre-Turn Effects (for both Player and Enemy):**
   - Narrate and apply damage/effects from status effects like 'Bleeding' or 'Poisoned'.
   - Narrate the expiry of any status effects whose duration is now 0.
   - Decrement the 'duration' of all remaining status effects by 1.

**2. Player's Turn:**
   - Narrate the outcome of the player's sequence of actions (${JSON.stringify(playerActions)}). Be creative. An "Aim" followed by a "Power Attack" should be described as a well-placed, devastating blow. A "Defend" action should be described as the character bracing for impact.
   - **Companion Actions:** If the player has companions (in \`playerState.party\`), they will assist during the player's turn. Their actions MUST be guided by their set 'behavior':
     - **Aggressive:** Prioritize dealing damage to the enemy. Use attack-oriented abilities.
     - **Defensive:** Prioritize actions that protect the player or themselves (e.g., taking a hit, using a defensive ability, creating a diversion).
     - **Support:** Prioritize healing, buffing allies, or debuffing the enemy.
     Narrate their actions as part of the player's action narrative. Their behavior is a strict instruction.
   - Calculate total damage and apply any status effects from the player's actions. Update the enemy's HP.
   - The 'Defend' action should add a 'Guarded' status effect to the player for 1 turn, which you will use to reduce incoming enemy damage in the next step.

**3. Enemy's Turn (if it survived):**
   - Check if the enemy is defeated. If so, skip to step 4.
   - The enemy has ${enemy.maxAp} Action Points (AP) to spend.
   - The enemy's behavior is: "${enemy.behavior}".
   - **CHOOSE ENEMY ACTIONS:** Based on its behavior, attributes, and remaining HP, select a logical sequence of actions for the enemy that it can afford with its AP. (e.g., A "reckless" enemy might always use Power Attack if it can. A "cunning" one might apply debuffs. A low HP enemy might try to defend or flee).
   - **NARRATE & CALCULATE:** Narrate the enemy's actions vividly. Calculate damage to the player, factoring in any player status effects like 'Guarded' (e.g., reduce damage by 50%). Update the player's HP and status effects.
   
**4. End of Round:**
   - Check for game over conditions: Is player HP <= 0? Is enemy HP <= 0?
   - If the enemy is defeated, set 'enemy' to null in the response. The combat is over.
   - If the player is defeated, set 'isGameOver' to true.

**JSON RESPONSE STRUCTURE:**
Your response MUST be a valid JSON object in ${languageNames[language]}. Do not include any other text or markdown.
The JSON object must have this exact structure:
{
  "playerState": { ... (The FULL, updated player state. HP, AP, and statusEffects MUST be updated. AP should be reset to maxAp for the next turn) ... },
  "enemy": { ... (The FULL, updated enemy state. HP, AP, and statusEffects MUST be updated. AP should be reset to maxAp for its next turn) ... } OR null if defeated,
  "combatLog": "A single string containing the turn's entire narration: status effects, player actions, and enemy response.",
  "isGameOver": <boolean>
}
`;
};


const getFollowUpPrompt = (previousSituation: string, playerState: PlayerState, playerChoiceText: string, language: Language, narrativeMode: NarrativeMode, history: string[]): string => {
  const narrativeStyle = narrativeMode === 'complete' 
    ? "verbose, rich, and descriptive" 
    : "concise, fast-paced, and to-the-point";

 const storyPrompt = `
You are a Dungeon Master continuing a text adventure. Your narrative style is ${narrativeStyle}.
The core principle is "Show, Don't Tell". Player state is revealed through storytelling.
The player's action indicates their INTENT. If they declared a dice roll result, narrate the outcome of that success or failure. If the player types a custom action, interpret it creatively and logically within the context of the story and the character's abilities.

**ABSOLUTE RULE: WORLD CONTEXT**
You MUST strictly adhere to the following world context. It is the single most important rule. Do NOT deviate from it. Do NOT introduce conflicting themes or concepts (like aliens in a fantasy world).
- **WORLD CONTEXT:** "${playerState.worldContext}"

**COMPANIONS:** The player can have companions in their 'party' array. Each companion is an object: \`{ "name": "string", "title": "string", "hp": number, "maxHp": number, "personality": "string", "ability": "string", "statusEffects": [], "behavior": "<'Aggressive'|'Defensive'|'Support'>" }\`. Make them feel alive! They should talk, react based on their personality and **behavior**, and you can offer the player choices to use their unique 'ability'. You can also introduce new potential companions to be recruited. When a companion is recruited, you MUST add their full object to the 'party' array in the returned 'playerState'. You MUST assign a starting 'behavior' that matches their personality.

**IF THE AI DECIDES TO START COMBAT:**
- When you introduce an enemy, you MUST create a complete 'enemy' object in your JSON response.
- The 'enemy' object MUST have: 'name', 'hp', 'maxHp' (must be equal to 'hp' initially), 'ap', 'maxAp' (usually 4), 'attributes' (similar to the player's), a 'behavior' string (e.g., "Fights recklessly"), and an empty 'statusEffects' array.
- The player's AP should be reset to their maxAP.

**CONTEXT:**
- MAIN GOAL / STORY SUMMARY: ${playerState.storySummary}
- NARRATIVE ROADMAP (Plot Points): ${JSON.stringify(playerState.plotPoints)}
- PLAYER'S APPEARANCE: ${playerState.characterDescription}
- PREVIOUS SITUATION: ${previousSituation}
- PLAYER'S STATE: ${JSON.stringify(playerState)}
- PLAYER'S ACTION / INTENT: "${playerChoiceText}"

**YOUR TASK:**
Continue the story based on the player's action and state.
- **Story Cohesion & Roadmap:** You MUST follow the NARRATIVE ROADMAP (the 'plotPoints'). The current situation should logically progress towards the next uncompleted plot point. When a plot point is achieved through the narrative, you MUST update its corresponding 'completed' field to \`true\` in the 'playerState' object you return. Do not get sidetracked. The story must always serve the MAIN GOAL, the roadmap, and the ABSOLUTE RULE of the WORLD CONTEXT.
- **Pacing & Difficulty:** The story should build towards a climax or conclusion within about 15-20 turns. The current turn is ${playerState.turn}. The world difficulty is ${playerState.worldDifficulty}/10, adjust the challenge accordingly.
- **Creativity & Cohesion:** To avoid repetition, here are the last few situations the player has been in: ${JSON.stringify(history)}. Do NOT repeat these scenarios or ideas. Generate something new and unexpected that moves the story forward logically.
- **Luck Events:** Based on the player's 'luck' attribute (${playerState.attributes.luck}), you can RARELY trigger a random event. This should NOT happen on every turn. If you trigger an event, add a 'luckEvent' object to your response, and the 'situation' you write MUST seamlessly incorporate this event.
- **Image Generation:** Set "generateImage" to true ONLY for visually striking, pivotal, or cinematic moments. Do NOT generate images for simple dialogue, minor actions, or combat.
- **Dice Rolls:** For actions with a chance of failure, create a choice of type "dice_roll".
- **State Updates:** You MUST return the complete 'playerState' object. Increment the 'turn' number by 1. Update other fields as the story dictates. Do not modify the 'history' or 'storySummary' fields. Do NOT add or remove plot points from the 'plotPoints' array, only update their 'completed' status.

Your response MUST be a valid JSON object in ${languageNames[language]} with this exact structure (luckEvent is optional):
{
  "situation": "A vivid description of what happens next. If combat is starting, describe the enemy's appearance and intent.",
  "choices": [
    {"type": "button", "text": "A plausible first action for the player."},
    {"type": "button", "text": "A plausible second action for the player."}
  ],
  "playerState": { ... (the full player state, with turn incremented and AP reset to max if combat starts) ... },
  "enemy": <the FULL enemy object if combat starts, or null>,
  "isGameOver": <boolean>,
  "generateImage": <boolean>,
  "highlights": [{"keyword": "a new key term", "description": "a brief explanation."}],
  "luckEvent": {"type": "<'positive'|'negative'|'neutral'>", "title": "A short, evocative title for the event", "description": "A one-sentence summary of what happened."}
}
`;
 return storyPrompt;
}
interface GenerateStoryStepParams {
    scenario: Scenario | null;
    previousSituation: string | null;
    playerState: PlayerState | null;
    playerChoiceText: string | null;
    language: Language;
    narrativeMode: NarrativeMode;
    history: string[] | null;
    upgrades: PurchasedUpgrades | null;
    characterDescription: string | null;
}

export const generateStoryStep = async (params: GenerateStoryStepParams): Promise<StoryNode> => {
    const { scenario, previousSituation, playerState, playerChoiceText, language, narrativeMode, history, upgrades, characterDescription } = params;

    const isInitialStep = !!scenario;
    let prompt;
    if (isInitialStep && upgrades && characterDescription) {
      prompt = getInitialPrompt(language, scenario, narrativeMode, upgrades, characterDescription);
    } else if (previousSituation && playerState && playerChoiceText && history) {
      prompt = getFollowUpPrompt(previousSituation, playerState, playerChoiceText, language, narrativeMode, history);
    } else {
       console.error("Invalid call to generateStoryStep. Missing required parameters.");
       return getErrorStoryNode('parse', language);
    }

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-preview-04-17',
            contents: prompt,
            config: {
                systemInstruction: `You are a helpful AI assistant. Your ONLY job is to return a single, valid, non-malformed JSON object that strictly adheres to the provided schema. You MUST use the language requested by the user for all string values inside the JSON. Do NOT include any text, markdown, or explanations outside of the JSON object.`,
                responseMimeType: "application/json",
                temperature: 0.9,
                topP: 0.95,
            }
        });

        const parsedNode = parseJsonResponse(response.text) as StoryNode;
        if (parsedNode && typeof parsedNode.situation === 'string' && Array.isArray(parsedNode.choices) && typeof parsedNode.isGameOver === 'boolean') {
             return parsedNode;
        }
        console.error("Parsed JSON is missing required fields:", parsedNode);
        return getErrorStoryNode('parse', language);

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        return getErrorStoryNode('connection', language);
    }
};


export const generateCombatTurn = async (playerState: PlayerState, enemy: Enemy, playerActions: CombatAction[], language: Language, narrativeMode: NarrativeMode): Promise<any> => {
    const prompt = getCombatPrompt(playerState, enemy, playerActions, language, narrativeMode);
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-preview-04-17',
            contents: prompt,
            config: {
                systemInstruction: `You are a helpful AI assistant. Your ONLY job is to return a single, valid, non-malformed JSON object that strictly adheres to the provided schema. You MUST use the language requested by the user for all string values inside the JSON. Do NOT include any text, markdown, or explanations outside of the JSON object.`,
                responseMimeType: "application/json",
                temperature: 0.9,
                topP: 0.95,
            }
        });

        const parsedResult = parseJsonResponse(response.text);
        if (parsedResult && parsedResult.playerState && parsedResult.combatLog) {
            return parsedResult;
        }
        console.error("Parsed combat JSON is missing required fields:", parsedResult);
        return null;
    } catch (error) {
        console.error("Error calling Gemini API for combat:", error);
        return null;
    }
}


export const generateSceneryImage = async (situationText: string): Promise<string | null> => {
    const prompt = `Generate a photorealistic, cinematic, atmospheric, fantasy digital painting of this scene, focusing only on the environment and scenery. Do not show any characters, people, or creatures. The style should be epic and beautiful. Scene: ${situationText}`;
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-3.0-generate-002',
            prompt: prompt,
            config: { numberOfImages: 1, outputMimeType: 'image/jpeg' },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            const base64ImageBytes = response.generatedImages[0].image.imageBytes;
            return `data:image/jpeg;base64,${base64ImageBytes}`;
        }
        return null;
    } catch (error) {
        console.error("Error generating image:", error);
        return null;
    }
};
