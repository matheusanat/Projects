import { kv } from '@vercel/kv';
import { NextApiRequest, NextApiResponse } from 'next';

export interface LeaderboardEntry {
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

const LEADERBOARD_KEY = 'terminal_dungeon_leaderboard';

const sortLeaderboard = (a: LeaderboardEntry, b: LeaderboardEntry) => {
    if (b.dungeonLevel !== a.dungeonLevel) return b.dungeonLevel - a.dungeonLevel;
    if (b.floor !== a.floor) return b.floor - a.floor;
    if (b.level !== a.level) return b.level - a.level;
    return b.gold_accumulated_run - a.gold_accumulated_run;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        try {
            const leaderboard = await kv.get<LeaderboardEntry[]>(LEADERBOARD_KEY);
            res.status(200).json(leaderboard || []);
        } catch (error) {
            console.error("Error fetching leaderboard:", error);
            res.status(500).json({ message: 'Error fetching leaderboard data.' });
        }
    } 
    else if (req.method === 'POST') {
        try {
            const newEntry = req.body as LeaderboardEntry;

            if (!newEntry || !newEntry.id || !newEntry.playerName) {
                return res.status(400).json({ message: 'Invalid score data.' });
            }

            let leaderboard = await kv.get<LeaderboardEntry[]>(LEADERBOARD_KEY) || [];
            
            const existingEntryIndex = leaderboard.findIndex(e => e.id === newEntry.id);

            if (existingEntryIndex > -1) {
                const existing = leaderboard[existingEntryIndex];
                const isNewScoreBetter = newEntry.dungeonLevel > existing.dungeonLevel ||
                                        (newEntry.dungeonLevel === existing.dungeonLevel && newEntry.floor > existing.floor);
                if (isNewScoreBetter) {
                    leaderboard[existingEntryIndex] = newEntry;
                }
            } else {
                leaderboard.push(newEntry);
            }

            const sorted = leaderboard.sort(sortLeaderboard).slice(0, 20);

            await kv.set(LEADERBOARD_KEY, sorted);
            
            res.status(200).json(sorted);
        } catch (error) {
            console.error("Error submitting score:", error);
            res.status(500).json({ message: 'Error saving score.' });
        }
    } 
    else {
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}