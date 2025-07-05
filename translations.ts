
import { Language } from './types.ts';

interface TranslationSet {
  // StartMenu
  title: string;
  subtitle: string;
  description: string;
  beginJourney: string;
  selectLanguage: string;
  narrativeModeLabel: string;
  narrativeModeComplete: string;
  narrativeModeSummary: string;
  enableImageGeneration: string;
  enableNarration: string;
  enableSoundEffects: string;
  load_game: string;
  shop_button: string;
  library_button: string;
  settings_button: string;
  settings_title: string;
  
  // Intro
  intro_prologue: string[];
  intro_continue: string;

  // Scenario Selection
  scenario_selection_title: string;
  scenario_king_name: string;
  scenario_church_name: string;
  scenario_mages_name: string;
  scenario_ancestral_name: string;
  scenario_skyrim_name: string;
  scenario_mushoku_tensei_name: string;
  scenario_re_zero_name: string;
  scenario_shield_hero_name: string;
  premium_badge: string;

  // Tutorial
  tutorial_title: string;
  tutorial_welcome_title: string;
  tutorial_welcome_desc: string;
  tutorial_keywords_title: string;
  tutorial_keywords_desc: string;
  tutorial_choices_title: string;
  tutorial_choices_desc: string;
  tutorial_combat_title: string;
  tutorial_combat_desc: string;
  tutorial_status_title: string;
  tutorial_status_desc: string;
  tutorial_begin_adventure: string;

  // World Briefing
  briefing_title: string;
  briefing_world_name: string;
  briefing_difficulty: string;
  briefing_begin: string;

  // Shop
  shop_title: string;
  shop_back_to_menu: string;
  shop_your_echoes: string;
  shop_item_hp_name: string;
  shop_item_hp_desc: string;
  shop_item_potion_name: string;
  shop_item_potion_desc: string;
  shop_item_strength_name: string;
  shop_item_strength_desc: string;
  shop_item_intellect_name: string;
  shop_item_intellect_desc: string;
  shop_item_luck_name: string;
  shop_item_luck_desc: string;
  shop_buy_button: string;
  shop_max_level: string;

  // Game Header & Status
  save_game: string;
  game_saved: string;
  status_button: string;
  status_title: string;
  hp: string;
  attributes: string;
  inventory: string;
  party: string;
  ap: string;

  // Combat
  combat_action_quick_attack: string;
  combat_action_quick_attack_desc: string;
  combat_action_standard_attack: string;
  combat_action_standard_attack_desc: string;
  combat_action_power_attack: string;
  combat_action_power_attack_desc: string;
  combat_action_defend: string;
  combat_action_defend_desc: string;
  combat_action_aim: string;
  combat_action_aim_desc: string;
  combat_action_use_item: string;
  combat_action_use_item_desc: string;
  combat_action_special_move: string;
  combat_action_special_move_desc: string;
  combat_end_turn: string;

  // Scenario Prompts (internal)
  scenario_king_prompt: string;
  scenario_church_prompt: string;
  scenario_mages_prompt: string;
  scenario_ancestral_prompt: string;
  scenario_skyrim_prompt: string;
  scenario_mushoku_tensei_prompt: string;
  scenario_re_zero_prompt: string;
  scenario_shield_hero_prompt: string;

  // Game
  summoningWorld: string;
  writingDestiny: string;
  generating_image: string;
  imageDisclaimer: string;
  loadError: string;
  universal_input_placeholder: string;

  // GameOverScreen
  endOfTale: string;
  playAgain: string;
  echoes_earned: string; // {count}
  run_summary: string; // {turns}, {difficulty}
  
  // Gemini Service Errors
  errorParse: string;
  errorConnection: string;

  // Journey Library
  library_title: string;
  library_back_to_menu: string;
  library_no_journeys: string;
  library_journey_date: string;
  library_journey_world: string;
  library_journey_turns: string;
  library_journey_difficulty: string;
  library_view_button: string;
  library_delete_button: string;
  library_export_button: string;
  library_delete_confirm: string;
  library_final_outcome: string;
  library_character: string;
  library_story_log: string;
  library_save_journey: string;
  library_journey_saved: string;
}

export const translations: Record<Language, TranslationSet> = {
  en: {
    title: "Earth of Dungeons",
    subtitle: "A Summoner's Story",
    description: "Explore the World of magic",
    beginJourney: "New Journey",
    selectLanguage: "Language:",
    narrativeModeLabel: "Narrative Style:",
    narrativeModeComplete: "Complete",
    narrativeModeSummary: "Summary",
    enableImageGeneration: "Enable Image Generation",
    enableNarration: "Enable AI Narration",
    enableSoundEffects: "Enable Sound Effects",
    load_game: "Load Journey",
    shop_button: "Echoes Shop",
    library_button: "Journey Library",
    settings_button: "Settings",
    settings_title: "Settings",
    
    intro_prologue: [
      "In a world not your own...",
      "Summoned by a desperate plea...",
      "Your story is about to begin."
    ],
    intro_continue: "Continue",

    scenario_selection_title: "Choose Your World",
    scenario_king_name: "The Besieged Kingdom",
    scenario_church_name: "The Divine Prophecy",
    scenario_mages_name: "The Rogue Mages",
    scenario_ancestral_name: "The Ancient Evil",
    scenario_skyrim_name: "The Elder Scrolls: Skyrim",
    scenario_mushoku_tensei_name: "Mushoku Tensei: Jobless Reincarnation",
    scenario_re_zero_name: "Re:Zero - Starting Life in Another World",
    scenario_shield_hero_name: "The Rising of the Shield Hero",
    premium_badge: "Premium",

    tutorial_title: "How to Play",
    tutorial_welcome_title: "Welcome, Summoned One",
    tutorial_welcome_desc: "This is a world shaped by your decisions. The story is generated by an AI Dungeon Master, making every playthrough unique.",
    tutorial_keywords_title: "Interactive World",
    tutorial_keywords_desc: "You'll find <span class='text-amber-400 font-bold'>highlighted keywords</span> in the text. Click on them to learn more about the world, its characters, and your own abilities.",
    tutorial_choices_title: "Make Your Choice",
    tutorial_choices_desc: "Choose from the buttons below the story to act. Sometimes, you may even be asked to type your own response. Choose wisely.",
    tutorial_combat_title: "Tactical Combat",
    tutorial_combat_desc: "Combat is turn-based. On your turn, you have Action Points (AP) to spend on moves. Plan your turn, then hit 'End Turn' to see the results!",
    tutorial_status_title: "Track Your Hero",
    tutorial_status_desc: "At the top of the screen, you can check your Status to see your attributes, HP, and inventory at any time.",
    tutorial_begin_adventure: "Begin Your Adventure",

    briefing_title: "World Briefing",
    briefing_world_name: "World Name:",
    briefing_difficulty: "Difficulty:",
    briefing_begin: "Enter this World",

    shop_title: "Echoes Shop",
    shop_back_to_menu: "Back to Menu",
    shop_your_echoes: "Your Echoes:",
    shop_item_hp_name: "Vitality Boost",
    shop_item_hp_desc: "Permanently increase your starting HP.",
    shop_item_potion_name: "Starting Potion",
    shop_item_potion_desc: "Begin each new journey with a Health Potion in your inventory.",
    shop_item_strength_name: "Whetstone Kit",
    shop_item_strength_desc: "Permanently increase your starting Strength.",
    shop_item_intellect_name: "Insightful Crystal",
    shop_item_intellect_desc: "Permanently increase your starting Intelligence.",
    shop_item_luck_name: "Adventurer's Luck Charm",
    shop_item_luck_desc: "Permanently increase your starting Luck.",
    shop_buy_button: "Buy for {cost}",
    shop_max_level: "Max Level",

    save_game: "Save Game",
    game_saved: "Game Saved!",
    status_button: "Status",
    status_title: "Player Status",
    hp: "HP",
    attributes: "Attributes",
    inventory: "Inventory",
    party: "Party",
    ap: "AP",

    combat_action_quick_attack: "Quick Attack",
    combat_action_quick_attack_desc: "A fast, low-damage strike.",
    combat_action_standard_attack: "Standard Attack",
    combat_action_standard_attack_desc: "A balanced and reliable attack.",
    combat_action_power_attack: "Power Attack",
    combat_action_power_attack_desc: "A slow, heavy attack that deals massive damage.",
    combat_action_defend: "Defend",
    combat_action_defend_desc: "Brace for impact, reducing incoming damage.",
    combat_action_aim: "Aim",
    combat_action_aim_desc: "Focus, improving accuracy and critical chance for the next attack this turn.",
    combat_action_use_item: "Use Item",
    combat_action_use_item_desc: "Use an item from your inventory.",
    combat_action_special_move: "Special Move",
    combat_action_special_move_desc: "A unique, powerful ability.",
    combat_end_turn: "End Turn",

    scenario_king_prompt: "The player is summoned by a desperate king to save his besieged kingdom.",
    scenario_church_prompt: "The player is summoned by the high church, who believe them to be a prophesied hero.",
    scenario_mages_prompt: "The player is summoned by a cabal of rogue mages for their own mysterious purposes.",
    scenario_ancestral_prompt: "The player is summoned by a last-resort ancestral magic as an ancient evil reawakens.",
    scenario_skyrim_prompt: "The player awakens in the world of Skyrim, not necessarily as the Dragonborn, but as an adventurer. Rumors of dragons returning and a civil war between the Stormcloaks and the Empire are everywhere. Their journey begins caught in an ambush near the border.",
    scenario_mushoku_tensei_prompt: "The player is reincarnated into the Six-Faced World as a child in a minor noble house in the Asura Kingdom. They retain their memories from a past life. The world is full of magic and swordsmanship, and their new life as an adventurer begins with their first magic lesson.",
    scenario_re_zero_prompt: "The player is suddenly summoned to a vibrant market in the capital city of Lugnica. They are bewildered and defenseless. They will soon discover a terrifying curse: 'Return by Death', which rewinds time to a 'save point' whenever they die. Their first challenge is simply to survive the day.",
    scenario_shield_hero_prompt: "The player is summoned to the Kingdom of Melromarc as one of the Four Cardinal Heroes - the Shield Hero. They are almost immediately framed for a crime they didn't commit, becoming a pariah. With only their defensive shield and the world against them, they must find a way to grow stronger to face the coming Waves of Calamity.",


    summoningWorld: "Summoning a new world...",
    writingDestiny: "Destiny is being written...",
    generating_image: "A vision is forming...",
    imageDisclaimer: "Image is an artistic interpretation of the scene.",
    loadError: "Failed to load the story. Please try refreshing.",
    universal_input_placeholder: "What do you do?",
    endOfTale: "The End of the Tale",
    playAgain: "Play Again",
    echoes_earned: "You gathered {count} Echoes.",
    run_summary: "{turns} survived in a world of difficulty {difficulty}/10.",
    
    errorParse: "Could not parse the story continuation. The thread of fate is tangled.",
    errorConnection: "The connection to the ethereal plane was lost.",
        
    library_title: "Journey Library",
    library_back_to_menu: "Back to Menu",
    library_no_journeys: "Your library is empty. Complete a journey to save it here.",
    library_journey_date: "Date",
    library_journey_world: "World",
    library_journey_turns: "Turns",
    library_journey_difficulty: "Difficulty",
    library_view_button: "View",
    library_delete_button: "Delete",
    library_export_button: "Export to File",
    library_delete_confirm: "Are you sure you want to delete this journey forever?",
    library_final_outcome: "Final Outcome",
    library_character: "Character",
    library_story_log: "Story Log",
    library_save_journey: "Save Journey to Library",
    library_journey_saved: "Journey Saved!",
  },
  pt: {
    title: "Earth of Dungeons",
    subtitle: "A História de um Invocado",
    description: "Explore o Mundo de magia",
    beginJourney: "Nova Jornada",
    selectLanguage: "Idioma:",
    narrativeModeLabel: "Estilo da Narrativa:",
    narrativeModeComplete: "Completo",
    narrativeModeSummary: "Resumido",
    enableImageGeneration: "Habilitar Geração de Imagem",
    enableNarration: "Habilitar Narração por IA",
    enableSoundEffects: "Habilitar Efeitos Sonoros",
    load_game: "Carregar Jornada",
    shop_button: "Loja de Ecos",
    library_button: "Biblioteca de Jornadas",
    settings_button: "Configurações",
    settings_title: "Configurações",
    
    intro_prologue: [
      "Em um mundo que não é o seu...",
      "Invocado por um apelo desesperado...",
      "Sua história está prestes a começar."
    ],
    intro_continue: "Continuar",

    scenario_selection_title: "Escolha Seu Mundo",
    scenario_king_name: "O Reino Sitiado",
    scenario_church_name: "A Profecia Divina",
    scenario_mages_name: "Os Magos Renegados",
    scenario_ancestral_name: "O Mal Antigo",
    scenario_skyrim_name: "The Elder Scrolls: Skyrim",
    scenario_mushoku_tensei_name: "Mushoku Tensei: A Reencarnação do Desempregado",
    scenario_re_zero_name: "Re:Zero - Começando a Vida em Outro Mundo",
    scenario_shield_hero_name: "A Ascensão do Herói do Escudo",
    premium_badge: "Premium",

    tutorial_title: "Como Jogar",
    tutorial_welcome_title: "Bem-vindo, Invocado",
    tutorial_welcome_desc: "Este é um mundo moldado por suas decisões. A história é gerada por um Mestre de Jogo de IA, tornando cada partida única.",
    tutorial_keywords_title: "Mundo Interativo",
    tutorial_keywords_desc: "Você encontrará <span class='text-amber-400 font-bold'>palavras-chave destacadas</span> no texto. Clique nelas para saber mais sobre o mundo, seus personagens e suas próprias habilidades.",
    tutorial_choices_title: "Faça sua Escolha",
    tutorial_choices_desc: "Escolha uma das opções abaixo da história para agir. Às vezes, você pode até ser solicitado a digitar sua própria resposta. Escolha com sabedoria.",
    tutorial_combat_title: "Combate Tático",
    tutorial_combat_desc: "O combate é por turnos. No seu turno, você tem Pontos de Ação (PA) para gastar em movimentos. Planeje seu turno e clique em 'Terminar Turno' para ver os resultados!",
    tutorial_status_title: "Acompanhe seu Herói",
    tutorial_status_desc: "No topo da tela, você pode verificar seu Status para ver seus atributos, HP e inventário a qualquer momento.",
    tutorial_begin_adventure: "Comece sua Aventura",

    briefing_title: "Relatório do Mundo",
    briefing_world_name: "Nome do Mundo:",
    briefing_difficulty: "Dificuldade:",
    briefing_begin: "Entrar neste Mundo",

    shop_title: "Loja de Ecos",
    shop_back_to_menu: "Voltar ao Menu",
    shop_your_echoes: "Seus Ecos:",
    shop_item_hp_name: "Aumento de Vitalidade",
    shop_item_hp_desc: "Aumenta permanentemente seu HP inicial.",
    shop_item_potion_name: "Poção Inicial",
    shop_item_potion_desc: "Comece cada nova jornada com uma Poção de Vida em seu inventário.",
    shop_item_strength_name: "Kit de Pedra de Amolar",
    shop_item_strength_desc: "Aumenta permanentemente sua Força inicial.",
    shop_item_intellect_name: "Cristal Perspicaz",
    shop_item_intellect_desc: "Aumenta permanentemente sua Inteligência inicial.",
    shop_item_luck_name: "Amuleto da Sorte do Aventureiro",
    shop_item_luck_desc: "Aumenta permanentemente sua Sorte inicial.",
    shop_buy_button: "Comprar por {cost}",
    shop_max_level: "Nível Máximo",

    save_game: "Salvar Jogo",
    game_saved: "Jogo Salvo!",
    status_button: "Status",
    status_title: "Status do Jogador",
    hp: "HP",
    attributes: "Atributos",
    inventory: "Inventário",
    party: "Grupo",
    ap: "PA",

    combat_action_quick_attack: "Ataque Rápido",
    combat_action_quick_attack_desc: "Um golpe rápido de baixo dano.",
    combat_action_standard_attack: "Ataque Padrão",
    combat_action_standard_attack_desc: "Um ataque balanceado e confiável.",
    combat_action_power_attack: "Ataque Poderoso",
    combat_action_power_attack_desc: "Um ataque lento e pesado que causa dano massivo.",
    combat_action_defend: "Defender",
    combat_action_defend_desc: "Prepare-se para o impacto, reduzindo o dano recebido.",
    combat_action_aim: "Mirar",
    combat_action_aim_desc: "Concentre-se, melhorando a precisão e a chance de acerto crítico no próximo ataque deste turno.",
    combat_action_use_item: "Usar Item",
    combat_action_use_item_desc: "Use um item do seu inventário.",
    combat_action_special_move: "Movimento Especial",
    combat_action_special_move_desc: "Uma habilidade única e poderosa.",
    combat_end_turn: "Terminar Turno",
    
    scenario_king_prompt: "O jogador é invocado por um rei desesperado para salvar seu reino sitiado.",
    scenario_church_prompt: "O jogador é invocado pela alta igreja, que acredita que ele seja um herói profetizado.",
    scenario_mages_prompt: "O jogador é invocado por um conluio de magos renegados para seus próprios propósitos misteriosos.",
    scenario_ancestral_prompt: "O jogador é invocado por uma magia ancestral de último recurso enquanto um mal antigo redesperta.",
    scenario_skyrim_prompt: "O jogador desperta no mundo de Skyrim, não necessariamente como o Dragonborn, mas como um aventureiro. Rumores do retorno de dragões e de uma guerra civil entre os Stormcloaks e o Império estão por toda parte. Sua jornada começa ao ser pego em uma emboscada perto da fronteira.",
    scenario_mushoku_tensei_prompt: "O jogador é reencarnado no Mundo das Seis Faces como uma criança em uma casa nobre menor no Reino de Asura. Ele retém suas memórias de uma vida passada. O mundo é cheio de magia e esgrima, e sua nova vida como aventureiro começa com sua primeira aula de magia.",
    scenario_re_zero_prompt: "O jogador é subitamente invocado para um mercado vibrante na capital de Lugnica. Ele está confuso e indefeso. Em breve, descobrirá uma maldição terrível: 'Retorno Através da Morte', que volta no tempo para um 'ponto de salvamento' sempre que ele morre. Seu primeiro desafio é simplesmente sobreviver ao dia.",
    scenario_shield_hero_prompt: "O jogador é invocado para o Reino de Melromarc como um dos Quatro Heróis Cardeais - o Herói do Escudo. Ele é quase imediatamente acusado de um crime que não cometeu, tornando-se um pária. Apenas com seu escudo defensivo e o mundo contra ele, ele deve encontrar uma maneira de ficar mais forte para enfrentar as Ondas de Calamidade que se aproximam.",


    summoningWorld: "Invocando um novo mundo...",
    writingDestiny: "O destino está sendo escrito...",
    generating_image: "Uma visão está se formando...",
    imageDisclaimer: "A imagem é uma interpretação artística da cena.",
    loadError: "Falha ao carregar a história. Por favor, tente atualizar.",
    universal_input_placeholder: "O que você faz?",
    endOfTale: "O Fim da História",
    playAgain: "Jogar Novamente",
    echoes_earned: "Você coletou {count} Ecos.",
    run_summary: "{turns} turnos sobrevividos em um mundo de dificuldade {difficulty}/10.",

    errorParse: "Não foi possível analisar a continuação da história. O fio do destino está emaranhado.",
    errorConnection: "A conexão com o plano etéreo foi perdida.",

    library_title: "Biblioteca de Jornadas",
    library_back_to_menu: "Voltar ao Menu",
    library_no_journeys: "Sua biblioteca está vazia. Complete uma jornada para salvá-la aqui.",
    library_journey_date: "Data",
    library_journey_world: "Mundo",
    library_journey_turns: "Turnos",
    library_journey_difficulty: "Dificuldade",
    library_view_button: "Ver",
    library_delete_button: "Excluir",
    library_export_button: "Exportar para Arquivo",
    library_delete_confirm: "Tem certeza de que deseja excluir esta jornada para sempre?",
    library_final_outcome: "Resultado Final",
    library_character: "Personagem",
    library_story_log: "Registro da História",
    library_save_journey: "Salvar Jornada na Biblioteca",
    library_journey_saved: "Jornada Salva!",
  },
};

export const languageNames: Record<Language, string> = {
    en: "English",
    pt: "Português",
};