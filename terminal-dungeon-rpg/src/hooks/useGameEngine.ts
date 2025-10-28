import { useState, useEffect, useCallback, useRef } from 'react';
import { Player, Race, RaceKey, CurrentEncounter, Enemy, ItemStats, ItemData, ClassBonusMult, EnemyData } from '../types';
import { getDynamicDescription } from '../services/geminiService';
import * as C from '../constants';
import { RACES, CLASSES, itens_db, inimigos_db, BOSS_POOL_BY_TIER, PREFIXES_WEAKENED, PREFIXES_WEAK, PREFIXES_MEDIUM, PREFIXES_STRONG, BOSS_CANDIDATE_KEYS } from '../data/gameData';

export const calculateStats = (player: Player | null): Player | null => {
    if (!player) return null;
    
    const p = { ...player, equipado: { ...player.equipado } };

    // 1. Initialize bonuses
    let flatStr = 0, flatCon = 0, flatDex = 0, flatLck = 0;
    let percentStr = 0, percentCon = 0, percentDex = 0, percentLck = 0;
    let percentHp = 0;
    let bonusAtk = 0, bonusDef = 0;
    p.xp_bonus = 0;
    p.gold_bonus = 0;
    
    // 2. Sum bonuses from equipment
    for (const slot of ['arma', 'armadura', 'amuleto', 'anel']) {
        const itemInst = p.equipado[slot as keyof typeof p.equipado];
        if (itemInst && (itemInst.durability === undefined || itemInst.durability > 0)) {
            const itemData = itens_db[itemInst.id as keyof typeof itens_db] as ItemData;
            if (itemData?.stats) {
                const stats = itemData.stats;
                bonusAtk += stats.atk || 0;
                bonusDef += stats.def || 0;
                flatStr += stats.str || 0;
                flatCon += stats.con || 0;
                flatDex += stats.dex || 0;
                flatLck += stats.lck_base || 0;
                p.xp_bonus += stats.xp_bonus || 0;
                p.gold_bonus += stats.gold_bonus || 0;

                // Percentage stats
                percentHp += stats.hp_bonus_percent || 0;
                percentStr += stats.str_percent || 0;
                percentCon += stats.con_percent || 0;
                percentDex += stats.dex_percent || 0;
                percentLck += stats.lck_base_percent || 0;
            }
        }
    }
    
    // 3. Apply bonuses in order: (Base + Flat) * Percent * Class
    const classBonusMult: ClassBonusMult = CLASSES[p.playerClass as keyof typeof CLASSES]?.bonus_mult || {};

    const baseStrWithFlat = p.strength + flatStr;
    const baseConWithFlat = p.constitution + flatCon;
    const baseDexWithFlat = p.dexterity + flatDex;
    const baseLckWithFlat = p.luck_base + flatLck;

    const strWithPercent = baseStrWithFlat * (1 + percentStr);
    const conWithPercent = baseConWithFlat * (1 + percentCon);
    const dexWithPercent = baseDexWithFlat * (1 + percentDex);
    const lckWithPercent = baseLckWithFlat * (1 + percentLck);

    let totalStr = Math.floor(strWithPercent * (1 + (classBonusMult.strength || 0)));
    const totalCon = Math.floor(conWithPercent * (1 + (classBonusMult.constitution || 0)));
    let totalDex = Math.floor(dexWithPercent * (1 + (classBonusMult.dexterity || 0)));
    const totalLck = Math.floor(lckWithPercent * (1 + (classBonusMult.luck_base || 0)));

    // Calculate HP Max before potential attribute modifications for Half-Orc passive
    p.vida_max_total = C.HP_BASE_START + totalCon * C.HP_PER_CON;
    p.vida_max_total = Math.floor(p.vida_max_total * (1 + percentHp));

    // Half-Orc "Growing Rage" Logic
    if (p.race === Race.HalfOrc) {
        const hpPercent = p.vida > 0 && p.vida_max_total > 0 ? p.vida / p.vida_max_total : 1;
        if (hpPercent < 0.25) {
            // Double effect
            totalStr = Math.floor(totalStr * 1.30); // +30% STR
            totalDex = Math.floor(totalDex * 0.80); // -20% DEX
        } else if (hpPercent < 0.50) {
            // Normal effect
            totalStr = Math.floor(totalStr * 1.15); // +15% STR
            totalDex = Math.floor(totalDex * 0.90); // -10% DEX
        }
    }

    // 4. Calculate scaling bonuses from attributes (AFTER attributes are finalized)
    let scalingAtk = 0, scalingDef = 0;
    const finalAttributes = { str: totalStr, con: totalCon, dex: totalDex, lck_base: totalLck };

    for (const slot of ['arma', 'armadura']) {
        const itemInst = p.equipado[slot as keyof typeof p.equipado];
        if (itemInst && (itemInst.durability === undefined || itemInst.durability > 0)) {
            const itemData = itens_db[itemInst.id as keyof typeof itens_db] as ItemData;
            const stats = itemData?.stats;
            if (stats) {
                if (stats.scaling) {
                    const scalingStatValue = finalAttributes[stats.scaling.stat];
                    const bonus = Math.floor(scalingStatValue * stats.scaling.multiplier);
                    if (slot === 'arma') scalingAtk += bonus;
                    if (slot === 'armadura') scalingDef += bonus;
                }
                if (stats.scaling_secondary) {
                    const scalingStatValue = finalAttributes[stats.scaling_secondary.stat];
                    const bonus = Math.floor(scalingStatValue * stats.scaling_secondary.multiplier);
                    if (slot === 'arma') scalingAtk += bonus;
                    if (slot === 'armadura') scalingDef += bonus;
                }
            }
        }
    }

    // 5. Calculate final derived stats
    p.ataque_total = C.ATK_BASE_START + totalStr * C.ATK_PER_STR + bonusAtk + scalingAtk;
    p.defesa_total = C.DEF_BASE_START + totalDex * C.DEF_PER_DEX + bonusDef + scalingDef;
    p.luck = totalLck;
    
    return p;
};

const findAndEquipBestForSlot = (player: Player, slot: keyof Player['equipado']): { player: Player, didEquip: boolean, equippedItemName?: string } => {
    const bestItemInInventory = player.inventario
        .map((item, index) => ({ item, index }))
        .filter(({ item }) => {
            const itemData = itens_db[item.id as keyof typeof itens_db] as ItemData;
            return itemData.tipo === slot && (item.durability === undefined || item.durability > 0);
        })
        .sort((a, b) => {
            const itemAData = itens_db[a.item.id as keyof typeof itens_db] as ItemData;
            const itemBData = itens_db[b.item.id as keyof typeof itens_db] as ItemData;
            return itemBData.valor - itemAData.valor;
        })[0];

    if (bestItemInInventory) {
        const playerCopy = JSON.parse(JSON.stringify(player));
        const itemToEquip = bestItemInInventory.item;

        // Remove from inventory
        playerCopy.inventario.splice(bestItemInInventory.index, 1);
        
        // Equip new item
        playerCopy.equipado[slot] = itemToEquip;

        const itemName = (itens_db[itemToEquip.id as keyof typeof itens_db] as ItemData).nome;

        return { player: playerCopy, didEquip: true, equippedItemName: itemName };
    }

    return { player, didEquip: false };
};


export const getInitialStats = (race: RaceKey) => {
    const raceBonus = RACES[race].bonus;
    return {
        strength: 5 + (raceBonus.strength || 0),
        constitution: 5 + (raceBonus.constitution || 0),
        dexterity: 5 + (raceBonus.dexterity || 0),
        luck_base: 5 + (raceBonus.luck_base || 0),
    };
};

export const createInitialPlayer = (name: string, race: RaceKey, playerClass: string): Player => {
  const initialGold = C.INITIAL_GOLD + (RACES[race].bonus.gold || 0);
  let player: Omit<Player, 'infernalLegacyUsedThisFloor'> = {
    id: `char_${Date.now()}`,
    name, race, playerClass, level: 1, xp: 0, xp_proximo_nivel: 60, stat_points: 0,
    ...getInitialStats(race),
    vida: 0, vida_max_total: 0, ataque_total: 0, defesa_total: 0, luck: 0,
    carteira: initialGold,
    gold_accumulated_run: initialGold,
    inventario: [{ id: "pocao_pequena", plus: 0 }, { id: "pocao_pequena", plus: 0 }],
    equipado: { arma: { id: "adaga_ferrugem", plus: 0, durability: 100 }, armadura: { id: "roupas_rasgadas", plus: 0, durability: 100 }, amuleto: null, anel: null },
    dungeons_completed: 0, max_dungeon_level_reached: 1,
    currentDungeonLevel: 1,
    xp_bonus: 0, gold_bonus: 0,
    vault_gold: 0,
    vault_inventario: [],
  };
  
  const finalPlayer = calculateStats(player as Player)!;
  finalPlayer.vida = finalPlayer.vida_max_total;
  return finalPlayer;
};

const weightedRandom = <T extends { weight: number }>(items: Record<string, T>): string => {
    const totalWeight = Object.values(items).reduce((sum, item) => sum + item.weight, 0);
    let random = Math.random() * totalWeight;
    for (const key in items) {
        random -= items[key].weight;
        if (random < 0) {
            return key;
        }
    }
    return "None"; // Fallback
};

const applyMonsterVariation = (baseKey: string, dungeonLevel: number): { name: string, multipliers: number[] } => {
    const baseEnemy = inimigos_db[baseKey];
    if (!baseEnemy) return { name: "Unknown", multipliers: [1, 1, 1, 1, 1] };

    const monsterTier = baseEnemy.tier;
    const tierDiff = monsterTier - dungeonLevel;
    const isBossCandidate = BOSS_CANDIDATE_KEYS.includes(baseKey);

    let useWeakenedPrefix = tierDiff >= 2 || (isBossCandidate && dungeonLevel < 3);
    
    let prefixPool: Record<string, { multipliers: number[], weight: number }> = {};

    if (useWeakenedPrefix) {
        prefixPool = PREFIXES_WEAKENED;
    } else {
        prefixPool = { "None": { multipliers: [1.0, 1.0, 1.0, 1.0, 1.0], weight: 100 } };
        if (dungeonLevel >= 1) { Object.assign(prefixPool, PREFIXES_WEAK); prefixPool["None"].weight = 60; }
        if (dungeonLevel >= 4) { Object.assign(prefixPool, PREFIXES_MEDIUM); prefixPool["None"].weight = 40; }
        if (dungeonLevel >= 8) { Object.assign(prefixPool, PREFIXES_STRONG); prefixPool["None"].weight = 20; }
    }

    const chosenPrefixKey = weightedRandom(prefixPool);
    
    if (chosenPrefixKey === "None") {
        return { name: baseEnemy.nome, multipliers: prefixPool["None"].multipliers };
    } else {
        const prefixData = prefixPool[chosenPrefixKey];
        return {
            name: `${chosenPrefixKey} ${baseEnemy.nome}`,
            multipliers: prefixData.multipliers
        };
    }
};


const generateEnemy = (playerLevel: number, dungeonLevel: number, depth: number, isBoss: boolean): Enemy => {
    let enemyKey: string;
    if (isBoss) {
        const bossDungeonTier = Math.min(5, Math.ceil(dungeonLevel / 2));
        const pool = BOSS_POOL_BY_TIER[bossDungeonTier as keyof typeof BOSS_POOL_BY_TIER] || BOSS_POOL_BY_TIER[1];
        enemyKey = pool[Math.floor(Math.random() * pool.length)];
    } else {
        const dungeonTier = Math.ceil(dungeonLevel / 2) + 1; // Allow slightly higher tier monsters to appear
        const candidateKeys = Object.keys(inimigos_db).filter(key => {
            const enemyTier = (inimigos_db[key as keyof typeof inimigos_db] as EnemyData).tier;
            return enemyTier <= dungeonTier;
        });
        enemyKey = candidateKeys.length > 0 ? candidateKeys[Math.floor(Math.random() * candidateKeys.length)] : "Rat";
    }
    const baseEnemy = inimigos_db[enemyKey as keyof typeof inimigos_db];
    
    let finalName = baseEnemy.nome;
    let multipliers = [1.0, 1.0, 1.0, 1.0, 1.0]; // hp, atk, def, xp, gold

    if (isBoss) {
        finalName = `Guardian ${baseEnemy.nome}`;
        multipliers = [C.BOSS_HP_MULT, C.BOSS_ATK_MULT, C.BOSS_DEF_MULT, C.BOSS_XP_MULT, C.BOSS_GOLD_MULT];
    } else {
        const variation = applyMonsterVariation(enemyKey, dungeonLevel);
        finalName = variation.name;
        multipliers = variation.multipliers;
    }

    const levelFactor = (playerLevel * C.ENEMY_SCALING_PLAYER_LVL_WEIGHT) + (dungeonLevel * C.ENEMY_SCALING_DUNGEON_LVL_WEIGHT) + (depth * C.ENEMY_SCALING_DEPTH_WEIGHT);
    const applyVariance = (val: number) => val * (1 + (Math.random() - 0.5) * 2 * C.ENEMY_STAT_VARIANCE);
    
    const [hp_mult, atk_mult, def_mult, xp_mult, gold_mult] = multipliers;

    const scaled_hp = (baseEnemy.base_hp * hp_mult) + (baseEnemy.scale_hp * levelFactor);
    const scaled_atk = (baseEnemy.base_atk * atk_mult) + (baseEnemy.scale_atk * levelFactor);
    const scaled_def = (baseEnemy.base_def * def_mult) + (baseEnemy.scale_def * levelFactor);
    const scaled_xp = (baseEnemy.base_xp * xp_mult) + (baseEnemy.scale_xp * levelFactor);
    const scaled_gold = (baseEnemy.base_gold * gold_mult) + (baseEnemy.scale_gold * levelFactor);

    const playerLevelGoldMultiplier = 1.0 + C.MONSTER_GOLD_PLAYER_LEVEL_SCALE * Math.max(0, playerLevel - 1);

    const enemyData = {
        nome: finalName, base_key: baseEnemy.base_key, tier: baseEnemy.tier,
        vida: Math.ceil(applyVariance(scaled_hp)),
        ataque: Math.ceil(applyVariance(scaled_atk)),
        defesa: Math.ceil(applyVariance(scaled_def)),
        xp: Math.ceil(applyVariance(scaled_xp)),
        gold: Math.ceil(applyVariance(scaled_gold) * playerLevelGoldMultiplier),
        drop_chance: baseEnemy.drop_chance, drop_table: baseEnemy.drop_table, isBoss: isBoss,
    };

    // Ensure minimum stats
    enemyData.vida = Math.max(8, enemyData.vida);
    enemyData.ataque = Math.max(1, enemyData.ataque);
    enemyData.defesa = Math.max(0, enemyData.defesa);

    return { ...enemyData, vida_max: enemyData.vida };
};

export const useGameEngine = (callbacks: { onDefeat: (defeatedPlayer: Player, reason: string, deathDungeon: number, deathFloor: number, maxDungeon: number, maxFloor: number) => void, onLevelUp: Function, onDungeonVictory: Function, onGoToShop: Function }) => {
  const [player, setPlayer] = useState<Player | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [dungeonLevel, setDungeonLevel] = useState(1);
  const [depth, setDepth] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [currentEncounter, setCurrentEncounter] = useState<CurrentEncounter>({ type: 'exploring' });
  const [shopInventory, setShopInventory] = useState<ItemData[]>([]);
  const [maxStatsThisRun, setMaxStatsThisRun] = useState({ dungeon: 1, floor: 0 });
  
  const callbacksRef = useRef(callbacks);
  useEffect(() => { callbacksRef.current = callbacks; }, [callbacks]);

  const addLog = useCallback((message: string) => { setLogs(prev => [...prev.slice(-20), message]); }, []);
  const setInitialLog = useCallback((messages: string[]) => {
    setLogs(messages);
  }, []);
  
  const updatePlayer = useCallback((updater: (p: Player | null) => Player | null) => {
    setPlayer(prevPlayer => calculateStats(updater(prevPlayer)));
  }, []);
  
  const restockShop = useCallback((p: Player) => {
    // 1. Calculate max tier for available items.
    const maxTier = Math.min(7, Math.ceil((p.dungeons_completed || 0) / 2) + 1);
    
    // 2. Get all valid items for the shop up to the max tier.
    const availableItems = (Object.values(itens_db) as ItemData[]).filter(item => 
        item.tier <= maxTier && item.valor > 0 // Ensure it's a purchasable item
    );

    const shuffled = [...availableItems].sort(() => 0.5 - Math.random());

    // 3. Select 5 unique base items.
    const baseStock: ItemData[] = [];
    for (const item of shuffled) {
        if (baseStock.length >= 5) break;
        if (!baseStock.some(i => i.id === item.id)) {
            baseStock.push(item);
        }
    }
    
    let finalStock = [...baseStock];

    // 4. Chance to add a 6th rare item.
    if (Math.random() < 0.25) { // 25% chance
        const rareTier = Math.min(7, maxTier + 1);
        const rareItems = (Object.values(itens_db) as ItemData[])
            .filter(item => item.tier === rareTier && item.valor > 0);
            
        if (rareItems.length > 0) {
            const chosenRareItem = rareItems[Math.floor(Math.random() * rareItems.length)];
            // Add if not already present
            if (!finalStock.some(i => i.id === chosenRareItem.id)) {
                finalStock.push(chosenRareItem);
            }
        }
    }

    // 5. Check for and add a healing item if missing.
    const hasHealingItem = finalStock.some(item => item.stats?.cura && item.stats.cura > 0);
    
    if (!hasHealingItem) {
        // Find the best available healing potion.
        const healingPotions = availableItems
            .filter(item => item.stats?.cura)
            .sort((a, b) => b.valor - a.valor); // Best value first
        
        if (healingPotions.length > 0) {
            const bestPotion = healingPotions[0];
            // Only add if it's not already in the shop
            if (!finalStock.some(i => i.id === bestPotion.id)) {
                 finalStock.push(bestPotion);
            }
        }
    }

    setShopInventory(finalStock);
  }, []);

  const startNewGame = useCallback((newPlayer: Player, shouldRestock: boolean = true) => {
    const calculatedPlayer = calculateStats(newPlayer)!;
    setPlayer(calculatedPlayer);
    setLogs(['Welcome to the shop. Prepare yourself for the dangers ahead.']);
    const currentDungeon = calculatedPlayer.currentDungeonLevel || 1;
    setDungeonLevel(currentDungeon);
    setDepth(0);
    setMaxStatsThisRun({ dungeon: currentDungeon, floor: 0 });
    setCurrentEncounter({ type: 'exploring' });
    if (shouldRestock) {
        restockShop(calculatedPlayer);
    }
  }, [restockShop]);

  const resetDungeonLog = useCallback(() => { setLogs([`You are at the entrance of Dungeon Lvl ${dungeonLevel}. The path ahead is dark.`]); }, [dungeonLevel]);
  
  const resetDungeonProgress = useCallback(() => {
    setDungeonLevel(1);
    setDepth(0);
    setMaxStatsThisRun({ dungeon: 1, floor: 0 });
    setCurrentEncounter({ type: 'exploring' });
  }, []);

  const handleReturnToShop = useCallback(() => {
    setLogs(["You returned to the shop."]);
    setDepth(0);
    setCurrentEncounter({ type: 'exploring' });
    callbacksRef.current.onGoToShop();
  }, [setLogs]);

  const handleExplore = useCallback(async () => {
    if(!player) return;
    setIsLoading(true);
    const newDepth = depth + 1;
    setDepth(newDepth);
    
    setMaxStatsThisRun(prev => {
        if (dungeonLevel > prev.dungeon) return { dungeon: dungeonLevel, floor: newDepth };
        if (dungeonLevel === prev.dungeon) return { dungeon: dungeonLevel, floor: Math.max(prev.floor, newDepth) };
        return prev;
    });

    setLogs([`--- Floor ${newDepth} (Dungeon Lvl ${dungeonLevel}) ---`]);

    const isBoss = newDepth >= C.MAX_FLOORS_PER_DUNGEON;
    const enemy = isBoss ? generateEnemy(player.level, dungeonLevel, newDepth, true) : null;
    
    const flavorText = await getDynamicDescription(isBoss ? `Boss encounter: ${enemy!.nome}` : `Exploring floor ${newDepth}`);
    addLog(`<span class="text-gray-400 italic">"${flavorText}"</span>`);

    if (isBoss) {
        addLog(`<span class="text-red-500 font-bold">The Guardian of the Floor appears!</span>`);
        addLog(`The <span class="text-red-500 font-bold">${enemy!.nome}</span> blocks your path!`);
        setCurrentEncounter({ type: 'enemy', enemy: enemy! });
    } else {
        const eventRoll = Math.random();
        const treasureChance = 0.20 + (player.race === Race.Elf ? 0.05 : 0);
        const trapChance = 0.15 * (player.race === Race.Elf ? 0.6 : 1.0);
        
        if (eventRoll < trapChance) {
            addLog(`<span class="text-yellow-400">Encounter: Trap!</span>`);
            const trapDamage = Math.floor((C.TRAP_DAMAGE_BASE + (dungeonLevel * 3) + (newDepth * 2)) * (Math.random() * 0.4 + 0.8));
            const avoidChance = player.luck * C.TRAP_LUCK_AVOID_CHANCE_PER_POINT;
            if (Math.random() < avoidChance) {
                addLog(`With incredible agility, you <span class="text-green-400">avoid the trap completely!</span>`);
            } else {
                const reduceChance = 0.10 + (player.luck * C.TRAP_LUCK_REDUCE_CHANCE_PER_POINT);
                const finalDamage = Math.random() < reduceChance ? Math.ceil(trapDamage * 0.5) : trapDamage;
                addLog(`You sprung a trap! It hits you for <span class="text-red-500">${finalDamage}</span> damage.`);
                updatePlayer(p => {
                    if (!p) return null;
                    const newHP = p.vida - finalDamage;
                    if(newHP <= 0) { callbacksRef.current.onDefeat({...p, vida: 0}, `killed by a trap`, dungeonLevel, newDepth, maxStatsThisRun.dungeon, maxStatsThisRun.floor); return {...p, vida: 0}; }
                    return { ...p, vida: newHP };
                });
            }
            setCurrentEncounter({ type: 'cleared' });
        } else if (eventRoll < trapChance + treasureChance) {
            addLog(`<span class="text-yellow-200">Encounter: Treasure!</span>`);
            let goldFound = Math.floor((Math.random() * (15 + dungeonLevel * 5) + (5 + player.luck * 0.5)) * (1 + player.gold_bonus));
            updatePlayer(p => p ? ({...p, carteira: p.carteira + goldFound, gold_accumulated_run: p.gold_accumulated_run + goldFound}) : null);
            addLog(`You found a chest with <span class="text-yellow-400">💰${goldFound}g</span>!`);
            
            // Chance to find a rare item (Amulet or Ring)
            if (Math.random() < 0.25) { // 25% chance for an item in a chest
                const rareItemTypes = ['amuleto', 'anel'];
                const possibleItems = Object.values(itens_db).filter(i => rareItemTypes.includes((i as ItemData).tipo) && (i as ItemData).tier <= Math.ceil(dungeonLevel/2)+1);
                if (possibleItems.length > 0) {
                    const foundItem = possibleItems[Math.floor(Math.random() * possibleItems.length)] as ItemData;
                    addLog(`The chest also contains a <span class="text-purple-400 font-bold">${foundItem.icon} ${foundItem.nome}</span>!`);
                    updatePlayer(p => {
                       if (!p) return null;
                       const newInventory = [...p.inventario, {id: foundItem.id, plus: 0, durability: foundItem.duravel ? 100 : undefined }];
                       return {...p, inventario: newInventory};
                    });
                }
            }
            setCurrentEncounter({ type: 'cleared' });
        } else {
            addLog(`<span class="text-red-400">Encounter: Combat!</span>`);
            const regularEnemy = generateEnemy(player.level, dungeonLevel, newDepth, false);
            addLog(`A wild <span class="text-red-400">${regularEnemy.nome}</span> appears!`);
            setCurrentEncounter({ type: 'enemy', enemy: regularEnemy });
        }
    }
    setIsLoading(false);
  }, [player, depth, dungeonLevel, addLog, setLogs, updatePlayer, maxStatsThisRun]);

  const handleFight = useCallback(() => {
    if (currentEncounter.type !== 'enemy' || !currentEncounter.enemy || !player) return;

    let combatLogs: string[] = [];
    let enemy = { ...currentEncounter.enemy };
    let playerCopy = JSON.parse(JSON.stringify(player)) as Player;
    let isFirstAttack = true;
    let burnRounds = 0;
    let burnDamage = 0;

    while (playerCopy.vida > 0 && enemy.vida > 0) {
        let playerStats = calculateStats(playerCopy)!;
        
        const isRaging = playerStats.race === Race.HalfOrc && (playerStats.vida / playerStats.vida_max_total) < 0.50;
        const rageString = isRaging ? ` <span class="text-orange-400">in Rage</span>` : "";
        
        let playerDmg = Math.max(C.COMBAT_MIN_DAMAGE, playerStats.ataque_total - enemy.defesa);
        
        if (isFirstAttack && playerCopy.race === Race.Dragonborn) {
            let breathDamage = Math.ceil(playerCopy.level * 1.5 + playerStats.strength / 3);
            let message = `You attack${rageString} with Draconic Breath`;

            if (Math.random() < 0.25) {
                burnRounds = 2;
                burnDamage = Math.ceil(playerStats.level * 0.75 + playerStats.strength / 4);
                message += ` that <span class="text-orange-500">ignites</span> the foe`;
                playerDmg += burnDamage;
            }
            
            playerDmg += breathDamage;
            combatLogs.push(`${message} for <span class="text-green-400">${playerDmg}</span> damage!`);
        } else {
            combatLogs.push(`You attack${rageString} for <span class="text-green-400">${playerDmg}</span> damage.`);
        }
        isFirstAttack = false;
        enemy.vida -= playerDmg;

        if (enemy.vida <= 0) break;

        if (burnRounds > 0) {
            enemy.vida -= burnDamage;
            combatLogs.push(`${enemy.nome} takes <span class="text-orange-500">${burnDamage}</span> damage from burning.`);
            burnRounds--;
            if (enemy.vida <= 0) break;
        }

        const baseDodge = playerStats.race === Race.Elf ? C.DODGE_BASE_CHANCE + 0.05 : C.DODGE_BASE_CHANCE;
        const dodgeChance = Math.min(0.60, baseDodge + playerStats.luck * C.DODGE_LUCK_MULT);
        if (Math.random() < dodgeChance) {
            combatLogs.push(`You <span class="text-blue-400">dodged</span> the enemy's attack!`);
        } else {
            const enemyDmg = Math.max(C.COMBAT_MIN_DAMAGE, enemy.ataque - playerStats.defesa_total);
            playerCopy.vida -= enemyDmg;
            combatLogs.push(`${enemy.nome} attacks for <span class="text-red-500">${enemyDmg}</span> damage.`);
        }
    }
    
    setLogs(prev => [...prev.slice(-20), ...combatLogs]);

    if (playerCopy.vida > 0) { 
      addLog(`You defeated the ${enemy.nome}!`);

      if (playerCopy.race === Race.Tiefling) {
        const healing = Math.ceil(enemy.vida_max * 0.05);
        const newHP = Math.min(calculateStats(playerCopy)!.vida_max_total, playerCopy.vida + healing);
        if (newHP > playerCopy.vida) {
            addLog(`Demonic Feast heals you for <span class="text-purple-400">${newHP - playerCopy.vida} HP</span>.`);
            playerCopy.vida = newHP;
        }
      }
      
      let itemsBroke = false;
      for (const slot of ['arma', 'armadura', 'amuleto', 'anel']) {
        const key = slot as keyof typeof playerCopy.equipado;
        const item = playerCopy.equipado[key];
        if (item?.durability !== undefined) {
          const itemData = itens_db[item.id as keyof typeof itens_db] as ItemData;
          let loss = 0;
          if (itemData.tipo === 'arma' || itemData.tipo === 'armadura') {
              loss = enemy.isBoss ? C.DURABILITY_LOSS_WEAPON_ARMOR_BOSS : C.DURABILITY_LOSS_WEAPON_ARMOR_NORMAL;
          } else if (itemData.tipo === 'amuleto' || itemData.tipo === 'anel') {
              loss = enemy.isBoss ? C.DURABILITY_LOSS_AMULET_RING_BOSS : C.DURABILITY_LOSS_AMULET_RING_NORMAL;
          }

          if (loss > 0) {
            item.durability -= Math.ceil(loss * (playerCopy.race === Race.Dwarf ? 0.5 : 1.0));
            if (item.durability <= 0) { 
              item.durability = 0; // Prevent negative durability
              addLog(`<span class="text-red-700 font-bold">${itemData.nome} shattered!</span>`); 
              playerCopy.equipado[key] = null;
              itemsBroke = true;
            }
          }
        }
      }

      if (itemsBroke) {
          addLog("Searching for replacements in your bag...");
          for (const slot of ['arma', 'armadura', 'amuleto', 'anel']) {
              const key = slot as keyof typeof playerCopy.equipado;
              if (playerCopy.equipado[key] === null) {
                  const result = findAndEquipBestForSlot(playerCopy, key);
                  playerCopy = result.player;
                  if (result.didEquip) {
                      addLog(`Automatically equipped <span class="text-green-400">${result.equippedItemName}</span>!`);
                  }
              }
          }
      }
      
      let xpGained = Math.floor(enemy.xp * (1 + playerCopy.xp_bonus) * (playerCopy.race === Race.Human ? 1.1 : 1));
      let goldGained = Math.floor(enemy.gold * (1 + playerCopy.gold_bonus + (playerCopy.luck * C.LUCK_GOLD_BONUS)));
      playerCopy.carteira += goldGained;
      playerCopy.gold_accumulated_run += goldGained;
      playerCopy.xp += xpGained;
      addLog(`You found <span class="text-yellow-400">💰${goldGained}g</span> and gained <span class="text-blue-400">${xpGained} XP</span>.`);
      
      if (Math.random() < enemy.drop_chance && enemy.drop_table.length > 0) {
        const droppedItemId = enemy.drop_table[Math.floor(Math.random() * enemy.drop_table.length)];
        const itemData = itens_db[droppedItemId as keyof typeof itens_db] as ItemData;
        playerCopy.inventario.push({ id: droppedItemId, plus: 0, durability: itemData.duravel ? 100 : undefined });
        addLog(`The ${enemy.nome} dropped <span class="text-purple-400 font-bold">${itemData.icon} ${itemData.nome}</span>!`);
      }

      const finalPlayerState = calculateStats(playerCopy)!;
      const leveledUp = finalPlayerState.xp >= finalPlayerState.xp_proximo_nivel;
      
      if (leveledUp) {
        while (finalPlayerState.xp >= finalPlayerState.xp_proximo_nivel) {
            const oldLevel = finalPlayerState.level;
            finalPlayerState.level += 1;
            finalPlayerState.xp -= finalPlayerState.xp_proximo_nivel;
            finalPlayerState.xp_proximo_nivel = Math.floor(finalPlayerState.xp_proximo_nivel * C.XP_CURVE_MULT);
            const pointsGained = 1 + Math.floor((oldLevel) / 4);
            finalPlayerState.stat_points += pointsGained;

            if (finalPlayerState.race === Race.Human && finalPlayerState.level % 4 === 0) {
                const bonusAmount = 1 + Math.floor((finalPlayerState.level - 1) / 4);

                const stats: {name: keyof Player, value: number}[] = [
                    { name: 'strength', value: finalPlayerState.strength },
                    { name: 'constitution', value: finalPlayerState.constitution },
                    { name: 'dexterity', value: finalPlayerState.dexterity },
                    { name: 'luck_base', value: finalPlayerState.luck_base },
                ];
                
                stats.sort((a, b) => a.value - b.value);
                const lowestStatName = stats[0].name;

                if (['strength', 'constitution', 'dexterity', 'luck_base'].includes(lowestStatName)) {
                    (finalPlayerState as any)[lowestStatName] += bonusAmount;
                    addLog(`<span class="text-cyan-400">[Adaptability]</span> Your versatility grows! You gained +${bonusAmount} to your lowest stat: ${lowestStatName.replace('_base', '')}.`);
                }
            }
        }
        addLog(`<span class="text-yellow-300 font-bold">LEVEL UP! You are now level ${finalPlayerState.level}!</span>`);
      }
      
      setPlayer(finalPlayerState);
      
      if (leveledUp) {
        callbacksRef.current.onLevelUp();
      }
      
      if (enemy.isBoss) {
        updatePlayer(p => p ? ({...p, dungeons_completed: p.dungeons_completed + 1 }) : null);
        restockShop(finalPlayerState);
        addLog(`<span class="text-blue-300 italic">The merchant has new wares.</span>`);
        if (!leveledUp) callbacksRef.current.onDungeonVictory();
      } else {
        setCurrentEncounter({ type: 'cleared' });
      }

    } else { 
      addLog(`You were overwhelmed by the ${enemy.nome}.`);
      setPlayer(playerCopy);
      callbacksRef.current.onDefeat(playerCopy, `slain by a ${enemy.nome}`, dungeonLevel, depth, maxStatsThisRun.dungeon, maxStatsThisRun.floor);
    }
  }, [currentEncounter, player, addLog, dungeonLevel, depth, restockShop, setLogs, updatePlayer, maxStatsThisRun]);

  const handleFlee = useCallback(() => {
    if (currentEncounter.type !== 'enemy' || !currentEncounter.enemy || !player) return;

    const isBoss = currentEncounter.enemy.isBoss;
    const baseFailChance = isBoss ? C.FLEE_BOSS_FAIL_CHANCE : C.FLEE_FAIL_BASE_CHANCE;
    const failChance = Math.max(0.1, baseFailChance - (player.luck * C.FLEE_LUCK_REDUCTION_PER_POINT));

    if (Math.random() > failChance) {
        addLog(`<span class="text-green-400">You successfully escaped!</span>`);
        if (isBoss) {
            handleReturnToShop();
        } else {
            setCurrentEncounter({ type: 'cleared' });
        }
    } else {
        addLog(`<span class="text-red-500">Escape failed!</span>`);
        const enemyDamage = Math.max(1, currentEncounter.enemy.ataque - player.defesa_total);
        updatePlayer(p => {
          if (!p) return null;
          const newHp = p.vida - enemyDamage;
          if (newHp <= 0) {
              callbacksRef.current.onDefeat({...p, vida: 0}, `slain while fleeing`, dungeonLevel, depth, maxStatsThisRun.dungeon, maxStatsThisRun.floor);
              return {...p, vida: 0};
          } else {
              addLog(`The enemy hits you for <span class="text-red-500">${enemyDamage}</span> damage.`);
              return { ...p, vida: newHp };
          }
        });
    }
  }, [currentEncounter, player, addLog, dungeonLevel, depth, updatePlayer, handleReturnToShop, maxStatsThisRun]);

  const setupNextDungeon = useCallback(() => {
    if(!player) return;
    const newDungeonLevel = dungeonLevel + 1;
    setLogs([`<span class="text-yellow-400 font-bold">You venture into Dungeon Level ${newDungeonLevel}...</span>`]);
    updatePlayer(p => p ? ({...p, currentDungeonLevel: newDungeonLevel, max_dungeon_level_reached: Math.max(p.max_dungeon_level_reached, newDungeonLevel) }) : null);
    setDungeonLevel(newDungeonLevel); setDepth(0); setCurrentEncounter({ type: 'exploring' });
    setMaxStatsThisRun(prev => ({ dungeon: Math.max(prev.dungeon, newDungeonLevel), floor: 0 }));
  }, [player, dungeonLevel, setLogs, updatePlayer]);
  
  const calculateRepairCostForItem = useCallback((itemInst: any) => {
      if (!itemInst || itemInst.durability === undefined || itemInst.durability >= 100) return 0;
      return Math.ceil((100 - itemInst.durability) * C.REPAIR_COST_PER_PERCENT);
  }, []);

  const handleRepairItem = useCallback((slot: string) => {
    updatePlayer(p => {
        if (!p) return null;
        const key = slot as keyof typeof p.equipado;
        const itemInst = p.equipado[key];
        const cost = calculateRepairCostForItem(itemInst);
        if (!itemInst || cost === 0 || p.carteira < cost) return p;
        
        const itemData = itens_db[itemInst.id as keyof typeof itens_db] as ItemData;
        addLog(`Repaired ${itemData.nome} for 💰${cost}g.`);
        
        const newPlayer = { ...p, carteira: p.carteira - cost };
        newPlayer.equipado = { ...p.equipado, [key]: { ...itemInst, durability: 100 } };
        return newPlayer;
    });
  }, [addLog, calculateRepairCostForItem, updatePlayer]);

  const handleRepairAll = useCallback(() => {
    updatePlayer(p => {
        if (!p) return null;
        let totalCost = 0;
        const newEquipado = { ...p.equipado };
        for (const slot of ['arma', 'armadura', 'amuleto', 'anel']) {
            const key = slot as keyof typeof p.equipado;
            const itemInst = p.equipado[key];
            const cost = calculateRepairCostForItem(itemInst);
            if (cost > 0) { 
                totalCost += cost; 
                newEquipado[key] = { ...itemInst!, durability: 100 }; 
            }
        }
        if (totalCost === 0 || p.carteira < totalCost) return p;
        addLog(`Repaired all items for 💰${totalCost}g.`);
        return { ...p, carteira: p.carteira - totalCost, equipado: newEquipado };
    });
  }, [addLog, calculateRepairCostForItem, updatePlayer]);
  
  const handleBuyItem = useCallback((item: ItemData, price: number) => {
    updatePlayer(p => {
        if (!p) return null;
        if (p.carteira < price) { addLog(`<span class="text-red-500">Not enough gold!</span>`); return p; }
        
        const newPlayer = { ...p, carteira: p.carteira - price };
        newPlayer.inventario = [...p.inventario, { id: item.id, plus: 0, durability: item.duravel ? 100 : undefined }];
        addLog(`Bought ${item.icon} ${item.nome} for 💰${price}g.`);
        return newPlayer;
    });
  }, [addLog, updatePlayer]);

  const handleSellItem = useCallback((inventoryIndex: number, price: number) => {
    updatePlayer(p => {
        if (!p || inventoryIndex < 0 || inventoryIndex >= p.inventario.length) return p;
        
        const itemSold = itens_db[p.inventario[inventoryIndex].id as keyof typeof itens_db] as ItemData;
        addLog(`Sold ${itemSold.icon} ${itemSold.nome} for 💰${price}g.`);
        
        const newInventory = p.inventario.filter((_, i) => i !== inventoryIndex);
        return { ...p, carteira: p.carteira + price, gold_accumulated_run: p.gold_accumulated_run + price, inventario: newInventory };
    });
  }, [addLog, updatePlayer]);
  
  const handleSellEquippedItem = useCallback((slot: keyof Player['equipado'], price: number) => {
    updatePlayer(p => {
        if (!p) return null;
        const itemSoldInst = p.equipado[slot];
        if (!itemSoldInst) return p;

        const itemSoldData = itens_db[itemSoldInst.id as keyof typeof itens_db] as ItemData;
        addLog(`Sold equipped ${itemSoldData.icon} ${itemSoldData.nome} for 💰${price}g.`);

        let playerCopy = JSON.parse(JSON.stringify(p)) as Player;
        playerCopy.carteira += price;
        playerCopy.gold_accumulated_run += price;
        playerCopy.equipado[slot] = null;
        
        addLog(`Searching for a replacement for the ${slot} slot...`);
        const result = findAndEquipBestForSlot(playerCopy, slot);
        playerCopy = result.player;
        if (result.didEquip) {
            addLog(`Automatically equipped <span class="text-green-400">${result.equippedItemName}</span>!`);
        } else {
            addLog(`No replacement found in inventory.`);
        }

        return playerCopy;
    });
  }, [addLog, updatePlayer]);

  const handleDepositGold = useCallback((amount: number) => {
    updatePlayer(p => {
        if (!p || !amount || amount <= 0 || p.carteira < amount) return p;
        addLog(`Deposited 💰${amount}g into the vault.`);
        return {
            ...p,
            carteira: p.carteira - amount,
            vault_gold: (p.vault_gold || 0) + amount,
        };
    });
  }, [updatePlayer, addLog]);

  const handleWithdrawGold = useCallback((amount: number) => {
    updatePlayer(p => {
        if (!p || !amount || amount <= 0 || (p.vault_gold || 0) < amount) return p;
        addLog(`Withdrew 💰${amount}g from the vault.`);
        return {
            ...p,
            carteira: p.carteira + amount,
            vault_gold: (p.vault_gold || 0) - amount,
        };
    });
  }, [updatePlayer, addLog]);

  const handleDepositItem = useCallback((inventoryIndex: number) => {
    updatePlayer(p => {
        if (!p || inventoryIndex < 0 || inventoryIndex >= p.inventario.length) return p;
        
        const item = p.inventario[inventoryIndex];
        const itemData = itens_db[item.id as keyof typeof itens_db] as ItemData;
        addLog(`Deposited ${itemData.icon} ${itemData.nome} into the vault.`);

        const newInventory = p.inventario.filter((_, i) => i !== inventoryIndex);
        const newVaultInventory = [...(p.vault_inventario || []), item];

        return { ...p, inventario: newInventory, vault_inventario: newVaultInventory };
    });
  }, [updatePlayer, addLog]);

  const handleWithdrawItem = useCallback((vaultIndex: number) => {
    updatePlayer(p => {
        if (!p || !p.vault_inventario || vaultIndex < 0 || vaultIndex >= p.vault_inventario.length) return p;

        const item = p.vault_inventario[vaultIndex];
        const itemData = itens_db[item.id as keyof typeof itens_db] as ItemData;
        addLog(`Withdrew ${itemData.icon} ${itemData.nome} from the vault.`);

        const newVaultInventory = p.vault_inventario.filter((_, i) => i !== vaultIndex);
        const newInventory = [...p.inventario, item];

        return { ...p, inventario: newInventory, vault_inventario: newVaultInventory };
    });
  }, [updatePlayer, addLog]);

  return { player, logs, addLog, setInitialLog, shopInventory, handleExplore, handleFight, handleFlee, handleReturnToShop, handleRepairAll, handleRepairItem, handleBuyItem, handleSellItem, handleSellEquippedItem, calculateRepairCostForItem, handleDepositGold, handleWithdrawGold, handleDepositItem, handleWithdrawItem, currentEncounter, isLoading, dungeonLevel, depth, startNewGame, setPlayer: updatePlayer, setupNextDungeon, resetDungeonLog, resetDungeonProgress, restockShop };
};