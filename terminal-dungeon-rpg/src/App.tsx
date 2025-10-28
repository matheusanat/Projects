import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useGameEngine, createInitialPlayer, calculateStats } from './hooks/useGameEngine';
import { Player, SavedCharacter } from './types';
import { INITIAL_GOLD } from './constants';
import { RACES } from './data/gameData';
import * as gameService from './services/gameService';

import LoginScreen from './components/LoginScreen';
import CharacterSelectScreen from './components/CharacterSelectScreen';
import CharacterCreator from './components/CharacterCreator';
import GameScreen from './components/GameScreen';
import LeaderboardScreen from './components/LeaderboardScreen';
import ShopScreen from './components/ShopScreen';
import PlayerStatusScreen from './components/PlayerStatusScreen';
import InventoryScreen from './components/InventoryScreen';
import DungeonVictoryScreen from './components/DungeonVictoryScreen';
import AttributeAllocationScreen from './components/AttributeAllocationScreen';
import InstructionsScreen from './components/InstructionsScreen';
import IntroStoryScreen from './components/IntroStoryScreen';
import { toSavedCharacter } from './utils';

type GameState = 
  | 'login' 
  | 'intro_story'
  | 'character_select' 
  | 'character_creator' 
  | 'in_game' 
  | 'in_shop' 
  | 'player_status' 
  | 'inventory_management' 
  | 'instructions' 
  | 'dungeon_victory' 
  | 'attribute_allocation' 
  | 'leaderboard';

interface User {
    username: string;
    characters: Record<string, SavedCharacter>;
}

const App = () => {
  const [gameState, setGameState] = useState<GameState>('login');
  const [user, setUser] = useState<User | null>(null);
  const [previousGameState, setPreviousGameState] = useState<GameState | null>(null);
  const [leaderboard, setLeaderboard] = useState<gameService.LeaderboardEntry[]>([]);
  
  const onDefeatRef = useRef<any>(null);

  const gameEngine = useGameEngine({ 
    onDefeat: (...args) => onDefeatRef.current?.(...args), 
    onLevelUp: () => {
      setPreviousGameState(gameState);
      setGameState('attribute_allocation');
    }, 
    onDungeonVictory: () => setGameState('dungeon_victory'),
    onGoToShop: () => setGameState('in_shop')
  });
  
  const { player, setPlayer, startNewGame, setInitialLog, resetDungeonProgress, resetDungeonLog, setupNextDungeon, currentEncounter, restockShop } = gameEngine;

  const handleDefeat = useCallback(async (defeatedPlayer: Player, reason: string, dungeonLevel: number, floor: number, maxDungeonLevel: number, maxFloor: number) => {
    if (!user) return;
    
    await gameService.submitScore(user, toSavedCharacter(defeatedPlayer), maxDungeonLevel, maxFloor);
    const updatedLeaderboard = await gameService.getLeaderboard();
    setLeaderboard(updatedLeaderboard);
    
    const newEquipado = { ...defeatedPlayer.equipado };
    for (const slot of ['arma', 'armadura', 'amuleto', 'anel']) {
        const key = slot as keyof typeof newEquipado;
        const item = newEquipado[key];
        if (item?.durability !== undefined) {
            item.durability = Math.floor(item.durability / 2);
        }
    }

    const penaltyPlayer: Player = {
      ...defeatedPlayer,
      carteira: 0,
      gold_accumulated_run: INITIAL_GOLD + (RACES[defeatedPlayer.race].bonus.gold || 0),
      inventario: [],
      equipado: newEquipado,
      currentDungeonLevel: 1,
    };
    
    const healedPlayer = calculateStats(penaltyPlayer)!;
    healedPlayer.vida = healedPlayer.vida_max_total;
    
    const savedCharacter = toSavedCharacter(healedPlayer);
    const result = gameService.saveCharacterToAccount(user.username, savedCharacter);
    if(result.success && result.user) {
        setUser(result.user);
    }

    setPlayer(() => healedPlayer);
    restockShop(healedPlayer);
    setInitialLog([
        `<span class="text-red-500 font-bold">[DEFEATED]</span> You were ${reason} in Dungeon Lvl ${dungeonLevel} on Floor ${floor}.`,
        `You awaken at the shop, keeping your level, XP, attributes, and vaulted items.`,
        `<span class="text-red-700">However, you lose all gold and inventory items from your bag, and your equipped items' durability is halved.</span>`
    ]);
    
    resetDungeonProgress();
    setGameState('in_shop');
  }, [user, setPlayer, setInitialLog, resetDungeonProgress, restockShop]);

  useEffect(() => {
    onDefeatRef.current = handleDefeat;
  }, [handleDefeat]);

  const handleRegisterSuccess = (registeredUser: User) => {
      setUser(registeredUser);
      localStorage.setItem('terminal_dungeon_currentUser', registeredUser.username);
      setGameState('intro_story');
  };

  const handleLoginSuccess = (loggedInUser: User) => {
      setUser(loggedInUser);
      localStorage.setItem('terminal_dungeon_currentUser', loggedInUser.username);
      setGameState('character_select');
  };

  const handleLogout = () => {
      setUser(null);
      setPlayer(() => null);
      localStorage.removeItem('terminal_dungeon_currentUser');
      setGameState('login');
  };
  
  const handleCharacterSelect = useCallback((charId: string) => {
      if (!user?.characters) return;
      const savedCharacter = user.characters[charId];
      if (savedCharacter) {
          const partialPlayer: Omit<Player, 'infernalLegacyUsedThisFloor'> = {
              ...savedCharacter,
              vida: 0,
              vida_max_total: 0,
              ataque_total: 0,
              defesa_total: 0,
              luck: 0,
              xp_bonus: 0,
              gold_bonus: 0,
          };
          const fullPlayer = calculateStats(partialPlayer as Player)!;
          fullPlayer.vida = fullPlayer.vida_max_total;
          
          startNewGame(fullPlayer, false);
          setGameState('in_shop');
      }
  }, [user, startNewGame]);

  const handleCharacterCreate = useCallback((newCharacter: Player) => {
      if (!user) {
        console.error("Cannot create character: No user logged in.");
        return;
      }
      const savedCharacter = toSavedCharacter(newCharacter);
      const result = gameService.saveCharacterToAccount(user.username, savedCharacter);
      if (result.success && result.user) {
          setUser(result.user);
          startNewGame(newCharacter);
          setGameState('in_shop');
      }
  }, [user, startNewGame]);
  
  const handleEndRun = useCallback((action: 'return' | 'close') => {
      if (!user || !player) return;
      const savedCharacter = toSavedCharacter(player);
      const result = gameService.saveCharacterToAccount(user.username, savedCharacter);
      if (result.success && result.user) {
          setUser(result.user);
      }
      setPlayer(() => null);

      if (action === 'return') {
          setGameState('character_select');
      } else if (action === 'close') {
          window.close();
      }
  }, [user, player, setPlayer]);
  
  const handleCharacterDelete = useCallback((charId: string) => {
    if (!user) return;
    if (window.confirm("Are you sure you want to permanently delete this character? This action cannot be undone.")) {
        const result = gameService.deleteCharacterFromAccount(user.username, charId);
        if (result.success && result.user) {
            setUser(result.user);
        } else {
            console.error("Failed to delete character from storage.");
            alert("Error: Could not delete character. Please try again.");
        }
    }
  }, [user, setUser]);

  const handleReturnFromScreen = useCallback((updatedPlayer?: Player | null) => {
    if(updatedPlayer && user) {
        const savedCharacter = toSavedCharacter(updatedPlayer);
        const result = gameService.saveCharacterToAccount(user.username, savedCharacter);
        if (result.success && result.user) {
            setUser(result.user);
        }
        setPlayer(() => updatedPlayer);
    }

    if (gameState === 'attribute_allocation' && currentEncounter.type === 'enemy' && currentEncounter.enemy?.isBoss) {
        setGameState('dungeon_victory');
    } else {
      setGameState(previousGameState || 'character_select');
      setPreviousGameState(null);
    }
  }, [user, setPlayer, gameState, previousGameState, currentEncounter]);
  
  const showSubScreen = (screen: GameState) => {
      setPreviousGameState(gameState);
      setGameState(screen);
  }

   useEffect(() => {
    const loadInitialData = async () => {
        const loggedInUser = localStorage.getItem('terminal_dungeon_currentUser');
        if (loggedInUser) {
            const accountsData = localStorage.getItem('terminal_dungeon_accounts');
            if(accountsData){
                const accounts = JSON.parse(accountsData);
                const userData = accounts[loggedInUser];
                if (userData) {
                    setUser(userData);
                    setGameState('character_select');
                } else {
                    setGameState('login');
                }
            }
        } else {
            setGameState('login');
        }
        const initialLeaderboard = await gameService.getLeaderboard();
        setLeaderboard(initialLeaderboard);
    };

    loadInitialData();
  }, []);

  const renderScreen = () => {
    switch (gameState) {
      case 'login': return <LoginScreen onLoginSuccess={handleLoginSuccess} onRegisterSuccess={handleRegisterSuccess} onShowLeaderboard={() => showSubScreen('leaderboard')} />;
      case 'intro_story': return <IntroStoryScreen onFinished={() => setGameState('character_select')} />;
      case 'character_select': return user ? <CharacterSelectScreen user={user} onCharacterSelect={handleCharacterSelect} onCharacterCreate={() => setGameState('character_creator')} onLogout={handleLogout} onShowLeaderboard={() => showSubScreen('leaderboard')} onCharacterDelete={handleCharacterDelete} /> : <LoginScreen onLoginSuccess={handleLoginSuccess} onRegisterSuccess={handleRegisterSuccess} onShowLeaderboard={() => showSubScreen('leaderboard')} />;
      case 'character_creator': return <CharacterCreator onCharacterCreated={handleCharacterCreate} onBack={() => setGameState('character_select')} />;
      case 'in_game': return player ? <GameScreen engine={gameEngine} onShowStatus={() => showSubScreen('player_status')} onShowInventory={() => showSubScreen('inventory_management')} onShowInstructions={() => showSubScreen('instructions')} /> : null;
      case 'in_shop': return player ? <ShopScreen 
        player={player} 
        engine={gameEngine} 
        onExitShop={() => { resetDungeonLog(); setGameState('in_game'); }} 
        onEndRun={handleEndRun}
        onShowStatus={() => showSubScreen('player_status')} 
        onShowInventory={() => showSubScreen('inventory_management')} 
        onShowInstructions={() => showSubScreen('instructions')} 
        onShowLeaderboard={() => showSubScreen('leaderboard')}
      /> : null;
      case 'player_status': return player ? <PlayerStatusScreen player={player} onBack={() => handleReturnFromScreen()} /> : null;
      case 'inventory_management': return player ? <InventoryScreen player={player} onClose={(p) => handleReturnFromScreen(p)} /> : null;
      case 'instructions': return <InstructionsScreen onBack={() => handleReturnFromScreen()} />;
      case 'dungeon_victory': return <DungeonVictoryScreen onProceed={() => { setupNextDungeon(); setGameState('in_game'); }} onReturnToShop={() => setGameState('in_shop')} />;
      case 'attribute_allocation': return player ? <AttributeAllocationScreen player={player} onFinished={(updatedPlayer) => handleReturnFromScreen(updatedPlayer)} onShowStatus={() => showSubScreen('player_status')} /> : null;
      case 'leaderboard': return <LeaderboardScreen entries={leaderboard} onBack={() => handleReturnFromScreen()} />;
      default: return <div>Error: Unknown game state.</div>;
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-4xl text-green-400 font-bold mb-2 tracking-widest">[ TERMINAL DUNGEON ]</h1>
      <p className="text-sm text-gray-500 mb-6">A React & Gemini Powered Adventure</p>
      <div className="w-full border-2 border-green-500 bg-black p-4 md:p-6 shadow-lg shadow-green-500/20">
        {renderScreen()}
      </div>
      <footer className="w-full text-center text-gray-600 mt-4 text-xs">
        A World-Class Senior React Engineer's implementation of 'Terminal Dungeon'.
      </footer>
    </div>
  );
};

export default App;