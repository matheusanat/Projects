import React from 'react';
import { RACES, CLASSES } from '../data/gameData';

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="mb-4">
        <h3 className="text-xl text-yellow-300 mb-2 border-b border-gray-700">{title}</h3>
        <div className="space-y-2 text-gray-300 text-sm">{children}</div>
    </div>
);

const InstructionsScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => (
    <div className="flex flex-col p-2">
      <div className="text-center border-b-2 border-green-700 pb-2 mb-4">
        <h2 className="text-2xl text-green-400">How to Play</h2>
        <p className="text-gray-400">The essential guide to surviving the Terminal Dungeon.</p>
      </div>
      <div className="flex-grow overflow-y-auto pr-2 max-h-[65vh]">
        <Section title="Objective">
          <p>Your goal is to delve as deep as you can. Each dungeon has 10 floors, with a powerful boss on the final floor. Defeating the boss allows you to proceed to the next, more difficult dungeon level. Your score on the leaderboard is determined by the highest dungeon level and floor you reach.</p>
        </Section>
        <Section title="Defeat & The Death Penalty">
          <p>If you are defeated, you awaken in the shop. You keep your level, experience, and all allocated attribute points. However, you lose all your gold and inventory items, and the durability of your equipped gear is halved.</p>
        </Section>
        <Section title="Attributes">
            <p><strong>Strength (STR):</strong> Increases your base Attack damage.</p>
            <p><strong>Constitution (CON):</strong> Increases your maximum Health Points (HP).</p>
            <p><strong>Dexterity (DEX):</strong> Increases your base Defense, reducing damage taken.</p>
            <p><strong>Luck (LCK):</strong> A versatile stat that slightly increases your chance to dodge attacks, avoid traps, and find more gold.</p>
        </Section>
        <Section title="Races & Classes">
            <p>Your choice of Race and Class provides unique passive bonuses that define your playstyle.</p>
            <div className="mt-4">
                <h4 className="text-lg text-yellow-200">Races</h4>
                <ul className="list-disc list-inside space-y-2 mt-1">
                    {Object.values(RACES).map(race => (
                        <li key={race.nome}>
                            <strong>{race.nome}:</strong> {race.habilidade_passiva.desc}
                        </li>
                    ))}
                </ul>
            </div>
            <div className="mt-4">
                <h4 className="text-lg text-yellow-200">Classes</h4>
                 <ul className="list-disc list-inside space-y-2 mt-1">
                    {Object.values(CLASSES).map(cls => (
                        <li key={cls.nome}>
                            <strong>{cls.nome}:</strong> {cls.desc}
                        </li>
                    ))}
                </ul>
            </div>
        </Section>
        <Section title="Combat & Durability">
          <p>Combat is fully automated once initiated. Your stats are pitted against the enemy's. If you win, you gain XP and Gold. Your equipment loses durability after each fight (3% for normal, 8% for bosses). If an item's durability reaches 0%, it breaks and is destroyed!</p>
        </Section>
        <Section title="The Shop">
          <p>The shop is your safe haven. The merchant's inventory restocks with new, level-appropriate items every time you defeat a dungeon boss. You can buy new gear, sell unwanted items, and repair your equipped items at the Blacksmith.</p>
        </Section>
      </div>
      <div className="mt-6 text-center">
        <button onClick={onBack} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-8 text-lg border-b-4 border-gray-800 hover:border-gray-600 rounded transition duration-200">
            Back
        </button>
      </div>
    </div>
);

export default InstructionsScreen;