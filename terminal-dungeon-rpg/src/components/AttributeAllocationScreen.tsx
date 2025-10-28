import React, { useState } from 'react';
import { Player } from '../types';
import * as C from '../constants';

interface AttributeAllocationScreenProps {
    player: Player;
    onFinished: (player: Player) => void;
    onShowStatus: () => void;
}

const StatControl: React.FC<{
    statName: string;
    value: number;
    onAllocate: () => void;
    onDeallocate: () => void;
    canAllocate: boolean;
    canDeallocate: boolean;
    helpText: string;
}> = ({ statName, value, onAllocate, onDeallocate, canAllocate, canDeallocate, helpText }) => (
    <div className="flex items-center justify-between">
        <div>
            <span className="font-bold text-lg text-green-300">{`${statName}: ${value}`}</span>
            <p className="text-xs text-gray-400">{helpText}</p>
        </div>
        <div className="flex items-center gap-2">
            <button
                onClick={onDeallocate}
                disabled={!canDeallocate}
                className="bg-red-700 hover:bg-red-600 text-white font-bold py-1 px-3 border-b-2 border-red-900 hover:border-red-700 rounded disabled:bg-gray-600 disabled:border-gray-800 disabled:cursor-not-allowed transition duration-200"
            >
                -
            </button>
            <button
                onClick={onAllocate}
                disabled={!canAllocate}
                className="bg-green-600 hover:bg-green-500 text-white font-bold py-1 px-3 border-b-2 border-green-800 hover:border-green-600 rounded disabled:bg-gray-600 disabled:border-gray-800 disabled:cursor-not-allowed transition duration-200"
            >
                +
            </button>
        </div>
    </div>
);


const AttributeAllocationScreen: React.FC<AttributeAllocationScreenProps> = ({ player, onFinished, onShowStatus }) => {
    const [localPlayer, setLocalPlayer] = useState(player);
    const [originalPlayer] = useState(player);
    const [pointsToSpend, setPointsToSpend] = useState(player.stat_points);

    const handleStatChange = (stat: 'strength' | 'constitution' | 'dexterity' | 'luck_base', amount: 1 | -1) => {
        if (amount === 1 && pointsToSpend > 0) {
            setPointsToSpend(pts => pts - 1);
            setLocalPlayer(p => ({
                ...p,
                [stat]: p[stat] + 1,
                vida: stat === 'constitution' ? p.vida + C.HP_PER_CON : p.vida
            }));
        }
        if (amount === -1 && localPlayer[stat] > originalPlayer[stat]) {
            setPointsToSpend(pts => pts + 1);
            setLocalPlayer(p => ({
                ...p,
                [stat]: p[stat] - 1,
                vida: stat === 'constitution' ? p.vida - C.HP_PER_CON : p.vida
            }));
        }
    };

    return (
        <div className="flex flex-col items-center p-4">
            <h2 className="text-3xl text-yellow-400 mb-2 animate-pulse">[ LEVEL UP! ]</h2>
            <p className="text-lg text-gray-300 mb-6"> 
                You are now Level {player.level}. You have 
                <span className="text-yellow-300 font-bold"> {pointsToSpend} </span> 
                attribute points to spend.
            </p>
            <div className="w-full max-w-md bg-gray-800/50 p-4 rounded border border-gray-700 space-y-3">
                <StatControl 
                    statName="Strength" 
                    value={localPlayer.strength} 
                    onAllocate={() => handleStatChange('strength', 1)} 
                    onDeallocate={() => handleStatChange('strength', -1)}
                    canAllocate={pointsToSpend > 0}
                    canDeallocate={localPlayer.strength > originalPlayer.strength}
                    helpText="+1 Base Attack" />
                <StatControl 
                    statName="Constitution" 
                    value={localPlayer.constitution} 
                    onAllocate={() => handleStatChange('constitution', 1)} 
                    onDeallocate={() => handleStatChange('constitution', -1)}
                    canAllocate={pointsToSpend > 0}
                    canDeallocate={localPlayer.constitution > originalPlayer.constitution}
                    helpText="+10 Max HP" />
                <StatControl 
                    statName="Dexterity" 
                    value={localPlayer.dexterity} 
                    onAllocate={() => handleStatChange('dexterity', 1)} 
                    onDeallocate={() => handleStatChange('dexterity', -1)}
                    canAllocate={pointsToSpend > 0}
                    canDeallocate={localPlayer.dexterity > originalPlayer.dexterity}
                    helpText="+1 Base Defense" />
                <StatControl 
                    statName="Luck" 
                    value={localPlayer.luck_base} 
                    onAllocate={() => handleStatChange('luck_base', 1)} 
                    onDeallocate={() => handleStatChange('luck_base', -1)}
                    canAllocate={pointsToSpend > 0}
                    canDeallocate={localPlayer.luck_base > originalPlayer.luck_base}
                    helpText="Improves loot & events" />
            </div>
            <div className="mt-6 flex items-center justify-center gap-4 h-12">
                <button 
                    onClick={onShowStatus} 
                    className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 border-b-2 border-gray-900 hover:border-gray-700 rounded transition duration-200"
                >
                    View Status
                </button>
                {pointsToSpend === 0 && (
                    <button onClick={() => onFinished(localPlayer)} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 text-lg border-b-4 border-blue-800 hover:border-blue-600 rounded transition duration-200 animate-fadeIn">
                        Confirm & Continue
                    </button>
                )}
            </div>
        </div>
    );
};

export default AttributeAllocationScreen;
