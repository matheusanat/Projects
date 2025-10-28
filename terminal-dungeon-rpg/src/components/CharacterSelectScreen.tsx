import React from 'react';
import { getRaceName } from '../utils';
import { CLASSES } from '../data/gameData';
import { SavedCharacter } from '../types';

interface User {
    username: string;
    characters: Record<string, SavedCharacter>;
}

interface CharacterSelectScreenProps {
    user: User;
    onCharacterSelect: (charId: string) => void;
    onCharacterCreate: () => void;
    onLogout: () => void;
    onShowLeaderboard: () => void;
    onCharacterDelete: (charId: string) => void;
}

const CharacterSelectScreen: React.FC<CharacterSelectScreenProps> = ({ user, onCharacterSelect, onCharacterCreate, onLogout, onShowLeaderboard, onCharacterDelete }) => {
    const characters = Object.values(user.characters || {});

    return (
        <div className="flex flex-col items-center p-4 animate-fadeIn">
            <div className="w-full flex justify-between items-center mb-4">
              <h2 className="text-2xl text-green-400">Hall of Heroes</h2>
              <button onClick={onLogout} className="text-sm bg-red-800 hover:bg-red-700 text-white font-bold py-1 px-3 rounded transition duration-200">Logout</button>
            </div>
            <p className="mb-6 text-gray-400">{`Welcome, ${user.username}. Choose your hero or forge a new legend.`}</p>
            <div className="w-full max-w-lg space-y-3 mb-6">
                {characters.length > 0 ? (
                    characters.map((char: SavedCharacter) => (
                        <div key={char.id} className="bg-gray-800 p-3 rounded-lg border border-gray-700 flex justify-between items-center">
                            <div>
                                <h3 className="text-lg text-yellow-400">{char.name}</h3>
                                <p className="text-sm text-gray-400">{`Lvl ${char.level} ${getRaceName(char.race)} ${CLASSES[char.playerClass as keyof typeof CLASSES].nome}`}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => onCharacterSelect(char.id)} className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 border-b-4 border-green-800 hover:border-green-600 rounded transition duration-200">Select</button>
                                <button 
                                    onClick={() => onCharacterDelete(char.id)} 
                                    className="bg-red-800 hover:bg-red-700 text-white font-bold py-2 px-3 rounded transition duration-200"
                                    title="Delete Character"
                                >
                                    X
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-gray-500 italic">No heroes have been forged yet.</p>
                )}
            </div>
            <div className="flex gap-4">
              <button onClick={onCharacterCreate} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-6 border-b-4 border-blue-800 hover:border-blue-600 rounded transition duration-200">Create New Hero</button>
              <button onClick={onShowLeaderboard} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-6 border-b-4 border-gray-800 hover:border-gray-600 rounded transition duration-200">Hall of Fame</button>
            </div>
        </div>
    );
};

export default CharacterSelectScreen;