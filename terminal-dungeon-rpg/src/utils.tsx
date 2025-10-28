import React from 'react';
import { itens_db, RACES } from './data/gameData';
import { ItemInstance, RaceKey, ItemStats, ItemData, Player, SavedCharacter } from './types';

export const getItemStatsString = (itemData: ItemData): string => {
    const stats = itemData.stats;
    if (!stats) return "";
    
    const parts: string[] = [];
    if(stats.cura) parts.push(`Heals ${stats.cura}`);
    if(stats.atk) parts.push(`ATK+${stats.atk}`);
    if(stats.def) parts.push(`DEF${stats.def > 0 ? '+' : ''}${stats.def}`);
    
    // Flat attributes
    if(stats.str) parts.push(`STR+${stats.str}`);
    if(stats.con) parts.push(`CON+${stats.con}`);
    if(stats.dex) parts.push(`DEX+${stats.dex}`);
    if(stats.lck_base) parts.push(`LCK+${stats.lck_base}`);
    
    // Percentage attributes
    if(stats.str_percent) parts.push(`STR+${(stats.str_percent * 100).toFixed(0)}%`);
    if(stats.con_percent) parts.push(`CON+${(stats.con_percent * 100).toFixed(0)}%`);
    if(stats.dex_percent) parts.push(`DEX+${(stats.dex_percent * 100).toFixed(0)}%`);
    if(stats.lck_base_percent) parts.push(`LCK+${(stats.lck_base_percent * 100).toFixed(0)}%`);

    // Percentage gains
    if(stats.hp_bonus_percent) parts.push(`HP+${(stats.hp_bonus_percent * 100).toFixed(0)}%`);
    if(stats.xp_bonus) parts.push(`XP+${(stats.xp_bonus * 100).toFixed(0)}%`);
    if(stats.gold_bonus) parts.push(`Gold+${(stats.gold_bonus * 100).toFixed(0)}%`);

    // Scaling
    if (stats.scaling) {
        const statName = stats.scaling.stat.replace('_base', '').toUpperCase();
        let scalingString = `Scales w/ ${statName}`;
        if (stats.scaling_secondary) {
            const secondaryStatName = stats.scaling_secondary.stat.replace('_base', '').toUpperCase();
            scalingString += ` + ${secondaryStatName}`;
        }
        parts.push(scalingString);
    }
    
    return parts.length > 0 ? `(${parts.join(', ')})` : "";
};

export const getRaceName = (race: RaceKey): string => RACES[race]?.nome || "Unknown";

export const getFullItemName = (itemInst: ItemInstance | null, count: number = 1): React.ReactElement => {
    if (!itemInst) {
        return <span className="text-gray-500">Empty</span>;
    }

    const itemData = itens_db[itemInst.id as keyof typeof itens_db] as ItemData | undefined;
    if (!itemData) {
        return <span className="text-red-500">Unknown Item</span>;
    }

    const mainText = `${itemData.icon} ${itemData.nome}${itemInst.plus > 0 ? ` +${itemInst.plus}` : ''}`;
    const statsString = getItemStatsString(itemData);

    return (
        <>
            <span>{mainText}</span>
            {count > 1 && <span className="text-gray-400">{` x${count}`}</span>}
            {statsString && count === 1 && <span className="text-gray-400 text-xs">{` ${statsString}`}</span>}
            {itemInst.durability !== undefined && (
                <span className={`text-xs ${itemInst.durability > 70 ? 'text-green-400' : itemInst.durability > 30 ? 'text-yellow-400' : 'text-red-500'}`}>
                    {` [${itemInst.durability}%]`}
                </span>
            )}
        </>
    );
};

export const toSavedCharacter = (player: Player): SavedCharacter => {
    const {
        vida,
        vida_max_total,
        ataque_total,
        defesa_total,
        luck,
        xp_bonus,
        gold_bonus,
        ...saved
    } = player;
    return saved;
};