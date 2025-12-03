import { useState, useEffect, useRef, useCallback } from 'react';
import Swal from 'sweetalert2';
import type { PlayerViewResponse, Coordinate } from '../types/api';
import { PlayerBoards } from './PlayerBoards';
import { BoardLegend } from './BoardLegend';

interface GameBoardProps {
  playerId: string;
  gameId: string;
  onAttack: (gameId: string, playerId: string, target: Coordinate) => Promise<void>;
  onRefreshView: (gameId: string, playerId: string) => Promise<PlayerViewResponse>;
}

export function GameBoard({ playerId, gameId, onAttack, onRefreshView }: GameBoardProps) {
  const [view, setView] = useState<PlayerViewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [attacking, setAttacking] = useState(false);
  const lastWinnerRef = useRef<string | null>(null);
  const attackInProgressRef = useRef(false);

  const loadView = useCallback(async () => {
    try {
      setLoading(true);
      const playerView = await onRefreshView(gameId, playerId);
      setView(playerView);
      // Log for debugging
      console.log('View loaded:', {
        propPlayerId: playerId,
        viewSelfPlayerId: playerView.self.playerId,
        currentPlayerId: playerView.currentPlayerId,
        isMyTurn: playerView.currentPlayerId === playerView.self.playerId
      });
      // If the loaded view's playerId doesn't match the prop, log a warning
      if (playerView.self.playerId !== playerId) {
        console.warn(`Player ID mismatch: prop=${playerId}, view=${playerView.self.playerId}`);
      }
    } catch (error) {
      console.error('Failed to load game view:', error);
      alert(`Failed to load game view: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }, [gameId, playerId, onRefreshView]);

  useEffect(() => {
    // Immediately load view when component mounts or dependencies change
    // loadView depends on gameId, playerId, and onRefreshView, so it will reload
    // when any of these change (including when playerId changes after an attack)
    loadView();
    // Set up polling to refresh view every 2 seconds to catch state changes
    const interval = setInterval(loadView, 2000);
    return () => clearInterval(interval);
  }, [loadView]);

  // Show winner notification once when the game ends
  useEffect(() => {
    if (!view) return;
    const winnerId = view.winnerPlayerId;
    if (winnerId && lastWinnerRef.current !== winnerId) {
      lastWinnerRef.current = winnerId;
      // Use view.self.playerId to determine if this player won
      const winnerName =
        winnerId === view.self.playerId ? view.self.displayName : view.opponent.displayName;
      Swal.fire({
        title: `${winnerName} win`,
        icon: 'success',
        confirmButtonText: 'OK',
      });
    }
  }, [view, playerId]);

  const handleAttack = async (row: number, col: number) => {
    // Prevent double-attacks
    if (!view || attacking || attackInProgressRef.current) {
      return;
    }

    // CRITICAL: Use view.self.playerId (the player whose view we're looking at)
    // We can only attack if it's this player's turn (view.currentPlayerId === view.self.playerId)
    const attackingPlayerId = view.self.playerId;
    
    if (!attackingPlayerId) {
      Swal.fire({
        title: 'Error',
        text: 'Unable to determine player ID. Please refresh the game.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
      return;
    }

    // Double-check that it's still this player's turn (view might be stale)
    if (view.currentPlayerId !== view.self.playerId) {
      Swal.fire({
        title: "Not Your Turn",
        text: `It's ${view.opponent.displayName}'s turn, not yours!`,
        icon: 'warning',
        confirmButtonText: 'OK',
      });
      return;
    }

    // Debug log to help trace mismatches between client and server
    // eslint-disable-next-line no-console
    console.log('Attack requested', { 
      gameId, 
      attackingPlayerId: view.self.playerId, 
      serverCurrentPlayerId: view.currentPlayerId, 
      propPlayerId: playerId,
      isMyTurn: view.currentPlayerId === view.self.playerId,
      clicked: { row, col } 
    });

    const alreadyHit = view.opponent.hits.some((h) => h.row === row && h.column === col);
    const alreadyMissed = view.opponent.misses.some((m) => m.row === row && m.column === col);
    if (alreadyHit || alreadyMissed) {
      Swal.fire({
        title: 'Invalid target',
        text: 'This coordinate has already been targeted.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
      return;
    }

    try {
      // Set both state and ref to prevent double-attacks
      setAttacking(true);
      attackInProgressRef.current = true;
      
      // Use view.self.playerId - the player whose view we're looking at
      // We've already verified that view.currentPlayerId === view.self.playerId above
      await onAttack(gameId, attackingPlayerId, { row, column: col });
      
      // Immediately refresh the view to get the updated game state
      // This ensures the next attack will use the correct player
      await loadView();
      
      // Small delay to ensure state is fully updated
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error('Attack error details:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error message:', errorMessage);
      Swal.fire({
        title: 'Attack Failed',
        text: errorMessage,
        icon: 'error',
        confirmButtonText: 'OK',
      });
      // Reload view even on error to get latest state
      await loadView();
    } finally {
      setAttacking(false);
      attackInProgressRef.current = false;
    }
  };

  if (loading && !view) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-purple-600">
        <div className="text-center text-white text-2xl">Loading game...</div>
      </div>
    );
  }

  if (!view) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-purple-600">
        <div className="bg-white p-8 rounded-lg text-red-500 text-xl">Failed to load game view</div>
      </div>
    );
  }

  // Use view.self.playerId to ensure we're comparing with the actual player from the server
  const isMyTurn = view.currentPlayerId === view.self.playerId;
  const gameOver = view.winnerPlayerId !== null && view.winnerPlayerId !== undefined;

  // Use view.self.playerId to determine the winner name
  const winnerName =
    gameOver && view.winnerPlayerId
      ? view.winnerPlayerId === view.self.playerId
        ? view.self.displayName
        : view.opponent.displayName
      : null;

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-indigo-500 via-purple-500 to-purple-600">
      <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-7xl w-full">
        <div className="text-center mb-8">
          <h2 className="text-gray-800 mb-4 text-4xl font-bold">Battleship Game</h2>
          {gameOver ? (
            <div className="mt-4">
              <h3 className="text-3xl font-bold text-green-600 p-4 bg-green-50 rounded-lg inline-block">
                {winnerName} win
              </h3>
            </div>
          ) : (
            <div className="mt-4">
              {isMyTurn ? (
                <p className="text-xl font-semibold text-indigo-600 p-4 bg-indigo-50 rounded-lg inline-block">
                  Your Turn - Attack {view.opponent.displayName}'s Board
                </p>
              ) : (
                <p className="text-xl font-semibold text-gray-600 p-4 bg-gray-100 rounded-lg inline-block">
                  Waiting for {view.opponent.displayName}...
                </p>
              )}
            </div>
          )}
        </div>

        <PlayerBoards
          view={view}
          isMyTurn={isMyTurn}
          gameOver={gameOver}
          attacking={attacking}
          onAttack={handleAttack}
        />

        <BoardLegend showShips />
      </div>
    </div>
  );
}


