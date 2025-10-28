export const Race = {
    Human: "humano",
    Dwarf: "anao",
    Elf: "elfo",
    HalfOrc: "meio-orc",
    Tiefling: "tiefling",
    Dragonborn: "dragonborn",
} as const;

export type RaceKey = typeof Race[keyof typeof Race];

export interface ItemInstance {
    id: string;
    plus: number;
    durability?: number;
}

export interface ItemStats {
    cura?: number;
    atk?: number;
    def?: number;
    str?: number;
    con?: number;
    dex?: number;
    lck_base?: number;
    xp_bonus?: number;
    gold_bonus?: number;
    hp_bonus_percent?: number;
    str_percent?: number;
    con_percent?: number;
    dex_percent?: number;
    lck_base_percent?: number;
    scaling?: {
        stat: 'str' | 'dex' | 'con' | 'lck_base';
        multiplier: number;
    };
    scaling_secondary?: {
        stat: 'str' | 'dex' | 'con' | 'lck_base';
        multiplier: number;
    };
}

export interface ItemData {
    id: string;
    icon: string;
    nome: string;
    tipo: string;
    stats?: ItemStats;
    valor: number;
    duravel?: boolean;
    tier: number;
}

export interface ClassBonusMult {
    strength?: number;
    constitution?: number;
    dexterity?: number;
    luck_base?: number;
}

// This is the "snapshot" - only essential, persistent data
export interface SavedCharacter {
    id: string;
    name: string;
    race: RaceKey;
    playerClass: string;
    level: number;
    xp: number;
    xp_proximo_nivel: number;
    stat_points: number;
    strength: number;
    constitution: number;
    dexterity: number;
    luck_base: number;
    carteira: number;
    gold_accumulated_run: number;
    inventario: ItemInstance[];
    equipado: {
        arma: ItemInstance | null;
        armadura: ItemInstance | null;
        amuleto: ItemInstance | null;
        anel: ItemInstance | null;
    };
    dungeons_completed: number;
    max_dungeon_level_reached: number;
    currentDungeonLevel: number;
    vault_gold: number;
    vault_inventario: ItemInstance[];
}

// This is the "live" object for gameplay, with calculated and volatile stats
export interface Player extends SavedCharacter {
    vida: number;
    vida_max_total: number;
    ataque_total: number;
    defesa_total: number;
    luck: number;
    xp_bonus: number;
    gold_bonus: number;
}


export interface EnemyData {
    base_key: string;
    nome: string;
    tier: number;
    base_hp: number;
    scale_hp: number;
    base_atk: number;
    scale_atk: number;
    base_def: number;
    scale_def: number;
    base_xp: number;
    scale_xp: number;
    base_gold: number;
    scale_gold: number;
    drop_chance: number;
    drop_table: string[];
}

export interface Enemy {
    nome: string;
    base_key: string;
    tier: number;
    vida: number;
    vida_max: number;
    ataque: number;
    defesa: number;
    xp: number;
    gold: number;
    drop_chance: number;
    drop_table: string[];
    isBoss: boolean;
}

export interface CurrentEncounter {
    type: 'exploring' | 'enemy' | 'trap' | 'treasure' | 'cleared';
    enemy?: Enemy;
}