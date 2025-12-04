import { useState, useEffect } from 'react';
import { PlayerNameInput } from './components/PlayerNameInput';
import { ShipPlacement } from './components/ShipPlacement';
import { GameBoard } from './components/GameBoard';
import { ApiService } from './services/api';
import type {
  GameStateResponse,
  PlaceShipsRequest,
  Coordinate,
  PlayerViewResponse,
  AttackResponse,
} from './types/api';

type GamePhase = 'names' | 'placement-player1' | 'placement-player2' | 'playing';

function App() {
  const [phase, setPhase] = useState<GamePhase>('names');
  const [gameState, setGameState] = useState<GameStateResponse | null>(null);
  const [currentPlayerId, setCurrentPlayerId] = useState<string>('');

  const handleNamesSubmit = async (p1Name: string, p2Name: string) => {
    try {
      const game = await ApiService.createGame({
        playerOneName: p1Name,
        playerTwoName: p2Name,
      });
      setGameState(game);
      setCurrentPlayerId(game.players[0]?.playerId || '');
      setPhase('placement-player1');
    } catch (error) {
      alert(`Failed to create game: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleShipsPlaced = async () => {
    if (!gameState) return;

    try {
      const updatedGame = await ApiService.getGame(gameState.gameId);
      setGameState(updatedGame);

      const bothPlaced = updatedGame.players.every((p) => p.hasPlacedShips);

      if (bothPlaced) {
        const startedGame = await ApiService.startGame(updatedGame.gameId);
        setGameState(startedGame);
        setPhase('playing');
      } else {
        if (phase === 'placement-player1') {
          const player2 = updatedGame.players.find((p) => p.playerId !== currentPlayerId);
          if (player2) {
            setCurrentPlayerId(player2.playerId);
            setPhase('placement-player2');
          }
        } else {
          const startedGame = await ApiService.startGame(updatedGame.gameId);
          setGameState(startedGame);
          setPhase('playing');
        }
      }
    } catch (error) {
      alert(`Failed to proceed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handlePlaceShips = async (
    gameId: string,
    playerId: string,
    ships: PlaceShipsRequest['ships']
  ) => {
    await ApiService.placeShips(gameId, {
      playerId,
      ships,
    });
  };

  const handleAttack = async (
    gameId: string,
    playerId: string,
    target: Coordinate
  ): Promise<AttackResponse> => {
    const attackResponse = await ApiService.attack(gameId, {
      playerId,
      target,
    });

    const updatedGame = await ApiService.getGame(gameId);
    setGameState(updatedGame);

    console.log('Attack completed, turn switched to:', updatedGame.currentPlayerId);

    return attackResponse;
  };

  const handleRefreshView = async (gameId: string, playerId: string): Promise<PlayerViewResponse> => {
    return await ApiService.getPlayerView(gameId, playerId);
  };

  // During gameplay, periodically refresh the game state so turns stay in sync
  useEffect(() => {
    if (phase === 'playing' && gameState?.gameId) {
      const interval = setInterval(async () => {
        try {
          const updatedGame = await ApiService.getGame(gameState.gameId);
          setGameState(updatedGame);
        } catch (error) {
          console.error('Failed to refresh game state:', error);
        }
      }, 3000); // Refresh every 3 seconds
      return () => clearInterval(interval);
    }
  }, [phase, gameState?.gameId]);

  if (!gameState) {
    return (
      <div className="app">
        <PlayerNameInput onNext={handleNamesSubmit} />
      </div>
    );
  }

  const currentPlayer = gameState.players.find((p) => p.playerId === currentPlayerId);

  if (phase === 'placement-player1' || phase === 'placement-player2') {
    return (
      <div className="app">
        <ShipPlacement
          playerName={currentPlayer?.displayName || ''}
          playerId={currentPlayerId}
          gameId={gameState.gameId}
          onShipsPlaced={handleShipsPlaced}
          onPlaceShips={handlePlaceShips}
        />
      </div>
    );
  }

  if (phase === 'playing') {

    if (!gameState.currentPlayerId) {
      return (
        <div className="app">
          <div>Waiting for game to start...</div>
        </div>
      );
    }
    
    return (
      <div className="app">
        <GameBoard
          playerId={gameState.currentPlayerId}
          gameId={gameState.gameId}
          onAttack={handleAttack}
          onRefreshView={handleRefreshView}
        />
      </div>
    );
  }

  return null;
}

export default App;
