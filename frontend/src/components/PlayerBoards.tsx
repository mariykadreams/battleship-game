import type { PlayerViewResponse } from '../types/api';
import { BoardGrid } from './BoardGrid';
import { BoardCell } from './BoardCell';

const BOARD_SIZE = 10;

interface PlayerBoardsProps {
  view: PlayerViewResponse;
  isMyTurn: boolean;
  gameOver: boolean;
  attacking: boolean;
  onAttack: (row: number, col: number) => void;
}

export function PlayerBoards({
  view,
  isMyTurn,
  gameOver,
  attacking,
  onAttack,
}: PlayerBoardsProps) {
  const getCellState = (
    row: number,
    col: number,
    board: PlayerViewResponse['self'] | PlayerViewResponse['opponent'],
    isOpponent: boolean,
  ): string => {
    const isHit = board.hits.some((h) => h.row === row && h.column === col);
    const isMiss = board.misses.some((m) => m.row === row && m.column === col);
    const hasShip = board.ships.some((ship) =>
      ship.coordinates.some((c) => c.row === row && c.column === col),
    );

    if (isHit) {
      return 'hit';
    }
    if (isMiss) {
      return 'miss';
    }
    if (!isOpponent && hasShip) {
      return 'ship';
    }
    return 'empty';
  };

  return (
    <div className="flex gap-12 justify-center flex-wrap mb-8">
      {/* Your Board */}
      <div className="flex flex-col items-center">
        <h3 className="text-gray-600 mb-4 text-xl font-semibold">
          Your Board ({view.self.displayName})
        </h3>
        <BoardGrid
          boardSize={BOARD_SIZE}
          onCellClick={() => {}}
          onCellHover={() => {}}
          onCellLeave={() => {}}
          renderCell={(row, col) => {
            const state = getCellState(row, col, view.self, false);
            return (
              <BoardCell
                row={row}
                col={col}
                state={state as 'empty' | 'ship' | 'hit' | 'miss'}
                isOpponent={false}
                canAttack={false}
                onClick={() => {}}
                onMouseEnter={() => {}}
                onMouseLeave={() => {}}
                title={`${row}, ${col}`}
              />
            );
          }}
        />
      </div>

      {/* Opponent Board */}
      <div className="flex flex-col items-center">
        <h3 className="text-gray-600 mb-4 text-xl font-semibold">
          Opponent's Board ({view.opponent.displayName})
        </h3>
        <BoardGrid
          boardSize={BOARD_SIZE}
          onCellClick={(row, col) => {
            if (isMyTurn && !gameOver && !attacking) {
              const state = getCellState(row, col, view.opponent, true);
              if (state === 'empty') {
                onAttack(row, col);
              }
            }
          }}
          onCellHover={() => {}}
          onCellLeave={() => {}}
          renderCell={(row, col) => {
            const state = getCellState(row, col, view.opponent, true);
            const canAttack = !gameOver && isMyTurn && state === 'empty' && !attacking;
            const isHit = state === 'hit';
            const isMiss = state === 'miss';

            return (
              <BoardCell
                row={row}
                col={col}
                state={state as 'empty' | 'ship' | 'hit' | 'miss'}
                isOpponent
                canAttack={canAttack}
                onClick={() => onAttack(row, col)}
                onMouseEnter={() => {}}
                onMouseLeave={() => {}}
                title={`${row}, ${col}${isHit ? ' - HIT!' : isMiss ? ' - Miss' : ''}`}
              />
            );
          }}
        />
      </div>
    </div>
  );
}
