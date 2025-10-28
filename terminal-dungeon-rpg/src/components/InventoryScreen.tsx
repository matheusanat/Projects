import React, { useState, useMemo, useCallback } from 'react';
import { Player, ItemInstance } from '../types';
import { getFullItemName } from '../utils';
import { itens_db } from '../data/gameData';
import { calculateStats } from '../hooks/useGameEngine';
import { ItemData } from '../types';

interface InventoryScreenProps {
    player: Player;
    onClose: (player: Player) => void;
}

const InventoryScreen: React.FC<InventoryScreenProps> = ({ player, onClose }) => {
    const [localPlayer, setLocalPlayer] = useState<Player>(() => JSON.parse(JSON.stringify(player)));

    const updateLocalPlayer = useCallback((updater: (p: Player) => Player) => {
        setLocalPlayer(p => calculateStats(updater(p))!);
    }, []);

    const handleEquip = (inventoryIndex: number) => {
        updateLocalPlayer(p => {
            const playerCopy = JSON.parse(JSON.stringify(p));
            const itemToEquip = playerCopy.inventario[inventoryIndex];
            if (!itemToEquip) return playerCopy;

            const itemData = itens_db[itemToEquip.id as keyof typeof itens_db] as ItemData;
            const slot = itemData.tipo as keyof Player['equipado'];
            if (!['arma', 'armadura', 'amuleto', 'anel'].includes(slot)) return playerCopy;
            
            const currentlyEquipped = playerCopy.equipado[slot];
            const newInventory = playerCopy.inventario.filter((_: any, index: number) => index !== inventoryIndex);
            if (currentlyEquipped) newInventory.push(currentlyEquipped);
            
            playerCopy.inventario = newInventory;
            playerCopy.equipado[slot] = itemToEquip;
            return playerCopy;
        });
    };
    
    const handleUnequip = (slot: keyof Player['equipado']) => {
        updateLocalPlayer(p => {
            const playerCopy = JSON.parse(JSON.stringify(p));
            const itemToUnequip = playerCopy.equipado[slot];
            if (!itemToUnequip) return playerCopy;

            playerCopy.inventario.push(itemToUnequip);
            playerCopy.equipado[slot] = null;
            return playerCopy;
        });
    };

    const handleUse = (inventoryIndex: number) => {
        updateLocalPlayer(p => {
            const playerCopy = JSON.parse(JSON.stringify(p));
            const itemToUse = playerCopy.inventario[inventoryIndex];
            const itemData = itens_db[itemToUse.id as keyof typeof itens_db] as ItemData;
            const stats = itemData.stats;
            if (itemData.tipo !== 'consumivel' || !stats?.cura) return playerCopy;

            const newHP = Math.min(playerCopy.vida_max_total, playerCopy.vida + stats.cura);
            if (newHP === playerCopy.vida) return playerCopy;

            playerCopy.vida = newHP;
            playerCopy.inventario = playerCopy.inventario.filter((_: any, i: number) => i !== inventoryIndex);
            return playerCopy;
        });
    };

    const inventoryLayout = useMemo(() => {
        type UnstackableItem = { item: ItemInstance; originalIndex: number };
        type StackableGroup = { item: ItemInstance; count: number; originalIndexes: number[] };
        const unstackable: UnstackableItem[] = [];
        const stackable = localPlayer.inventario.reduce((acc, item, index) => {
            const itemData = itens_db[item.id as keyof typeof itens_db] as ItemData;
            if (itemData.tipo === 'consumivel' && !item.durability) {
                if (!acc[item.id]) acc[item.id] = { item, count: 0, originalIndexes: [] };
                acc[item.id].count++;
                acc[item.id].originalIndexes.push(index);
            } else {
                unstackable.push({ item, originalIndex: index });
            }
            return acc;
        }, {} as Record<string, StackableGroup>);

        return { stackable: Object.values(stackable), unstackable };
    }, [localPlayer.inventario]);
    
    const EquippedItem: React.FC<{slotName: string, slotKey: keyof Player['equipado']}> = ({slotName, slotKey}) => {
        const item = localPlayer.equipado[slotKey];
        return (
            <div className="flex justify-between items-center">
                <p><strong>{slotName}: </strong>{getFullItemName(item)}</p>
                {item && <button onClick={() => handleUnequip(slotKey)} className="bg-yellow-800 text-xs hover:bg-yellow-700 font-bold py-1 px-2 rounded ml-2">Unequip</button>}
            </div>
        )
    };

    return (
    <div className="flex flex-col p-2">
      <div className="text-center border-b-2 border-green-700 pb-2 mb-4">
        <h2 className="text-2xl text-green-400">Inventory & Equipment</h2>
        <p>
            <strong>HP: </strong><span className="text-red-400">{`${localPlayer.vida} / ${localPlayer.vida_max_total}`}</span>
            {' | '}
            <strong>ATK: </strong>
            <span>{localPlayer.ataque_total}</span>
            {' | '}
            <strong>DEF: </strong>
            <span>{localPlayer.defesa_total}</span>
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-grow overflow-y-auto pr-2 max-h-[60vh]">
        <div className="space-y-3">
            <h3 className="text-xl text-yellow-300 mb-2 border-b border-gray-700">Equipped</h3>
            <EquippedItem slotName="Weapon" slotKey="arma" />
            <EquippedItem slotName="Armor" slotKey="armadura" />
            <EquippedItem slotName="Amulet" slotKey="amuleto" />
            <EquippedItem slotName="Ring" slotKey="anel" />
        </div>
        <div className="space-y-2">
            <h3 className="text-xl text-yellow-300 mb-2 border-b border-gray-700">Inventory Items</h3>
            {localPlayer.inventario.length > 0 ? (
                <ul className="space-y-2">
                    {inventoryLayout.stackable.map((group) => (
                        <li key={`stack-${group.item.id}`} className="flex justify-between items-center bg-gray-800 p-2 rounded">
                            <span className="flex-grow">{getFullItemName(group.item, group.count)}</span>
                            <div className="flex-shrink-0 flex items-center gap-2">
                                <button onClick={() => handleUse(group.originalIndexes[0])} className="bg-blue-600 text-sm hover:bg-blue-500 font-bold py-1 px-3 rounded">Use</button>
                            </div>
                        </li>
                    ))}
                    {inventoryLayout.unstackable.map(({ item, originalIndex }) => {
                        const itemData = itens_db[item.id as keyof typeof itens_db] as ItemData;
                        return (
                            <li key={`unstack-${originalIndex}`} className="flex justify-between items-center bg-gray-800 p-2 rounded">
                                <span className="flex-grow">{getFullItemName(item)}</span>
                                <div className="flex-shrink-0 flex items-center gap-2">
                                    {['arma', 'armadura', 'amuleto', 'anel'].includes(itemData.tipo) && <button onClick={() => handleEquip(originalIndex)} className="bg-green-700 text-sm hover:bg-green-600 font-bold py-1 px-3 rounded">Equip</button>}
                                </div>
                            </li>
                        );
                    })}
                </ul>
            ) : (<p className="text-gray-500 italic">Your bag is empty.</p>)}
        </div>
      </div>
      <div className="mt-6 text-center">
        <button onClick={() => onClose(localPlayer)} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-8 text-lg border-b-4 border-gray-800 hover:border-gray-600 rounded transition duration-200">
            Close Inventory
        </button>
      </div>
    </div>
  );
};

export default InventoryScreen;