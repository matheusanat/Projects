import React, { useState } from 'react';
import { Race, RaceKey, Player } from '../types';
import { RACES, CLASSES } from '../data/gameData';
import { getInitialStats, createInitialPlayer } from '../hooks/useGameEngine';

interface CharacterCreatorProps {
    onCharacterCreated: (character: Player) => void;
    onBack: () => void;
}

const CharacterCreator: React.FC<CharacterCreatorProps> = ({ onCharacterCreated, onBack }) => {
  const [name, setName] = useState('');
  const [selectedRace, setSelectedRace] = useState<RaceKey>(Race.Human);
  const [selectedClass, setSelectedClass] = useState<string>(Object.keys(CLASSES)[0]);
  const [step, setStep] = useState(1);

  const handleCreate = () => {
    if (name.trim()) {
      onCharacterCreated(createInitialPlayer(name.trim(), selectedRace, selectedClass));
    }
  };

  const renderRaceStep = () => {
    const raceData = RACES[selectedRace];
    const initialStats = getInitialStats(selectedRace);
    return (
      <div className="flex flex-col items-center p-4">
          <h2 className="text-2xl text-green-400 mb-4">Choose Your Lineage</h2>
          <div className="flex flex-wrap justify-center gap-2 mb-4">
              {Object.keys(RACES).map((raceKey) => (
              <button 
                key={raceKey} 
                onClick={() => setSelectedRace(raceKey as RaceKey)} 
                className={`px-3 py-1 rounded border-2 transition text-sm ${selectedRace === raceKey ? 'bg-green-500 border-green-300' : 'bg-gray-700 border-gray-600 hover:bg-gray-600'}`}>
                  {RACES[raceKey as RaceKey].nome}
              </button>
              ))}
          </div>
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 text-left w-full max-w-md min-h-[300px] flex flex-col">
              <h3 className="text-xl text-yellow-400 mb-2 text-center">{raceData.nome}</h3>
              <p className="text-gray-400 mb-3 text-center italic">"{raceData.desc}"</p>
              
              <div className="border-t border-gray-600 my-3"></div>

              <div className="mb-4">
                  <h4 className="font-bold text-green-300 mb-2">Base Attributes</h4>
                  <div className="grid grid-cols-4 gap-2 text-center text-gray-300">
                      <div><strong>STR: </strong><span className="font-bold text-white">{initialStats.strength}</span></div>
                      <div><strong>CON: </strong><span className="font-bold text-white">{initialStats.constitution}</span></div>
                      <div><strong>DEX: </strong><span className="font-bold text-white">{initialStats.dexterity}</span></div>
                      <div><strong>LCK: </strong><span className="font-bold text-white">{initialStats.luck_base}</span></div>
                  </div>
              </div>

              <div>
                  <h4 className="font-bold text-green-300 mb-1">Racial Passive</h4>
                  <p className="text-sm text-gray-300">
                      <span className="font-semibold text-white">{raceData.habilidade_passiva.nome}: </span>
                      {raceData.habilidade_passiva.desc}
                  </p>
              </div>
          </div>
          <div className="flex gap-4 mt-6">
              <button onClick={onBack} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-8 border-b-4 border-gray-800 hover:border-gray-600 rounded transition duration-200">Back</button>
              <button onClick={() => setStep(2)} className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-8 border-b-4 border-green-800 hover:border-green-600 rounded transition duration-200">Next</button>
          </div>
      </div>
    );
  };
  
  const renderClassStep = () => {
    const classData = CLASSES[selectedClass as keyof typeof CLASSES];
    const [flavorText, bonusText] = classData.desc.split('. ', 2);
    
    return (
      <div className="flex flex-col items-center p-4">
          <h2 className="text-2xl text-green-400 mb-4">Choose Your Class</h2>
           <div className="flex flex-wrap justify-center gap-2 mb-4">
              {Object.keys(CLASSES).map((classKey) => (
              <button key={classKey} onClick={() => setSelectedClass(classKey)} className={`px-3 py-1 rounded border-2 transition text-sm ${selectedClass === classKey ? 'bg-green-500 border-green-300' : 'bg-gray-700 border-gray-600 hover:bg-gray-600'}`}>
                  {CLASSES[classKey as keyof typeof CLASSES].nome}
              </button>
              ))}
          </div>
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 w-full max-w-md min-h-[300px] flex flex-col justify-center">
              <h3 className="text-xl text-yellow-400 mb-2 text-center">{classData.nome}</h3>
              <p className="text-gray-400 mb-3 text-center italic">"{flavorText}."</p>
              
              <div className="border-t border-gray-600 my-3"></div>

              <div className="text-center">
                  <h4 className="font-bold text-green-300 mb-1">Class Bonus</h4>
                  <p className="text-sm text-gray-300">
                      <span className="font-semibold text-white">{bonusText}</span>
                  </p>
              </div>
          </div>
          <div className="flex gap-4 mt-6">
              <button onClick={() => setStep(1)} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-8 border-b-4 border-gray-800 hover:border-gray-600 rounded transition duration-200">Back</button>
              <button onClick={() => setStep(3)} className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-8 border-b-4 border-green-800 hover:border-green-600 rounded transition duration-200">Next</button>
          </div>
      </div>
    );
  };

  const renderNameStep = () => (
    <div className="flex flex-col items-center p-4">
      <h2 className="text-2xl text-green-400 mb-4">Name Your Adventurer</h2>
      <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 text-center w-full max-w-md min-h-[300px] flex flex-col justify-center">
        <p className="text-gray-400 mb-6 text-center">Your legend is almost complete. What will you be called?</p>
        <div className="w-full max-w-xs mx-auto">
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="Enter your name" 
              maxLength={20} 
              className="bg-gray-800 border border-green-600 text-white text-center p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-green-400" 
              onKeyPress={(e) => e.key === 'Enter' && name.trim() && handleCreate()} 
            />
        </div>
      </div>
      <div className="flex gap-4 mt-6">
          <button onClick={() => setStep(2)} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-8 border-b-4 border-gray-800 hover:border-gray-600 rounded transition duration-200">Back</button>
          <button onClick={handleCreate} disabled={!name.trim()} className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-8 border-b-4 border-green-800 hover:border-green-600 rounded disabled:bg-gray-600 disabled:border-gray-800 disabled:cursor-not-allowed transition duration-200">
            Begin Adventure
          </button>
      </div>
    </div>
  );

  switch(step) {
      case 1: return renderRaceStep();
      case 2: return renderClassStep();
      case 3: return renderNameStep();
      default: return renderRaceStep();
  }
};

export default CharacterCreator;