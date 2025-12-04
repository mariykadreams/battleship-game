import { useState, useEffect, useRef, useCallback } from 'react';
import Swal from 'sweetalert2';
import type { PlayerViewResponse, Coordinate, AttackResponse } from '../types/api';
import { PlayerBoards } from './PlayerBoards';
import { BoardLegend } from './BoardLegend';
import { GameLog } from './GameLog';

import type { LogEntry } from './GameLog';

interface GameBoardProps {
  playerId: string;
  gameId: string;
  onAttack: (gameId: string, playerId: string, target: Coordinate) => Promise<AttackResponse>;
  onRefreshView: (gameId: string, playerId: string) => Promise<PlayerViewResponse>;
}

export function GameBoard({ playerId, gameId, onAttack, onRefreshView }: GameBoardProps) {
  const [view, setView] = useState<PlayerViewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [attacking, setAttacking] = useState(false);
  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);
  const lastWinnerRef = useRef<string | null>(null);
  const attackInProgressRef = useRef(false);
  const lastCurrentPlayerIdRef = useRef<string | null>(null);
  const initialisedLogRef = useRef(false);

  // Append a new text entry to the game log (only latest 100 messages)
  const addLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogEntries((prev) => {
      const next = [...prev, { timestamp, message }];
      if (next.length > 100) {
        return next.slice(next.length - 100);
      }
      return next;
    });
  }, []);

  const loadView = useCallback(async () => {
    try {
      setLoading(true);
      const playerView = await onRefreshView(gameId, playerId);
      setView(playerView);
      console.log('View loaded:', {
        propPlayerId: playerId,
        viewSelfPlayerId: playerView.self.playerId,
        currentPlayerId: playerView.currentPlayerId,
        isMyTurn: playerView.currentPlayerId === playerView.self.playerId
      });
      if (playerView.self.playerId !== playerId) {
        console.warn(`Player ID mismatch: prop=${playerId}, view=${playerView.self.playerId}`);
      }

      if (!initialisedLogRef.current) {
        addLog('Welcome to Battleship!');
        initialisedLogRef.current = true;
      }
      if (!playerView.currentPlayerId) {
        addLog('Waiting for game to start...');
      }

      if (playerView.currentPlayerId && lastCurrentPlayerIdRef.current !== playerView.currentPlayerId) {
        const isMyTurn = playerView.currentPlayerId === playerView.self.playerId;
        if (isMyTurn) {
          addLog('It is your turn.');
        } else {
          addLog(`Waiting for ${playerView.opponent.displayName} to play...`);
        }
        lastCurrentPlayerIdRef.current = playerView.currentPlayerId;
      }
    } catch (error) {
      console.error('Failed to load game view:', error);
      alert(`Failed to load game view: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }, [gameId, playerId, onRefreshView, addLog]);


  useEffect(() => {
    loadView();
    const interval = setInterval(loadView, 2000);
    return () => clearInterval(interval);
  }, [loadView]);

  useEffect(() => {
    if (!view) return;
    const winnerId = view.winnerPlayerId;
    if (winnerId && lastWinnerRef.current !== winnerId) {
      lastWinnerRef.current = winnerId;
      const winnerName =
        winnerId === view.self.playerId ? view.self.displayName : view.opponent.displayName;
      addLog(`${winnerName} wins the game!`);
      Swal.fire({
        title: `${winnerName} win`,
        icon: 'success',
        confirmButtonText: 'OK',
      });
    }
  }, [view, playerId, addLog]);

  // Handle a single attack on the opponent board, including validation and feedback
  const handleAttack = async (row: number, col: number) => {
    if (!view || attacking || attackInProgressRef.current) {
      return;
    }

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

    if (view.currentPlayerId !== view.self.playerId) {
      Swal.fire({
        title: "Not Your Turn",
        text: `It's ${view.opponent.displayName}'s turn, not yours!`,
        icon: 'warning',
        confirmButtonText: 'OK',
      });
      return;
    }

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
      setAttacking(true);
      attackInProgressRef.current = true;
      
      const attackResult = await onAttack(gameId, attackingPlayerId, { row, column: col });

      // Determine attacker/defender names from the attack result
      const attackerName =
        attackResult.attackerId === view.self.playerId
          ? view.self.displayName
          : view.opponent.displayName;
      const defenderName =
        attackResult.defenderId === view.self.playerId
          ? view.self.displayName
          : view.opponent.displayName;

      addLog(`${attackerName} attacked (${row + 1}, ${col + 1}).`);

      if (attackResult.shipSunk && attackResult.shipSize) {
        addLog(`Ship size ${attackResult.shipSize} of ${defenderName} is destroyed.`);
      }

      await loadView();

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

        <GameLog entries={logEntries} />

        <BoardLegend showShips />
      </div>
    </div>
  );
}


