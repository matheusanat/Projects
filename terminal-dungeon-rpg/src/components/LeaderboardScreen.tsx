import React from 'react';
import { getRaceName } from '../utils';
import { CLASSES } from '../data/gameData';
import { RaceKey } from '../types';

interface LeaderboardEntry {
    id: string;
    username: string;
    playerName: string;
    playerRace: string;
    playerClass: string;
    level: number;
    dungeonLevel: number;
    floor: number;
    gold_accumulated_run: number;
    date: string;
}

interface LeaderboardScreenProps {
    entries: LeaderboardEntry[];
    onBack: () => void;
}

const LeaderboardScreen: React.FC<LeaderboardScreenProps> = ({ entries, onBack }) => {

    const getRankDisplay = (index: number) => {
        if (index === 0) return '🥇';
        if (index === 1) return '🥈';
        if (index === 2) return '🥉';
        return `#${index + 1}`;
    };

    return (
        <div className="flex flex-col items-center p-4">
            <h2 className="text-2xl text-green-400 mb-6">Hall of Fame</h2>
            <div className="w-full overflow-x-auto">
                <table className="min-w-full text-left text-sm whitespace-nowrap">
                    <thead className="border-b-2 border-green-700 text-gray-400 uppercase tracking-wider">
                        <tr>
                            <th className="p-2">Rank</th>
                            <th className="p-2">Player</th>
                            <th className="p-2">Race</th>
                            <th className="p-2">Class</th>
                            <th className="p-2 text-center">Player Lvl</th>
                            <th className="p-2 text-center">Dungeon</th>
                            <th className="p-2 text-center">Floor</th>
                            <th className="p-2 text-center">Gold Earned</th>
                            <th className="p-2 text-right">Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {entries.length > 0 ? (
                            entries.slice(0, 15).map((entry, index) => (
                                <tr key={entry.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                                    <td className={`p-2 font-bold text-lg text-center ${index < 3 ? 'text-yellow-400' : ''}`}>{getRankDisplay(index)}</td>
                                    <td className="p-2">{`${entry.playerName} (${entry.username})`}</td>
                                    <td className="p-2">{getRaceName(entry.playerRace as RaceKey)}</td>
                                    <td className="p-2">{entry.playerClass ? CLASSES[entry.playerClass as keyof typeof CLASSES]?.nome : ''}</td>
                                    <td className="p-2 text-center">{entry.level}</td>
                                    <td className="p-2 text-center">{entry.dungeonLevel}</td>
                                    <td className="p-2 text-center">{entry.floor}</td>
                                    <td className="p-2 text-center text-yellow-400">{entry.gold_accumulated_run}</td>
                                    <td className="p-2 text-right text-gray-500">{entry.date}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={9} className="text-center p-8 text-gray-500">No heroes have been recorded yet. Be the first!</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <button onClick={onBack} className="mt-8 bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-8 border-b-4 border-gray-800 hover:border-gray-600 rounded transition duration-200">[ Back ]</button>
        </div>
    );
}

export default LeaderboardScreen;