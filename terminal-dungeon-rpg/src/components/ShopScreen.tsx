import React, { useState, useLayoutEffect, useRef, useMemo } from 'react';
import { SHOP_BUY_MULT, SHOP_SELL_MULT } from '../constants';
import { itens_db } from '../data/gameData';
import { getFullItemName } from '../utils';
import { Player, ItemInstance, ItemData } from '../types';

type Tab = 'buy' | 'sell' | 'repair' | 'vault';

type GroupedItem = { data: ItemData; count: number; originalIndexes: number[] };

interface ShopScreenProps {
  player: Player;
  engine: any;
  onExitShop: () => void;
  onEndRun: (action: 'return' | 'close') => void;
  onShowStatus: () => void;
  onShowInventory: () => void;
  onShowInstructions: () => void;
  onShowLeaderboard: () => void;
}

const TabButton: React.FC<{ title: string; isActive: boolean; onClick: () => void; }> = ({ title, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-lg font-bold transition duration-200 rounded-t-md ${isActive ? 'bg-gray-800 text-green-400 border-t-2 border-x-2 border-green-700' : 'bg-black text-gray-500 hover:bg-gray-900'}`}
    >
      {title}
    </button>
);

const ShopScreen: React.FC<ShopScreenProps> = ({ player, engine, onExitShop, onEndRun, onShowStatus, onShowInventory, onShowInstructions, onShowLeaderboard }) => {
  const [activeTab, setActiveTab] = useState<Tab>('buy');
  const [showEndRunConfirm, setShowEndRunConfirm] = useState(false);
  const [vaultAmount, setVaultAmount] = useState('');
  const logsEndRef = useRef<HTMLDivElement>(null);
  const { logs, shopInventory, calculateRepairCostForItem, handleRepairAll, handleRepairItem, handleBuyItem, handleSellItem, handleSellEquippedItem, handleDepositGold, handleWithdrawGold, handleDepositItem, handleWithdrawItem } = engine;

  useLayoutEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);
  
  const totalRepairCost = useMemo(() => {
    return (Object.values(player.equipado) as (ItemInstance | null)[])
        .reduce((cost, item) => cost + calculateRepairCostForItem(item), 0);
  }, [player.equipado, calculateRepairCostForItem]);
  
  const inventoryGroups = useMemo(() => {
    return player.inventario.reduce((acc, itemInstance, index) => {
        const itemData = itens_db[itemInstance.id as keyof typeof itens_db] as ItemData;
        if (!acc[itemInstance.id]) {
            acc[itemInstance.id] = { data: itemData, count: 0, originalIndexes: [] };
        }
        acc[itemInstance.id].count++;
        acc[itemInstance.id].originalIndexes.push(index);
        return acc;
    }, {} as Record<string, GroupedItem>);
  }, [player.inventario]);

  const vaultInventoryGroups = useMemo(() => {
    return (player.vault_inventario || []).reduce((acc, itemInstance, index) => {
        const itemData = itens_db[itemInstance.id as keyof typeof itens_db] as ItemData;
        if (!acc[itemInstance.id]) {
            acc[itemInstance.id] = { data: itemData, count: 0, originalIndexes: [] };
        }
        acc[itemInstance.id].count++;
        acc[itemInstance.id].originalIndexes.push(index);
        return acc;
    }, {} as Record<string, GroupedItem>);
  }, [player.vault_inventario]);

  const renderBuyTab = () => (
    <div>
        <h3 className="text-xl text-yellow-300 mb-2">For Sale</h3>
        <ul className="space-y-2">
            {shopInventory.map((item: ItemData) => { 
                const price = Math.ceil(item.valor * SHOP_BUY_MULT); 
                return (
                    <li key={item.id} className="flex justify-between items-center bg-gray-800 p-2 rounded">
                        <span className="flex-grow">
                          {getFullItemName({id: item.id, plus: 0})}
                        </span>
                        <button onClick={() => handleBuyItem(item, price)} disabled={player.carteira < price} className="bg-green-700 text-sm hover:bg-green-600 text-white font-bold py-1 px-3 rounded disabled:bg-gray-600 disabled:cursor-not-allowed ml-2 flex-shrink-0">
                            {`Buy (${price}g)`}
                        </button>
                    </li>
                ); 
            })}
        </ul>
    </div>
  );

  const renderSellTab = () => (
    <div>
        <h3 className="text-xl text-yellow-300 mb-2">Your Inventory</h3>
        {player.inventario.length > 0 ? (
            <ul className="space-y-2">
                {Object.entries(inventoryGroups).map(([id, group]: [string, GroupedItem]) => {
                    const price = Math.max(1, Math.floor(group.data.valor * SHOP_SELL_MULT));
                    return (
                        <li key={id} className="flex justify-between items-center bg-gray-800 p-2 rounded">
                            <span className="flex-grow">
                                {getFullItemName({id, plus: 0}, group.count)}
                            </span>
                            <button onClick={() => handleSellItem(group.originalIndexes[0], price)} className="bg-red-700 text-sm hover:bg-red-600 text-white font-bold py-1 px-3 rounded ml-2 flex-shrink-0">
                                {`Sell (${price}g)`}
                            </button>
                        </li>
                    );
                })}
            </ul>
        ) : (
            <p className="text-gray-500 italic">Your bag is empty.</p>
        )}
        <h3 className="text-xl text-yellow-300 mt-6 mb-2">Equipped Items</h3>
        {Object.values(player.equipado).some(item => item !== null) ? (
            <ul className="space-y-2">
                {(Object.keys(player.equipado) as Array<keyof typeof player.equipado>).map((slot) => {
                    const item = player.equipado[slot];
                    if (!item) return null;
                    const itemData = itens_db[item.id as keyof typeof itens_db] as ItemData;
                    const price = Math.max(1, Math.floor(itemData.valor * SHOP_SELL_MULT));
                    
                    return (
                        <li key={slot} className="flex justify-between items-center bg-gray-800 p-2 rounded">
                            <span className="flex-grow">
                                {getFullItemName(item)}
                            </span>
                            <button onClick={() => handleSellEquippedItem(slot, price)} className="bg-red-700 text-sm hover:bg-red-600 text-white font-bold py-1 px-3 rounded ml-2 flex-shrink-0">
                                {`Sell (${price}g)`}
                            </button>
                        </li>
                    );
                })}
            </ul>
        ) : (
            <p className="text-gray-500 italic">Nothing equipped.</p>
        )}
    </div>
  );

  const renderRepairTab = () => (
    <div>
      <h3 className="text-xl text-yellow-300 mb-2">Blacksmith Services</h3>
      <div className="bg-gray-800 p-4 rounded text-center">
        <p className="text-gray-400 mb-4">The blacksmith can restore your items to perfect condition.</p>
        <ul className="text-left space-y-2 mb-4">
            {(Object.keys(player.equipado) as Array<keyof typeof player.equipado>).map((slot) => { 
                const item = player.equipado[slot]; 
                if (!item?.durability || item.durability >= 100) return null; 
                const cost = calculateRepairCostForItem(item); 
                return (
                    <li key={slot} className="flex justify-between items-center bg-gray-900/50 p-2 rounded">
                        <span>{getFullItemName(item)}</span>
                        <button onClick={() => handleRepairItem(slot)} disabled={player.carteira < cost} className="bg-yellow-800 text-sm hover:bg-yellow-700 text-white font-bold py-1 px-3 rounded disabled:bg-gray-600 disabled:cursor-not-allowed">
                            {`Repair (${cost}g)`}
                        </button>
                    </li>
                );
            })}
        </ul>
        <p className="text-lg mb-4"><strong>Total Repair Cost: </strong><span className="text-yellow-400 font-bold">{`💰${totalRepairCost}g`}</span></p>
        <button onClick={handleRepairAll} disabled={player.carteira < totalRepairCost || totalRepairCost === 0} className="bg-yellow-700 hover:bg-yellow-600 text-white font-bold py-2 px-6 border-b-4 border-yellow-900 hover:border-yellow-700 rounded transition duration-200 disabled:bg-gray-600 disabled:border-gray-800 disabled:cursor-not-allowed">
            Repair All Equipped Items
        </button>
      </div>
    </div>
  );

  const renderVaultTab = () => {
    const handleGoldAction = (action: 'deposit' | 'withdraw') => {
        const amount = parseInt(vaultAmount, 10);
        if (isNaN(amount) || amount <= 0) {
            setVaultAmount('');
            return;
        }
        if (action === 'deposit') handleDepositGold(amount);
        else handleWithdrawGold(amount);
        setVaultAmount('');
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="md:pr-3 md:border-r md:border-gray-700">
                <h3 className="text-xl text-yellow-300 mb-2">Gold Management</h3>
                <div className="bg-gray-800 p-3 rounded space-y-3">
                    <p><strong>Wallet: </strong><span className="text-yellow-400">{player.carteira}g</span></p>
                    <p><strong>Vault: </strong><span className="text-yellow-400">{player.vault_gold || 0}g</span></p>
                    <div className="border-t border-gray-700 mt-3 pt-3 flex gap-2">
                        <input type="number" value={vaultAmount} onChange={e => setVaultAmount(e.target.value)} placeholder="Amount" className="bg-gray-900 border border-green-700 text-white p-1 rounded w-full text-center focus:outline-none focus:ring-1 focus:ring-green-500" />
                        <button onClick={() => handleGoldAction('deposit')} className="bg-green-700 hover:bg-green-600 text-white font-bold py-1 px-2 rounded text-sm">Deposit</button>
                        <button onClick={() => handleGoldAction('withdraw')} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-1 px-2 rounded text-sm">Withdraw</button>
                    </div>
                </div>
            </div>
            <div className="md:pl-3">
                 <h3 className="text-xl text-yellow-300 mb-2">Item Storage</h3>
                 <div className="mb-4">
                    <h4 className="text-lg text-green-300 mb-2">Deposit (from Inventory)</h4>
                    {player.inventario.length > 0 ? (
                        <ul className="space-y-2">
                            {Object.values(inventoryGroups).map(group => (
                                <li key={`deposit-${group.data.id}`} className="flex justify-between items-center bg-gray-800 p-2 rounded">
                                    <span className="flex-grow">{getFullItemName({id: group.data.id, plus: 0}, group.count)}</span>
                                    <button onClick={() => handleDepositItem(group.originalIndexes[0])} className="bg-green-700 text-sm hover:bg-green-600 text-white font-bold py-1 px-3 rounded ml-2 flex-shrink-0">Deposit</button>
                                </li>
                            ))}
                        </ul>
                    ) : <p className="text-gray-500 italic">Your bag is empty.</p>}
                 </div>
                 <div>
                    <h4 className="text-lg text-blue-300 mb-2">Withdraw (to Inventory)</h4>
                    {(player.vault_inventario || []).length > 0 ? (
                        <ul className="space-y-2">
                            {Object.values(vaultInventoryGroups).map(group => (
                                <li key={`withdraw-${group.data.id}`} className="flex justify-between items-center bg-gray-800 p-2 rounded">
                                    <span className="flex-grow">{getFullItemName({id: group.data.id, plus: 0}, group.count)}</span>
                                    <button onClick={() => handleWithdrawItem(group.originalIndexes[0])} className="bg-blue-600 text-sm hover:bg-blue-500 text-white font-bold py-1 px-3 rounded ml-2 flex-shrink-0">Withdraw</button>
                                </li>
                            ))}
                        </ul>
                    ) : <p className="text-gray-500 italic">Your vault is empty.</p>}
                 </div>
            </div>
        </div>
    );
  };
  
  return (
    <div className="flex flex-col p-4">
      {showEndRunConfirm && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-fadeIn">
              <div className="bg-gray-900 border-2 border-yellow-600 p-8 rounded-lg text-center shadow-lg">
                  <h3 className="text-2xl text-yellow-400 mb-4">End Run for Today?</h3>
                  <p className="text-gray-300 mb-6">Your progress will be saved. You can continue later.</p>
                  <div className="flex justify-center gap-4">
                      <button
                          onClick={() => onEndRun('return')}
                          className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-6 border-b-4 border-blue-800 hover:border-blue-600 rounded"
                      >
                          Return to Hall
                      </button>
                      <button
                          onClick={() => onEndRun('close')}
                          className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-6 border-b-4 border-green-800 hover:border-green-600 rounded"
                      >
                          Close Game
                      </button>
                      <button
                          onClick={() => setShowEndRunConfirm(false)}
                          className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-6 border-b-4 border-gray-800 hover:border-gray-600 rounded"
                      >
                          Cancel
                      </button>
                  </div>
              </div>
          </div>
      )}
      <div className="text-center border-b-2 border-green-700 pb-4 mb-4"> 
        <h2 className="text-2xl text-green-400">Merchant's Shop</h2>
        <p className="text-lg"><strong>Your Gold: </strong><span className="text-yellow-400">{`💰${player.carteira}g`}</span></p>
      </div>
      <div className="bg-black/30 p-2 overflow-y-auto mb-2 border border-gray-700 rounded-md h-24 text-sm"> 
        {logs.slice(-5).map((log: string, index: number) => <p key={index} dangerouslySetInnerHTML={{ __html: log }} />)}
        <div ref={logsEndRef} />
      </div>
      <div className="flex border-b-2 border-green-700 mb-4">
        <div className="flex gap-1">
            <TabButton title="Buy" isActive={activeTab === 'buy'} onClick={() => setActiveTab('buy')} />
            <TabButton title="Sell" isActive={activeTab === 'sell'} onClick={() => setActiveTab('sell')} />
            <TabButton title="Repair" isActive={activeTab === 'repair'} onClick={() => setActiveTab('repair')} />
        </div>
        <div className="ml-auto">
            <TabButton title="Vault" isActive={activeTab === 'vault'} onClick={() => setActiveTab('vault')} />
        </div>
      </div>
      <div className="flex-grow overflow-y-auto h-[22rem] pr-2">
        {activeTab === 'buy' && renderBuyTab()}
        {activeTab === 'sell' && renderSellTab()}
        {activeTab === 'repair' && renderRepairTab()}
        {activeTab === 'vault' && renderVaultTab()}
      </div>
      <div className="mt-6 flex justify-between items-center">
        <div className="flex gap-2">
          <button onClick={onShowStatus} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 border-b-2 border-gray-900 hover:border-gray-700 rounded transition duration-200">Status</button>
          <button onClick={onShowInventory} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 border-b-2 border-gray-900 hover:border-gray-700 rounded transition duration-200">Inventory</button>
        </div>
        <div className="flex flex-col items-center gap-2">
          <button onClick={onExitShop} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-6 text-base border-b-4 border-blue-800 hover:border-blue-600 rounded transition duration-200">Enter Dungeon</button>
          <button 
            onClick={() => setShowEndRunConfirm(true)} 
            className="bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-2 px-6 border-b-4 border-yellow-800 hover:border-yellow-700 rounded transition duration-200 text-sm"
          >
            End for Today
          </button>
        </div>
        <div className="flex gap-2">
          <button onClick={onShowLeaderboard} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 border-b-2 border-gray-900 hover:border-gray-700 rounded transition duration-200">Hall of Fame</button>
          <button onClick={onShowInstructions} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 border-b-2 border-gray-900 hover:border-gray-700 rounded transition duration-200">How to Play</button>
        </div>
      </div>
    </div>
  );
};

export default ShopScreen;