import { EnemyData } from '../types';

type PrefixData = { multipliers: [number, number, number, number, number], weight: number };

export const PREFIXES_WEAKENED: Record<string, PrefixData> = {
    "Wounded":    { multipliers: [0.5, 0.6, 0.7, 0.5, 0.5], weight: 33 },
    "Malnourished":{ multipliers: [0.6, 0.5, 0.5, 0.5, 0.5], weight: 33 },
    "Hesitant": { multipliers: [0.7, 0.7, 0.8, 0.6, 0.6], weight: 34 },
};

export const PREFIXES_WEAK: Record<string, PrefixData> = {
    "Small": { multipliers: [0.7, 0.8, 0.9, 0.7, 0.7], weight: 40 },
    "Young":   { multipliers: [0.8, 0.9, 0.9, 0.8, 0.8], weight: 40 },
    "Hatchling": { multipliers: [0.6, 0.7, 0.7, 0.6, 0.6], weight: 20 },
};

export const PREFIXES_MEDIUM: Record<string, PrefixData> = {
    "Greater":   { multipliers: [1.2, 1.1, 1.0, 1.2, 1.1], weight: 25 },
    "Swift":   { multipliers: [0.9, 1.2, 1.1, 1.1, 1.0], weight: 25 },
    "Bestial": { multipliers: [1.1, 1.0, 1.3, 1.2, 1.1], weight: 20 },
    "Shadow": { multipliers: [1.0, 1.2, 1.2, 1.3, 1.2], weight: 20 },
    "Brute":   { multipliers: [0.8, 1.1, 1.3, 1.3, 1.3], weight: 10 },
};

export const PREFIXES_STRONG: Record<string, PrefixData> = {
    "Insane":  { multipliers: [0.9, 1.2, 1.0, 1.2, 1.1], weight: 40 },
    "Giant": { multipliers: [1.5, 1.2, 1.1, 1.4, 1.3], weight: 30 },
    "Ancient":  { multipliers: [1.3, 1.25, 0.9, 1.3, 1.2], weight: 25 },
    "Titanic":{ multipliers: [1.8, 1.35, 1.2, 1.5, 1.5], weight: 5 },
};

export const RACES = {
  "humano": { nome: "Human", desc: "Versatile and adaptable, starts balanced.", bonus: { "strength": 1, "constitution": 1, "dexterity": 1, "luck_base": 1, "gold": 10 }, habilidade_passiva: { nome: "Adaptability", desc: "+10% XP gained. Every 4 levels, gain a scaling bonus (+1 at lvl 4, +2 at lvl 8, etc.) to your lowest base attribute." } },
  "anao": { nome: "Dwarf", desc: "Sturdy and strong, but less agile.", bonus: { "strength": 2, "constitution": 2, "dexterity": -1, "luck_base": 1, "gold": 25 }, habilidade_passiva: { nome: "Skilled Artisan", desc: "Item durability loss in combat is halved." } },
  "elfo": { nome: "Elf", desc: "Agile and perceptive, but more fragile.", bonus: { "strength": 0, "constitution": -1, "dexterity": 3, "luck_base": 2, "gold": 15 }, habilidade_passiva: { nome: "Keen Senses", desc: "Reduces trap trigger chance by 40%, increases treasure find chance by 25%, and grants a 5% base chance to dodge attacks." } },
  "meio-orc": { nome: "Half-Orc", desc: "Brutal and powerful, but with little luck.", bonus: { "strength": 3, "constitution": 2, "dexterity": -1, "luck_base": -1, "gold": 0 }, habilidade_passiva: { nome: "Growing Rage", desc: "Below 50% HP, gain +15% STR but lose -10% DEX. Below 25% HP, these effects double to +30% STR and -20% DEX." } },
  "tiefling": { nome: "Tiefling", desc: "Descendants of infernal lineage, they possess a defiant resilience.", bonus: { "strength": 0, "constitution": 1, "dexterity": 1, "luck_base": 1, "gold": 0 }, habilidade_passiva: { nome: "Demonic Feast", desc: "Recover 5% of the defeated monster's max HP upon defeating it." } },
  "dragonborn": { nome: "Dragonborn", desc: "Drawing power from their draconic ancestry, their attacks are fearsome.", bonus: { "strength": 2, "constitution": 1, "dexterity": 0, "luck_base": 0, "gold": 0 }, habilidade_passiva: { nome: "Draconic Breath", desc: "Deal bonus elemental damage on your first attack. Has a chance to ignite the enemy, dealing bonus damage instantly and causing them to burn for 2 additional rounds." } }
};

export const CLASSES = {
    "barbarian": { nome: "Barbarian", desc: "Channels primal fury into devastating attacks. +15% bonus to total Strength.", bonus_mult: { strength: 0.15 } },
    "fighter": { nome: "Fighter", desc: "A master of arms, equally adept in attack and defense. +5% bonus to STR, DEX, and CON.", bonus_mult: { strength: 0.05, dexterity: 0.05, constitution: 0.05 } },
    "ranger": { nome: "Ranger", desc: "A keen-eyed survivor who strikes from the shadows. +10% bonus to DEX and +5% to LCK.", bonus_mult: { dexterity: 0.10, luck_base: 0.05 } },
    "rogue": { nome: "Rogue", desc: "A phantom of the battlefield, avoiding blows with uncanny grace. +15% bonus to total Dexterity.", bonus_mult: { dexterity: 0.15 } },
    "paladin": { nome: "Paladin", desc: "An unbreakable bastion of resilience and martial prowess. +10% bonus to CON and +5% to STR.", bonus_mult: { constitution: 0.10, strength: 0.05 } },
    "gambler": { nome: "Gambler", desc: "Relies on fortune and grit. +10% bonus to LCK and +5% to CON.", bonus_mult: { luck_base: 0.10, constitution: 0.05 } },
};

export const itens_db = {
    // --- Consumables (Tiered) ---
    "pocao_pequena": { id: "pocao_pequena", icon: '💧', nome: "Small Potion", tipo: "consumivel", stats: { 'cura': 40 }, valor: 20, tier: 1 },
    "pocao_media": { id: "pocao_media", icon: '💧', nome: "Medium Potion", tipo: "consumivel", stats: { 'cura': 90 }, valor: 55, tier: 2 },
    "pocao_grande": { id: "pocao_grande", icon: '💧', nome: "Large Potion", tipo: "consumivel", stats: { 'cura': 160 }, valor: 110, tier: 3 },
    "mega_pocao": { id: "mega_pocao", icon: '💧', nome: "Mega Potion", tipo: "consumivel", stats: { 'cura': 250 }, valor: 180, tier: 4 },
    "super_pocao": { id: "super_pocao", icon: '💧', nome: "Super Potion", tipo: "consumivel", stats: { 'cura': 400 }, valor: 320, tier: 5 },
    "elixir_final": { id: "elixir_final", icon: '💧', nome: "Final Elixir", tipo: "consumivel", stats: { 'cura': 700 }, valor: 550, tier: 6 },
    "oleo_afiado": { id: "oleo_afiado", icon: '🧪', nome: "Oil of Mending", tipo: "consumivel", stats: { 'cura': 60 }, valor: 35, tier: 2 },
    "pocao_pele_pedra": { id: "pocao_pele_pedra", icon: '🧪', nome: "Stoneskin Draught", tipo: "consumivel", stats: { 'cura': 120 }, valor: 75, tier: 3 },
    "elixir_fortitude": { id: "elixir_fortitude", icon: '🧪', nome: "Elixir of Vigor", tipo: "consumivel", stats: { 'cura': 200 }, valor: 140, tier: 4 },
 
    // --- Weapons (Tiered, with Scaling) ---
    "adaga_ferrugem": { id: "adaga_ferrugem", icon: '🔪', nome: "Rusty Dagger", tipo: "arma", stats: { 'atk': 2 }, valor: 15, duravel: true, tier: 1 },
    "clava_madeira": { id: "clava_madeira", icon: '🪵', nome: "Wooden Club", tipo: "arma", stats: { 'atk': 4, scaling: { stat: 'str', multiplier: 0.1 } }, valor: 45, duravel: true, tier: 1 },
    "espada_curta": { id: "espada_curta", icon: '🗡️', nome: "Short Sword", tipo: "arma", stats: { 'atk': 6, scaling: { stat: 'dex', multiplier: 0.15 } }, valor: 90, duravel: true, tier: 2 },
    "maca": { id: "maca", icon: '🔨', nome: "Mace", tipo: "arma", stats: { 'atk': 8 }, valor: 150, duravel: true, tier: 2 },
    "rapier": { id: "rapier", icon: '🗡️', nome: "Rapier", tipo: "arma", stats: { 'atk': 7, scaling: { stat: 'dex', multiplier: 0.20 } }, valor: 170, duravel: true, tier: 2 },
    "machado_mao": { id: "machado_mao", icon: '🪓', nome: "Hand Axe", tipo: "arma", stats: { 'atk': 10, scaling: { stat: 'str', multiplier: 0.2 } }, valor: 220, duravel: true, tier: 3 },
    "espada_longa": { id: "espada_longa", icon: '🗡️', nome: "Longsword", tipo: "arma", stats: { 'atk': 12 }, valor: 300, duravel: true, tier: 3 },
    "morningstar": { id: "morningstar", icon: '🔨', nome: "Morningstar", tipo: "arma", stats: { 'atk': 11, scaling: { stat: 'str', multiplier: 0.18 } }, valor: 260, duravel: true, tier: 3 },
    "martelo_guerra": { id: "martelo_guerra", icon: '🔨', nome: "Warhammer", tipo: "arma", stats: { 'atk': 15, scaling: { stat: 'str', multiplier: 0.25 } }, valor: 450, duravel: true, tier: 4 },
    "espada_bastarda": { id: "espada_bastarda", icon: '⚔️', nome: "Bastard Sword", tipo: "arma", stats: { 'atk': 17, scaling: { stat: 'dex', multiplier: 0.2 } }, valor: 550, duravel: true, tier: 4 },
    "scimitar": { id: "scimitar", icon: '🗡️', nome: "Scimitar", tipo: "arma", stats: { 'atk': 16, scaling: { stat: 'dex', multiplier: 0.22 } }, valor: 500, duravel: true, tier: 4 },
    "machado_batalha": { id: "machado_batalha", icon: '🪓', nome: "Battle Axe", tipo: "arma", stats: { 'atk': 20 }, valor: 700, duravel: true, tier: 5 },
    "espadona_aco": { id: "espadona_aco", icon: '⚔️', nome: "Steel Greatsword", tipo: "arma", stats: { 'atk': 24, scaling: { stat: 'str', multiplier: 0.3 } }, valor: 900, duravel: true, tier: 5 },
    "halberd": { id: "halberd", icon: '🪓', nome: "Halberd", tipo: "arma", stats: { 'atk': 22, scaling: { stat: 'str', multiplier: 0.28 } }, valor: 800, duravel: true, tier: 5 },
    "lamina_runica": { id: "lamina_runica", icon: '✨', nome: "Runic Blade", tipo: "arma", stats: { 'atk': 28, 'lck_base': 2, scaling: { stat: 'lck_base', multiplier: 0.5 } }, valor: 1200, duravel: true, tier: 6 },
    "martelo_terremoto": { id: "martelo_terremoto", icon: '🔨', nome: "Earthquake Maul", tipo: "arma", stats: { 'atk': 33, scaling: { stat: 'con', multiplier: 0.4 } }, valor: 1500, duravel: true, tier: 6 },
    "katana": { id: "katana", icon: '⚔️', nome: "Katana", tipo: "arma", stats: { 'atk': 25, scaling: { stat: 'dex', multiplier: 0.4 } }, valor: 1350, duravel: true, tier: 6 },
    "maca_brilhante": { id: "maca_brilhante", icon: '✨', nome: "Glimmering Mace", tipo: "arma", stats: { 'atk': 30, 'lck_base': 3, scaling: { stat: 'lck_base', multiplier: 0.6 } }, valor: 1600, duravel: true, tier: 6 },
    "espada_draconica": { id: "espada_draconica", icon: '🐉', nome: "Dragonfang", tipo: "arma", stats: { 'atk': 40, scaling: { stat: 'str', multiplier: 0.4 } }, valor: 2500, duravel: true, tier: 7 },
    "ceifadora_almas": { id: "ceifadora_almas", icon: '💀', nome: "Soul Reaver", tipo: "arma", stats: { 'atk': 45, scaling: { stat: 'str', multiplier: 0.3 }, scaling_secondary: { stat: 'con', multiplier: 0.2 } }, valor: 2800, duravel: true, tier: 7 },

    // --- Armor (Tiered, with Scaling) ---
    "roupas_rasgadas": { id: "roupas_rasgadas", icon: '👕', nome: "Torn Clothes", tipo: "armadura", stats: { 'def': 1 }, valor: 12, duravel: true, tier: 1 },
    "armadura_couro": { id: "armadura_couro", icon: '🧥', nome: "Leather Armor", tipo: "armadura", stats: { 'def': 3 }, valor: 55, duravel: true, tier: 1 },
    "couro_batido": { id: "couro_batido", icon: '🧥', nome: "Hardened Leather", tipo: "armadura", stats: { 'def': 5, scaling: { stat: 'dex', multiplier: 0.15 } }, valor: 110, duravel: true, tier: 2 },
    "cota_malha": { id: "cota_malha", icon: '⛓️', nome: "Chain Mail", tipo: "armadura", stats: { 'def': 7 }, valor: 200, duravel: true, tier: 2 },
    "couro_reforcado": { id: "couro_reforcado", icon: '🧥', nome: "Studded Leather", tipo: "armadura", stats: { 'def': 6, scaling: { stat: 'dex', multiplier: 0.18 } }, valor: 180, duravel: true, tier: 2 },
    "armadura_escamas": { id: "armadura_escamas", icon: '🛡️', nome: "Scale Mail", tipo: "armadura", stats: { 'def': 9, scaling: { stat: 'con', multiplier: 0.2 } }, valor: 320, duravel: true, tier: 3 },
    "malha_talas": { id: "malha_talas", icon: '⛓️', nome: "Splint Mail", tipo: "armadura", stats: { 'def': 8, scaling: { stat: 'con', multiplier: 0.25 } }, valor: 280, duravel: true, tier: 3 },
    "peitoral_aco": { id: "peitoral_aco", icon: '🛡️', nome: "Steel Breastplate", tipo: "armadura", stats: { 'def': 11 }, valor: 450, duravel: true, tier: 4 },
    "meia_placa": { id: "meia_placa", icon: '🛡️', nome: "Half Plate", tipo: "armadura", stats: { 'def': 12, 'dex': -2 }, valor: 520, duravel: true, tier: 4 },
    "placas_completas": { id: "placas_completas", icon: '🛡️', nome: "Full Plate Armor", tipo: "armadura", stats: { 'def': 14, scaling: { stat: 'con', multiplier: 0.3 } }, valor: 750, duravel: true, tier: 5 },
    "placa_obsidiana": { id: "placa_obsidiana", icon: '🛡️', nome: "Obsidian Plate", tipo: "armadura", stats: { 'def': 16, 'atk': 5, scaling: { stat: 'str', multiplier: 0.15 } }, valor: 950, duravel: true, tier: 5 },
    "armadura_mithril": { id: "armadura_mithril", icon: '✨', nome: "Mithril Plate", tipo: "armadura", stats: { 'def': 18, scaling: { stat: 'dex', multiplier: 0.3 } }, valor: 1300, duravel: true, tier: 6 },
    "cota_elfica": { id: "cota_elfica", icon: '✨', nome: "Elven Chainmail", tipo: "armadura", stats: { 'def': 15, scaling: { stat: 'dex', multiplier: 0.4 } }, valor: 1500, duravel: true, tier: 6 },
    "armadura_draconica": { id: "armadura_draconica", icon: '🐉', nome: "Dragonscale Armor", tipo: "armadura", stats: { 'def': 22, scaling: { stat: 'str', multiplier: 0.25 } }, valor: 2200, duravel: true, tier: 7 },
    "placa_arconte": { id: "placa_arconte", icon: '🛡️', nome: "Archon Plate", tipo: "armadura", stats: { 'def': 25, 'hp_bonus_percent': 0.10, scaling: { stat: 'con', multiplier: 0.35 } }, valor: 2600, duravel: true, tier: 7 },
    
    // --- Amulets (REWORKED: % HP, XP, Gold bonuses. Now Durable) ---
    "amuleto_vitalidade": { id: "amuleto_vitalidade", icon: '📿', nome: "Charm of Vitality", tipo: "amuleto", stats: { 'hp_bonus_percent': 0.10 }, valor: 150, duravel: true, tier: 2 },
    "amuleto_lutador": { id: "amuleto_lutador", icon: '📿', nome: "Amulet of the Brawler", tipo: "amuleto", stats: { 'str': 3 }, valor: 200, duravel: true, tier: 2 },
    "talisma_aprendiz": { id: "talisma_aprendiz", icon: '📿', nome: "Scholar's Talisman", tipo: "amuleto", stats: { 'xp_bonus': 0.15 }, valor: 300, duravel: true, tier: 3 },
    "amuleto_guardiao": { id: "amuleto_guardiao", icon: '📿', nome: "Amulet of the Guardian", tipo: "amuleto", stats: { 'con': 3 }, valor: 250, duravel: true, tier: 3 },
    "pingente_avareza": { id: "pingente_avareza", icon: '📿', nome: "Pendant of Avarice", tipo: "amuleto", stats: { 'gold_bonus': 0.20 }, valor: 400, duravel: true, tier: 4 },
    "amuleto_agil": { id: "amuleto_agil", icon: '📿', nome: "Amulet of the Swift", tipo: "amuleto", stats: { 'dex': 3 }, valor: 220, duravel: true, tier: 4 },
    "gargantilha_prosperidade": { id: "gargantilha_prosperidade", icon: '📿', nome: "Choker of Prosperity", tipo: "amuleto", stats: { 'hp_bonus_percent': 0.15, 'gold_bonus': 0.15 }, valor: 750, duravel: true, tier: 5 },
    "amuleto_sabio": { id: "amuleto_sabio", icon: '📿', nome: "Amulet of the Sage", tipo: "amuleto", stats: { 'hp_bonus_percent': 0.10, 'xp_bonus': 0.20 }, valor: 900, duravel: true, tier: 5 },
    "amuleto_fortuna": { id: "amuleto_fortuna", icon: '📿', nome: "Amulet of Fortune", tipo: "amuleto", stats: { 'lck_base': 5, 'gold_bonus': 0.10 }, valor: 600, duravel: true, tier: 5 },
    "medalhao_heroi": { id: "medalhao_heroi", icon: '📿', nome: "Hero's Medallion", tipo: "amuleto", stats: { 'hp_bonus_percent': 0.20, 'xp_bonus': 0.20, 'gold_bonus': 0.20 }, valor: 1500, duravel: true, tier: 6 },
    "gola_comando": { id: "gola_comando", icon: '📿', nome: "Gorget of Command", tipo: "amuleto", stats: { 'str_percent': 0.12, 'con_percent': 0.12 }, valor: 1200, duravel: true, tier: 6 },
    "coracao_titan": { id: "coracao_titan", icon: '📿', nome: "Heart of the Titan", tipo: "amuleto", stats: { 'hp_bonus_percent': 0.30 }, valor: 1800, duravel: true, tier: 7 },

    // --- Rings (REWORKED: % stat bonuses. Now Durable) ---
    "anel_agilidade": { id: "anel_agilidade", icon: '💍', nome: "Ring of Agility", tipo: "anel", stats: { 'dex_percent': 0.10 }, valor: 180, duravel: true, tier: 2 },
    "anel_poder": { id: "anel_poder", icon: '💍', nome: "Ring of Might", tipo: "anel", stats: { 'str_percent': 0.10 }, valor: 180, duravel: true, tier: 2 },
    "anel_protecao": { id: "anel_protecao", icon: '💍', nome: "Ring of Protection", tipo: "anel", stats: { 'def': 3 }, valor: 220, duravel: true, tier: 2 },
    "anel_resiliencia": { id: "anel_resiliencia", icon: '💍', nome: "Ring of Resilience", tipo: "anel", stats: { 'con_percent': 0.15 }, valor: 350, duravel: true, tier: 3 },
    "anel_precisao": { id: "anel_precisao", icon: '💍', nome: "Ring of Precision", tipo: "anel", stats: { 'atk': 5 }, valor: 300, duravel: true, tier: 3 },
    "anel_sortudo": { id: "anel_sortudo", icon: '💍', nome: "Gambler's Ring", tipo: "anel", stats: { 'lck_base_percent': 0.20 }, valor: 500, duravel: true, tier: 4 },
    "faixa_leal": { id: "faixa_leal", icon: '💍', nome: "Band of the Stalwart", tipo: "anel", stats: { 'def': 4, 'con_percent': 0.10 }, valor: 650, duravel: true, tier: 4 },
    "anel_guerreiro": { id: "anel_guerreiro", icon: '💍', nome: "Warrior's Signet", tipo: "anel", stats: { 'str_percent': 0.15, 'con_percent': 0.10 }, valor: 800, duravel: true, tier: 5 },
    "anel_sombra": { id: "anel_sombra", icon: '💍', nome: "Band of Shadows", tipo: "anel", stats: { 'dex_percent': 0.15, 'lck_base_percent': 0.10 }, valor: 850, duravel: true, tier: 5 },
    "anel_vibora": { id: "anel_vibora", icon: '💍', nome: "Ring of the Viper", tipo: "anel", stats: { 'atk': 6, 'dex_percent': 0.10 }, valor: 900, duravel: true, tier: 5 },
    "anel_rei_heroi": { id: "anel_rei_heroi", icon: '💍', nome: "Ring of the Hero-King", tipo: "anel", stats: { 'str_percent': 0.20, 'con_percent': 0.20 }, valor: 1600, duravel: true, tier: 6 },
    "anel_furioso": { id: "anel_furioso", icon: '💍', nome: "Ring of the Berserker", tipo: "anel", stats: { 'str_percent': 0.25, 'def': -8 }, valor: 1200, duravel: true, tier: 6 },
    "anel_soberano": { id: "anel_soberano", icon: '💍', nome: "Sovereign Band", tipo: "anel", stats: { 'str_percent': 0.15, 'dex_percent': 0.15, 'con_percent': 0.15 }, valor: 2500, duravel: true, tier: 7 },
    "anel_soberano_supremo": { id: "anel_soberano_supremo", icon: '💍', nome: "Ring of the Overlord", tipo: "anel", stats: { 'str': 3, 'con': 3, 'dex': 3, 'lck_base': 3 }, valor: 2800, duravel: true, tier: 7 },
};

export const inimigos_db: Record<string, EnemyData> = {
    // Tier 1
    "Rat":    { base_key: "Rat", nome: "Rat", tier: 1, base_hp: 30, scale_hp: 7.0, base_atk: 6, scale_atk: 1.3, base_def: 1, scale_def: 0.25, base_xp: 5, scale_xp: 1.8, base_gold: 1, scale_gold: 0.6, drop_chance: 0.06, drop_table: ["pocao_pequena"] },
    "Bat":    { base_key: "Bat", nome: "Bat", tier: 1, base_hp: 28, scale_hp: 6.0, base_atk: 7, scale_atk: 1.5, base_def: 0, scale_def: 0.2, base_xp: 6, scale_xp: 2.2, base_gold: 2, scale_gold: 0.8, drop_chance: 0.04, drop_table: [] },
    "Imp":    { base_key: "Imp", nome: "Imp", tier: 1, base_hp: 35, scale_hp: 7.5, base_atk: 8, scale_atk: 1.6, base_def: 2, scale_def: 0.3, base_xp: 10, scale_xp: 4.0, base_gold: 4, scale_gold: 1.3, drop_chance: 0.09, drop_table: ["pocao_pequena"] },
    "Kobold": { base_key: "Kobold", nome: "Kobold", tier: 1, base_hp: 45, scale_hp: 8.5, base_atk: 7, scale_atk: 1.5, base_def: 3, scale_def: 0.4, base_xp: 12, scale_xp: 4.5, base_gold: 5, scale_gold: 1.5, drop_chance: 0.15, drop_table: ["adaga_ferrugem", "pocao_pequena"] },
    "Zombie": { base_key: "Zombie", nome: "Zombie", tier: 1, base_hp: 70, scale_hp: 10.0, base_atk: 6, scale_atk: 1.2, base_def: 1, scale_def: 0.35, base_xp: 11, scale_xp: 4.0, base_gold: 3, scale_gold: 1.0, drop_chance: 0.07, drop_table: ["roupas_rasgadas"] },
    "Pixie":  { base_key: "Pixie", nome: "Pixie", tier: 1, base_hp: 25, scale_hp: 4.5, base_atk: 8, scale_atk: 1.4, base_def: 1, scale_def: 0.3, base_xp: 9, scale_xp: 3.0, base_gold: 4, scale_gold: 0.9, drop_chance: 0.04, drop_table: [] },

    // Tier 2
    "Wolf":     { base_key: "Wolf", nome: "Wolf", tier: 2, base_hp: 40, scale_hp: 8.5, base_atk: 9, scale_atk: 1.6, base_def: 2, scale_def: 0.4, base_xp: 13, scale_xp: 4.8, base_gold: 6, scale_gold: 2.2, drop_chance: 0.10, drop_table: ["armadura_couro", "pocao_pequena", "rapier"] },
    "Boar":     { base_key: "Boar", nome: "Boar", tier: 2, base_hp: 65, scale_hp: 10.0, base_atk: 7, scale_atk: 1.4, base_def: 4, scale_def: 0.5, base_xp: 16, scale_xp: 5.0, base_gold: 8, scale_gold: 2.5, drop_chance: 0.08, drop_table: ["clava_madeira"] },
    "Spider":   { base_key: "Spider", nome: "Spider", tier: 2, base_hp: 45, scale_hp: 9.0, base_atk: 10, scale_atk: 1.7, base_def: 2, scale_def: 0.35, base_xp: 17, scale_xp: 5.5, base_gold: 9, scale_gold: 2.8, drop_chance: 0.08, drop_table: [] },
    "Snake":    { base_key: "Snake", nome: "Snake", tier: 2, base_hp: 42, scale_hp: 8.0, base_atk: 7, scale_atk: 1.5, base_def: 5, scale_def: 0.6, base_xp: 14, scale_xp: 4.8, base_gold: 7, scale_gold: 2.2, drop_chance: 0.09, drop_table: ["adaga_ferrugem"] },
    "Ghost":    { base_key: "Ghost", nome: "Ghost", tier: 2, base_hp: 40, scale_hp: 7.5, base_atk: 11, scale_atk: 1.8, base_def: 4, scale_def: 0.5, base_xp: 19, scale_xp: 6.5, base_gold: 10, scale_gold: 2.8, drop_chance: 0.02, drop_table: [] },
    "Cultist":  { base_key: "Cultist", nome: "Cultist", tier: 2, base_hp: 55, scale_hp: 9.5, base_atk: 12, scale_atk: 1.9, base_def: 4, scale_def: 0.55, base_xp: 25, scale_xp: 7.5, base_gold: 14, scale_gold: 4.5, drop_chance: 0.18, drop_table: ["pocao_media", "espada_curta", "amuleto_lutador"] },
    "Harpy":    { base_key: "Harpy", nome: "Harpy", tier: 2, base_hp: 50, scale_hp: 8.0, base_atk: 10, scale_atk: 2.0, base_def: 3, scale_def: 0.4, base_xp: 22, scale_xp: 7.0, base_gold: 12, scale_gold: 4.0, drop_chance: 0.12, drop_table: ["oleo_afiado"] },
    "Worm":     { base_key: "Worm", nome: "Worm", tier: 2, base_hp: 70, scale_hp: 11.0, base_atk: 6, scale_atk: 1.2, base_def: 3, scale_def: 0.5, base_xp: 16, scale_xp: 5.5, base_gold: 8, scale_gold: 2.8, drop_chance: 0.05, drop_table: ["couro_batido"] },
    "Naga":     { base_key: "Naga", nome: "Naga", tier: 2, base_hp: 65, scale_hp: 10.0, base_atk: 8, scale_atk: 1.8, base_def: 6, scale_def: 0.65, base_xp: 24, scale_xp: 7.5, base_gold: 15, scale_gold: 5.0, drop_chance: 0.11, drop_table: ["pocao_media"] },

    // Tier 3
    "Orc":      { base_key: "Orc", nome: "Orc", tier: 3, base_hp: 80, scale_hp: 12.0, base_atk: 13, scale_atk: 1.7, base_def: 5, scale_def: 0.6, base_xp: 30, scale_xp: 8.0, base_gold: 15, scale_gold: 5.0, drop_chance: 0.14, drop_table: ["machado_mao", "couro_batido", "pocao_media", "morningstar", "anel_protecao"] },
    "Elemental":{ base_key: "Elemental", nome: "Elemental", tier: 3, base_hp: 60, scale_hp: 9.0, base_atk: 12, scale_atk: 2.0, base_def: 8, scale_def: 0.8, base_xp: 38, scale_xp: 8.5, base_gold: 19, scale_gold: 5.0, drop_chance: 0.08, drop_table: ["pocao_pele_pedra"] },
    "Bear":     { base_key: "Bear", nome: "Bear", tier: 3, base_hp: 90, scale_hp: 12.5, base_atk: 12, scale_atk: 1.6, base_def: 5, scale_def: 0.65, base_xp: 35, scale_xp: 9.0, base_gold: 17, scale_gold: 5.0, drop_chance: 0.09, drop_table: ["pocao_grande"] },
    "Troll":    { base_key: "Troll", nome: "Troll", tier: 3, base_hp: 100, scale_hp: 14.0, base_atk: 14, scale_atk: 1.8, base_def: 4, scale_def: 0.5, base_xp: 40, scale_xp: 10.0, base_gold: 20, scale_gold: 6.0, drop_chance: 0.11, drop_table: ["espada_longa", "pocao_grande", "amuleto_guardiao"] },
    "Basilisk": { base_key: "Basilisk", nome: "Basilisk", tier: 3, base_hp: 85, scale_hp: 12.0, base_atk: 13, scale_atk: 1.9, base_def: 7, scale_def: 0.75, base_xp: 42, scale_xp: 9.5, base_gold: 24, scale_gold: 6.0, drop_chance: 0.13, drop_table: ["cota_malha", "malha_talas"] },

    // Tier 4
    "Golem":    { base_key: "Golem", nome: "Golem", tier: 4, base_hp: 120, scale_hp: 15.0, base_atk: 14, scale_atk: 1.5, base_def: 12, scale_def: 1.0, base_xp: 60, scale_xp: 12.5, base_gold: 33, scale_gold: 9.0, drop_chance: 0.12, drop_table: ["peitoral_aco", "maca", "scimitar", "anel_precisao"] },
    "Yeti":     { base_key: "Yeti", nome: "Yeti", tier: 4, base_hp: 100, scale_hp: 14.0, base_atk: 16, scale_atk: 2.0, base_def: 6, scale_def: 0.7, base_xp: 55, scale_xp: 13.5, base_gold: 38, scale_gold: 10.0, drop_chance: 0.11, drop_table: ["machado_batalha", "elixir_fortitude"] },
    "Xanthous": { base_key: "Xanthous", nome: "Xanthous", tier: 4, base_hp: 90, scale_hp: 12.5, base_atk: 18, scale_atk: 2.2, base_def: 8, scale_def: 0.85, base_xp: 70, scale_xp: 14.5, base_gold: 42, scale_gold: 11.0, drop_chance: 0.12, drop_table: ["mega_pocao", "espada_longa"] },
    "Dragon":   { base_key: "Dragon", nome: "Dragon", tier: 4, base_hp: 150, scale_hp: 16.0, base_atk: 20, scale_atk: 2.5, base_def: 9, scale_def: 0.8, base_xp: 100, scale_xp: 17.0, base_gold: 55, scale_gold: 14.0, drop_chance: 0.20, drop_table: ["espadona_aco", "mega_pocao", "amuleto_agil"] },
};

export const BOSS_CANDIDATE_KEYS = ["Basilisk", "Dragon", "Golem", "Orc", "Troll", "Bear", "Xanthous", "Yeti"];

export const BOSS_POOL_BY_TIER = {
    1: ["Kobold", "Zombie"],
    2: ["Cultist", "Harpy", "Naga"],
    3: ["Orc", "Troll", "Basilisk", "Bear"],
    4: ["Golem", "Yeti", "Xanthous"],
    5: ["Dragon"]
};