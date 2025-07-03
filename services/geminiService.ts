

import { GoogleGenAI } from "@google/genai";
import { StoryNode, Language, PlayerState, Scenario, Enemy, NarrativeMode, PurchasedUpgrades, CharacterDetails } from '../types.ts';
import { translations, languageNames } from '../translations.ts';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const parseJsonResponse = (jsonString: string): StoryNode | null => {
    let cleanedString = jsonString.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = cleanedString.match(fenceRegex);

    if (match && match[2]) {
        cleanedString = match[2].trim();
    }
    
    try {
        const parsedData = JSON.parse(cleanedString);
        if (typeof parsedData.situation === 'string' && Array.isArray(parsedData.choices) && typeof parsedData.isGameOver === 'boolean') {
             return parsedData as StoryNode;
        }
        console.error("Parsed JSON is missing required fields:", parsedData);
        return null;
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
  };
  
  const narrativeStyle = narrativeMode === 'complete' 
    ? "detailed and descriptive" 
    : "concise and to-the-point";

  let upgradeText = "";
  if (upgrades.start_potion > 0) {
      upgradeText += "The player starts with a Health Potion because they bought an upgrade. Mention this item in the opening scene."
  }
  if (upgrades.hp_boost > 0) {
      upgradeText += "The player has a higher starting vitality due to an upgrade. Reflect this in the narrative (e.g., feeling more resilient or vigorous)."
  }

  return `
You are a Dungeon Master for a text adventure. Your goal is to create a story that is easy to understand, clear, and direct.
The player is a human summoned to a fantasy world under threat from a Demon King's army.
Your narrative style should be ${narrativeStyle}. However, ALWAYS prioritize clarity over literary flair. Use simple sentence structures and common vocabulary.
Describe what the player sees, hears, and feels in a straightforward manner. Instead of abstract descriptions, focus on concrete details.
The story begins with this scenario: ${scenarioPrompts[scenario]}.

PLAYER'S APPEARANCE: ${characterDescription}. Describe the player character in the opening scene using these details.
${upgradeText ? `\nPLAYER UPGRADES: ${upgradeText}` : ''}

Generate a clear and engaging starting scene. Use straightforward language.

Your response MUST be a valid JSON object in ${languageNames[language]}.
The JSON object must have this exact structure:
{
  "situation": "A clear, direct, and easy-to-understand description of the starting scene. Mention the player's appearance and any upgrades they have.",
  "choices": [
    {"type": "button", "text": "A description of the first possible action."},
    {"type": "input", "text": "A prompt asking for the character's name.", "placeholder": "Enter your name..."}
  ],
  "playerState": { 
    "attributes": { "strength": <num 5-15>, "dexterity": <num 5-15>, "intelligence": <num 5-15>, "charisma": <num 5-15>, "luck": <num 5-15> }, 
    "hp": <num 15-25>, 
    "inventory": [], 
    "party": [], 
    "approach": "solo",
    "moves": ["a basic physical attack", "a basic defensive move", "a quick jab", "an observant stance"],
    "turn": 0,
    "worldDifficulty": <world's difficulty, from 1 to 10>,
    "history": [],
    "characterDescription": "${characterDescription}"
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

const getFollowUpPrompt = (previousSituation: string, previousEnemy: Enemy | null, playerState: PlayerState, playerChoiceText: string, language: Language, narrativeMode: NarrativeMode, history: string[]): string => {
  const narrativeStyle = narrativeMode === 'complete' 
    ? "detailed and descriptive" 
    : "concise, fast-paced, and to-the-point";
  
  const inCombat = !!previousEnemy;

  return `
You are a Dungeon Master continuing a text adventure. Your main goal is to make the story easy to understand, clear, and direct.
Your narrative style is ${narrativeStyle}, but ALWAYS prioritize clarity over literary flair. Use simple language and concrete details.
Describe the direct consequences of the player's actions.
The player's action indicates their INTENT. If they declared a dice roll result, narrate the outcome of that success or failure clearly.

CONTEXT:
- PLAYER'S APPEARANCE: ${playerState.characterDescription}
- PREVIOUS SITUATION: ${previousSituation}
- PLAYER'S STATE: ${JSON.stringify(playerState)}
- PLAYER'S ACTION / INTENT: "${playerChoiceText}"
${previousEnemy ? `- CURRENT ENEMY: ${JSON.stringify(previousEnemy)}` : ''}

YOUR TASK:
Continue the story based on the player's action and state.
- **Pacing & Difficulty:** The story should build towards a climax or conclusion within about 15-20 turns. The current turn is ${playerState.turn}. The world difficulty is ${playerState.worldDifficulty}/10, adjust the challenge accordingly.
- **Clarity & Cohesion:** The next part of the story must be a logical consequence of the player's action. To avoid repetition, here are the last few situations the player has been in: ${JSON.stringify(history)}. Do not repeat these exact scenarios.
- **Luck Events:** Based on the player's 'luck' attribute (${playerState.attributes.luck}), you can RARELY trigger a random event. This should NOT happen on every turn. High luck (12+) can cause positive events (e.g., finding a hidden pouch of coins, a weapon suddenly feeling lighter). Low luck (8-) can cause negative events (e.g., tripping on a root, a strap on your bag breaking). Neutral events can be strange visions or omens. If you trigger an event, add a 'luckEvent' object to your response, and the 'situation' you write MUST seamlessly incorporate this event.
- **Image Generation:** Set "generateImage" to true ONLY for visually striking, pivotal, or cinematic moments focusing on landscapes, architecture, or atmospheric scenes. Examples: discovering a lost city, entering a magical forest, seeing a castle for the first time. Do NOT generate images for simple dialogue, minor actions, or combat.
- **Combat:** If in combat (${inCombat}), this is a combat turn. The player has used the move: "${playerChoiceText}". Narrate the outcome of the player's move and the enemy's counter-attack. Update HP for both. If the enemy's HP is <= 0, describe their defeat and set 'enemy' to null. If the player's HP is <= 0, the game is over.
- **Choices:**
    - If in combat, the 'choices' array you return MUST be the player's 4 combat moves: ${JSON.stringify(playerState.moves)}. Each choice MUST have type "combat".
    - If not in combat, generate relevant story choices. These can be type "button", "input", or "dice_roll".
    - **Dice Rolls:** For actions with a chance of failure (e.g., persuading a guard, leaping a chasm, deciphering a rune), create a choice of type "dice_roll".
      - Structure: {"type": "dice_roll", "text": "The action the player is attempting", "attribute": "<strength|dexterity|intelligence|charisma|luck>", "difficultyClass": <number from 5 to 25>}
      - The player's next prompt will you if they succeeded or failed. Your next situation MUST reflect that outcome.
- **Dynamic Actions:** Occasionally, offer choices for deeper interaction.
    - **Training:** Offer a choice to train an attribute (e.g., 'Train your strength'). If chosen, narrate it and slightly increase the relevant attribute in the returned 'playerState'.
    - **Recruitment:** If the player meets a potential ally, offer a choice to recruit them to the 'party'.
    - **Relationships:** Provide choices that develop a relationship (positive or negative) with an NPC.
- **State Updates:** You MUST return the complete 'playerState' object. Increment the 'turn' number by 1. Update other fields like HP, inventory, party, attributes etc., as the story dictates. Do not modify the 'history' field.
- **Player Input:** Occasionally, offer a choice of type 'input' to let the player type a custom response (e.g., a line of dialogue).

Your response MUST be a valid JSON object in ${languageNames[language]} with this exact structure (luckEvent is optional):
{
  "situation": "A clear and direct description of what happens next. Use simple language. Describe the outcome of the player's action and what they see now. If a luck event occurs, it should be described here.",
  "choices": [
    {"type": "button", "text": "A plausible first action for the player."},
    {"type": "button", "text": "A plausible second action for the player."}
  ],
  "playerState": { "attributes": { ... }, "hp": <updated HP>, "inventory": <updated inventory>, "party": <updated party>, "approach": <updated approach>, "moves": ${JSON.stringify(playerState.moves)}, "turn": ${playerState.turn + 1}, "worldDifficulty": ${playerState.worldDifficulty}, "history": ${JSON.stringify(playerState.history)}, "characterDescription": "${playerState.characterDescription}" },
  "enemy": <the enemy object with updated HP, or null if defeated/none>,
  "isGameOver": <boolean>,
  "generateImage": <boolean>,
  "highlights": [{"keyword": "a new key term", "description": "a brief explanation."}],
  "luckEvent": {"type": "<'positive'|'negative'|'neutral'>", "title": "A short, evocative title for the event", "description": "A one-sentence summary of what happened."}
}
`;
}
interface GenerateStoryStepParams {
    scenario: Scenario | null;
    previousSituation: string | null;
    playerState: PlayerState | null;
    previousEnemy: Enemy | null;
    playerChoiceText: string | null;
    language: Language;
    narrativeMode: NarrativeMode;
    history: string[] | null;
    upgrades: PurchasedUpgrades | null;
    characterDescription: string | null;
}

export const generateStoryStep = async (params: GenerateStoryStepParams): Promise<StoryNode> => {
    const { scenario, previousSituation, playerState, previousEnemy, playerChoiceText, language, narrativeMode, history, upgrades, characterDescription } = params;

    const isInitialStep = !!scenario;
    let prompt;
    if (isInitialStep && upgrades && characterDescription) {
      prompt = getInitialPrompt(language, scenario, narrativeMode, upgrades, characterDescription);
    } else if (previousSituation && playerState && playerChoiceText && history) {
      prompt = getFollowUpPrompt(previousSituation, previousEnemy, playerState, playerChoiceText, language, narrativeMode, history);
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

        const parsedNode = parseJsonResponse(response.text);
        if (parsedNode) {
            return parsedNode;
        }
        return getErrorStoryNode('parse', language);

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        return getErrorStoryNode('connection', language);
    }
};

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


export const generateCharacterPortrait = async (details: CharacterDetails): Promise<string | null> => {
    const prompt = `
Create a highly detailed, photorealistic digital portrait of a character for a fantasy RPG.
The character MUST be a HUMAN with normal, rounded human ears. Absolutely no pointed elven ears or other non-human features.
The portrait must be from the chest up, against a simple, neutral grey backdrop.
The artistic style should be similar to modern RPGs like Baldur's Gate 3 or Dragon Age, focusing on realism.

Use these exact features for the character:
- Race: Human
- Sex: ${details.sex}
- Age Appearance: ${details.age}
- Expression: Reflects a ${details.personality} personality.
- Skin Color: Use the exact hex code ${details.skinTone}.
- Hair Style: ${details.hairStyle}
- Hair Color: Use the exact hex code ${details.hairColor}.
- Eye Color: Use the exact hex code ${details.eyeColor}.
`;

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
        console.error("Error generating character portrait:", error);
        return null;
    }
};
