import React from 'react';

interface DungeonVictoryScreenProps {
    onProceed: () => void;
    onReturnToShop: () => void;
}

const DungeonVictoryScreen: React.FC<DungeonVictoryScreenProps> = ({ onProceed, onReturnToShop }) => (
  <div className="flex flex-col items-center justify-center text-center p-8 animate-fadeIn">
    <h2 className="text-4xl text-yellow-400 font-bold mb-4">[ DUNGEON CLEARED! ]</h2>
    <p className="text-lg text-gray-300 mb-8">You have vanquished the guardian of this level. The way forward is open, but the shop's comforts also call to you.</p>
    <div className="space-y-4 w-full max-w-sm">
      <button
        onClick={onProceed}
        className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-4 border-b-4 border-green-800 hover:border-green-600 rounded transition duration-200"
      >
        [ Proceed to Next Dungeon ]
      </button>
      <button
        onClick={onReturnToShop}
        className="w-full bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-3 px-4 border-b-4 border-yellow-800 hover:border-yellow-700 rounded transition duration-200"
      >
        [ Return to Shop ]
      </button>
    </div>
  </div>
);

export default DungeonVictoryScreen;