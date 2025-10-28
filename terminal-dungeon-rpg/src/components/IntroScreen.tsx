import React from 'react';

interface IntroScreenProps {
  onBegin: () => void;
  onShowLeaderboard: () => void;
}

const IntroScreen: React.FC<IntroScreenProps> = ({ onBegin, onShowLeaderboard }) => (
  <div className="flex flex-col items-center justify-center text-center p-8 animate-fadeIn">
    <p className="text-lg text-gray-400 mb-8">
      Welcome to the Terminal Dungeon. A place of endless corridors, forgotten treasures, and lurking horrors. Many have entered, but none have seen the final floor. Your objective is simple: survive, grow stronger, and carve your name into the Hall of Heroes.
    </p>
    <div className="space-y-4 w-full max-w-xs">
      <button
        onClick={onBegin}
        className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-4 border-b-4 border-green-800 hover:border-green-600 rounded transition duration-200"
      >
        [ Login / Register ]
      </button>
      <button
        onClick={onShowLeaderboard}
        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 border-b-4 border-blue-800 hover:border-blue-600 rounded transition duration-200"
      >
        [ View Global Leaderboard ]
      </button>
    </div>
  </div>
);

export default IntroScreen;