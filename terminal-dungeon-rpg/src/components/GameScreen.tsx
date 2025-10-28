import React, { useRef, useLayoutEffect } from 'react';
import { getRaceName } from '../utils';
import { CLASSES } from '../data/gameData';
import { Player, Enemy, CurrentEncounter } from '../types';

interface GameScreenProps {
  engine: any;
  onShowStatus: () => void;
  onShowInventory: () => void;
  onShowInstructions: () => void;
}

const StatusBar: React.FC<{ label: string, value: number, max: number, colorClass: string }> = ({ label, value, max, colorClass }) => {
  const percentage = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs mb-1"> 
        <span>{label}</span> 
        <span>{`${value}/${max}`}</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2.5">
        <div className={`${colorClass} h-2.5 rounded-full`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
};

const EnemyDisplay: React.FC<{ enemy: Enemy }> = ({ enemy }) => (
  <div className="text-center mb-4 border-2 border-red-700 bg-red-900/20 p-4 rounded-lg animate-fadeIn">
    <h3 className="text-xl text-red-400 font-bold">{enemy.nome}</h3>
    <div className="flex justify-center gap-x-6 text-gray-300 mt-2">
      <span><strong>HP: </strong><span className="text-white">{enemy.vida_max}</span></span>
      <span><strong>ATK: </strong><span className="text-white">{enemy.ataque}</span></span>
      <span><strong>DEF: </strong><span className="text-white">{enemy.defesa}</span></span>
    </div>
  </div>
);

const EncounterTitle: React.FC<{ type: CurrentEncounter['type'] }> = ({ type }) => {
    const titles: Record<CurrentEncounter['type'], { text: string; color: string }> = {
        exploring: { text: "Exploring...", color: "text-gray-400" },
        enemy: { text: "Combat!", color: "text-red-400" },
        trap: { text: "Trap!", color: "text-yellow-400" },
        treasure: { text: "Treasure Found!", color: "text-yellow-200" },
        cleared: { text: "Floor Cleared", color: "text-green-400" },
    };
    const { text, color } = titles[type];
    return <h4 className={`text-center text-lg font-bold ${color}`}>{text}</h4>;
}

const GameScreen: React.FC<GameScreenProps> = ({ engine, onShowStatus, onShowInventory, onShowInstructions }) => {
  const { player, logs, handleExplore, handleFight, handleFlee, handleReturnToShop, currentEncounter, isLoading, dungeonLevel, depth } = engine;
  const logsEndRef = useRef<HTMLDivElement>(null);
  
  useLayoutEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs, isLoading]);

  if (!player) return null;
  
  const renderActionButtons = () => {
    if(isLoading) return <button disabled className="bg-gray-600 text-white font-bold py-2 px-8 text-base border-b-4 border-gray-800 rounded cursor-wait">Thinking...</button>;
    
    switch(currentEncounter.type) {
        case 'enemy': return (
            <div className="flex flex-col items-center w-full">
                {currentEncounter.enemy && <EnemyDisplay enemy={currentEncounter.enemy} />}
                <div className="flex justify-center space-x-4">
                    <button onClick={handleFight} className="bg-red-700 hover:bg-red-600 text-white font-bold py-2 px-6 text-base border-b-4 border-red-900 hover:border-red-700 rounded transition duration-200">Fight</button>
                    <button onClick={handleFlee} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-6 text-base border-b-4 border-blue-800 hover:border-blue-600 rounded transition duration-200" title={currentEncounter.enemy?.isBoss ? "Fleeing a boss is nearly impossible!" : "Attempt to flee"}>Flee</button>
                </div>
            </div>
        );
        case 'cleared':
        case 'trap':
        case 'treasure':
            return (
                <div className="flex justify-center space-x-4">
                    <button onClick={handleExplore} className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-6 text-base border-b-4 border-green-800 hover:border-green-600 rounded transition duration-200">Explore Deeper</button>
                    <button onClick={handleReturnToShop} className="bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-2 px-6 text-base border-b-4 border-yellow-800 hover:border-yellow-700 rounded transition duration-200">Return to Shop</button>
                </div>
            );
        default: return <button onClick={handleExplore} className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-8 text-base border-b-4 border-green-800 hover:border-green-600 rounded transition duration-200">{depth === 0 ? `Enter Dungeon Lvl ${dungeonLevel}` : 'Explore Deeper'}</button>;
    }
  }

  const canManageInventory = currentEncounter.type !== 'enemy';
  return (
    <div className="flex flex-col h-[80vh] max-h-[80vh]">
      <div className="grid grid-cols-3 md:grid-cols-5 gap-4 p-2 border-b-2 border-green-700 mb-2 items-center flex-shrink-0">
        <div className="col-span-2 md:col-span-2">
            <h3 className="text-lg font-bold text-green-400">{player.name}</h3>
            <p className="text-sm text-gray-400">{`${getRaceName(player.race)} ${CLASSES[player.playerClass as keyof typeof CLASSES].nome} - Lvl ${player.level}`}</p>
            <div className="flex gap-x-4 text-sm mt-1">
                <span className="text-gray-400"><strong>ATK: </strong><span className="text-white font-semibold">{player.ataque_total}</span></span>
                <span className="text-gray-400"><strong>DEF: </strong><span className="text-white font-semibold">{player.defesa_total}</span></span>
            </div>
        </div>
        <div className="flex items-center justify-center">
            <span className="text-yellow-400 mr-2 text-lg">💰</span>
            <span className="text-xl">{`${player.carteira}g`}</span>
        </div>
        <div className="col-span-3 md:col-span-2 grid grid-cols-2 gap-x-4"> 
            <StatusBar label="HP" value={player.vida} max={player.vida_max_total} colorClass="bg-red-600" />
            <StatusBar label="XP" value={player.xp} max={player.xp_proximo_nivel} colorClass="bg-blue-500" />
        </div>
      </div>
      <div className="flex-shrink-0 text-center"> 
        <h4 className="text-md">{`Dungeon: ${dungeonLevel} | Floor: ${depth}`}</h4> 
        <EncounterTitle type={currentEncounter.type} />
      </div>
      <div className="bg-black/50 p-4 overflow-y-auto mb-4 border border-gray-700 rounded-md flex-grow"> 
        {logs.map((log: string, index: number) => <p key={index} className="mb-1 text-sm md:text-base" dangerouslySetInnerHTML={{ __html: log }} />)}
        {isLoading && <p className="text-yellow-400 animate-pulse">Thinking...</p>}
        <div ref={logsEndRef} />
      </div>
      <div className="flex items-center justify-between w-full pt-3 border-t border-gray-800 flex-shrink-0">
        <div className="flex justify-start w-1/3 gap-2"> 
            <button onClick={onShowStatus} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 border-b-2 border-gray-900 hover:border-gray-700 rounded transition duration-200">Status</button> 
            <button onClick={onShowInventory} disabled={!canManageInventory} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 border-b-2 border-gray-900 hover:border-gray-700 rounded transition duration-200 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed disabled:border-gray-900" title={!canManageInventory ? "Cannot manage inventory during combat" : "Open Inventory"}>Inventory</button>
        </div>
        <div className="flex justify-center w-1/3">
            {renderActionButtons()}
        </div>
        <div className="flex justify-end w-1/3"> 
            <button onClick={onShowInstructions} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 border-b-2 border-gray-900 hover:border-gray-700 rounded transition duration-200">How to Play</button>
        </div>
      </div>
    </div>
  );
};

export default GameScreen;