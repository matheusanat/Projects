import { SavedCharacter } from '../types';

const ACCOUNTS_KEY = 'terminal_dungeon_accounts';

interface UserAccount {
    username: string;
    passwordHash: string; // Simple hash for demonstration
    characters: Record<string, SavedCharacter>;
}

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

// Simple hashing function for demonstration purposes.
// In a real application, use a robust library like bcrypt.
const simpleHash = (str: string): string => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash |= 0; // Convert to 32bit integer
    }
    return hash.toString();
};

const getAccounts = (): Record<string, UserAccount> => {
    try {
        const data = localStorage.getItem(ACCOUNTS_KEY);
        return data ? JSON.parse(data) : {};
    } catch (error) {
        console.error("Failed to parse accounts from localStorage", error);
        return {};
    }
};

const saveAccounts = (accounts: Record<string, UserAccount>): void => {
    try {
        localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
    } catch (error) {
        console.error("Failed to save accounts to localStorage", error);
    }
};

export const registerUser = (username: string, password: string): { success: boolean; message: string; user?: UserAccount } => {
    const accounts = getAccounts();
    if (accounts[username]) {
        return { success: false, message: 'Username already exists.' };
    }
    const newUser: UserAccount = {
        username,
        passwordHash: simpleHash(password),
        characters: {},
    };
    accounts[username] = newUser;
    saveAccounts(accounts);
    return { success: true, message: 'Registration successful!', user: newUser };
};

export const loginUser = (username: string, password: string): { success: boolean; message: string; user?: UserAccount } => {
    const accounts = getAccounts();
    const user = accounts[username];
    if (!user) {
        return { success: false, message: 'User not found.' };
    }
    if (user.passwordHash !== simpleHash(password)) {
        return { success: false, message: 'Incorrect password.' };
    }
    return { success: true, message: 'Login successful!', user };
};

export const saveCharacterToAccount = (username: string, character: SavedCharacter): { success: boolean, user?: UserAccount } => {
    const accounts = getAccounts();
    const user = accounts[username];
    if (!user) {
        return { success: false };
    }

    // Use immutable updates to ensure React state changes are detected
    const updatedUser = {
        ...user,
        characters: {
            ...user.characters,
            [character.id]: character,
        },
    };

    const updatedAccounts = {
        ...accounts,
        [username]: updatedUser,
    };

    saveAccounts(updatedAccounts);
    return { success: true, user: updatedUser };
};

export const deleteCharacterFromAccount = (username: string, characterId: string): { success: boolean, user?: UserAccount } => {
    const accounts = getAccounts();
    const user = accounts[username];
    
    // Validate that the user and character exist
    if (!user || !user.characters || !user.characters[characterId]) {
        console.error("Attempted to delete a character that does not exist.");
        return { success: false };
    }

    // Explicitly create a new characters object without the deleted character
    const remainingCharacters = Object.keys(user.characters).reduce((acc, currentId) => {
        if (currentId !== characterId) {
            acc[currentId] = user.characters[currentId];
        }
        return acc;
    }, {} as Record<string, SavedCharacter>);

    const updatedUser = {
        ...user,
        characters: remainingCharacters,
    };

    const updatedAccounts = {
        ...accounts,
        [username]: updatedUser,
    };

    saveAccounts(updatedAccounts);
    return { success: true, user: updatedUser };
};


export const getLeaderboard = async (): Promise<LeaderboardEntry[]> => {
    try {
        const response = await fetch('/api/leaderboard');
        if (!response.ok) {
            console.error("Failed to fetch leaderboard from server.");
            return [];
        }
        const entries = await response.json();
        return entries;
    } catch (error) {
        console.error("Network error while fetching leaderboard:", error);
        return [];
    }
};

export const submitScore = async (user: {username: string}, player: SavedCharacter, dungeonLevel: number, floor: number): Promise<void> => {
    const newEntry: LeaderboardEntry = {
        id: player.id,
        username: user.username,
        playerName: player.name,
        playerRace: player.race,
        playerClass: player.playerClass,
        level: player.level,
        dungeonLevel,
        floor,
        gold_accumulated_run: player.gold_accumulated_run,
        date: new Date().toLocaleDateString(),
    };

    try {
        await fetch('/api/leaderboard', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newEntry),
        });
    } catch(error) {
        console.error("Failed to submit score:", error);
    }
};