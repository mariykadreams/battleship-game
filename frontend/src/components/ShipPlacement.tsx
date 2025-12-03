import { useState, useCallback } from 'react';
import Swal from 'sweetalert2';
import type { Coordinate, ShipPlacementRequest } from '../types/api';
import { BoardGrid } from './BoardGrid';
import { BoardCell } from './BoardCell';
import { ShipSelector } from './ShipSelector';
import { OrientationToggle } from './OrientationToggle';
import { PlacedShipsList } from './PlacedShipsList';
import { BoardLegend } from './BoardLegend';
import { useResetShipPlacementOnPlayerChange } from '../hooks/useResetShipPlacementOnPlayerChange';

interface ShipPlacementProps {
  playerName: string;
  playerId: string;
  gameId: string;
  onShipsPlaced: () => void;
  onPlaceShips: (gameId: string, playerId: string, ships: ShipPlacementRequest[]) => Promise<void>;
}

const REQUIRED_FLEET = [5, 4, 3, 3, 2];
const BOARD_SIZE = 10;

export function ShipPlacement({
  playerName,
  playerId,
  gameId,
  onShipsPlaced,
  onPlaceShips,
}: ShipPlacementProps) {
  const [selectedShipIndex, setSelectedShipIndex] = useState<number | null>(0);
  const [orientation, setOrientation] = useState<'Horizontal' | 'Vertical'>('Horizontal');
  const [placedShips, setPlacedShips] = useState<Array<ShipPlacementRequest & { fleetIndex: number }>>([]);
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null);
  const [board, setBoard] = useState<boolean[][]>(
    Array(BOARD_SIZE)
      .fill(null)
      .map(() => Array(BOARD_SIZE).fill(false))
  );

  const resetPlacement = useCallback(() => {
    setSelectedShipIndex(0);
    setOrientation('Horizontal');
    setPlacedShips([]);
    setHoveredCell(null);
    setBoard(Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(false)));
  }, []);

  useResetShipPlacementOnPlayerChange(playerId, resetPlacement);

  const getShipCoordinates = useCallback(
    (row: number, col: number, size: number, orient: 'Horizontal' | 'Vertical'): Coordinate[] => {
      const coords: Coordinate[] = [];
      for (let i = 0; i < size; i++) {
        if (orient === 'Horizontal') {
          coords.push({ row, column: col + i });
        } else {
          coords.push({ row: row + i, column: col });
        }
      }
      return coords;
    },
    []
  );

  const isValidPlacement = useCallback(
    (row: number, col: number, size: number, orient: 'Horizontal' | 'Vertical'): boolean => {
      if (orient === 'Horizontal' && col + size > BOARD_SIZE) return false;
      if (orient === 'Vertical' && row + size > BOARD_SIZE) return false;

      const coords = getShipCoordinates(row, col, size, orient);
      for (const coord of coords) {
        if (board[coord.row][coord.column]) return false;
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = coord.row + dr;
            const nc = coord.column + dc;
            if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE) {
              if (board[nr][nc]) return false;
            }
          }
        }
      }
      return true;
    },
    [board, getShipCoordinates]
  );

  const handleCellClick = (row: number, col: number) => {
    if (selectedShipIndex === null) return;

    const shipSize = REQUIRED_FLEET[selectedShipIndex];
    if (!isValidPlacement(row, col, shipSize, orientation)) {
      Swal.fire({
        title: 'Invalid placement',
        text: 'Ships cannot overlap or be adjacent.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
      return;
    }

    const newShip: ShipPlacementRequest & { fleetIndex: number } = {
      size: shipSize,
      start: { row, column: col },
      orientation,
      fleetIndex: selectedShipIndex,
    };

    const newPlacedShips = [...placedShips, newShip];
    setPlacedShips(newPlacedShips);

    const newBoard = board.map((r) => [...r]);
    const coords = getShipCoordinates(row, col, shipSize, orientation);
    for (const coord of coords) {
      newBoard[coord.row][coord.column] = true;
    }
    setBoard(newBoard);

    const placedIndices = new Set(newPlacedShips.map((s) => s.fleetIndex));
    const nextIndex = REQUIRED_FLEET.findIndex((_, idx) => !placedIndices.has(idx));
    if (nextIndex !== -1) {
      setSelectedShipIndex(nextIndex);
    } else {
      setSelectedShipIndex(null);
    }
  };

  const handleRemoveShip = (index: number) => {
    const ship = placedShips[index];
    const newPlacedShips = placedShips.filter((_, i) => i !== index);
    setPlacedShips(newPlacedShips);

    const newBoard = board.map((r) => [...r]);
    const coords = getShipCoordinates(
      ship.start.row,
      ship.start.column,
      ship.size,
      ship.orientation
    );
    for (const coord of coords) {
      newBoard[coord.row][coord.column] = false;
    }
    setBoard(newBoard);

    setSelectedShipIndex(ship.fleetIndex);
  };

  const handleSubmit = async () => {
    if (placedShips.length !== REQUIRED_FLEET.length) {
      await Swal.fire({
        title: 'Place all ships',
        text: `Please place all ${REQUIRED_FLEET.length} ships before continuing.`,
        icon: 'info',
        confirmButtonText: 'OK',
      });
      return;
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const shipsToSend: ShipPlacementRequest[] = placedShips.map(({ fleetIndex: _fleetIndex, ...ship }) => ship);
      await onPlaceShips(gameId, playerId, shipsToSend);
      onShipsPlaced();
    } catch (error) {
      alert(`Failed to place ships: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const getPreviewCoords = (row: number, col: number): Coordinate[] => {
    if (selectedShipIndex === null) return [];
    const shipSize = REQUIRED_FLEET[selectedShipIndex];
    return getShipCoordinates(row, col, shipSize, orientation);
  };

  const placedIndices = new Set(placedShips.map((s) => s.fleetIndex));

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-indigo-500 via-purple-500 to-purple-600">
      <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-6xl w-full">
        <h2 className="text-gray-800 mb-8 text-3xl font-bold text-center">
          {playerName}'s Turn - Place Your Ships
        </h2>

        <div className="flex gap-8 mb-8 flex-wrap">
          <ShipSelector
            requiredFleet={REQUIRED_FLEET}
            selectedShipIndex={selectedShipIndex}
            placedIndices={placedIndices}
            onSelectShip={setSelectedShipIndex}
          />
          <OrientationToggle
            orientation={orientation}
            onOrientationChange={setOrientation}
          />
        </div>

        <div className="flex justify-center mb-8">
          <BoardGrid
            boardSize={BOARD_SIZE}
            onCellClick={handleCellClick}
            onCellHover={(row, col) => setHoveredCell({ row, col })}
            onCellLeave={() => setHoveredCell(null)}
            renderCell={(row, col) => {
              const isPlaced = board[row][col];
              let isPreview = false;
              let isValid = false;

              if (hoveredCell && selectedShipIndex !== null) {
                const previewCoords = getPreviewCoords(hoveredCell.row, hoveredCell.col);
                isPreview = previewCoords.some((c) => c.row === row && c.column === col);
                if (isPreview) {
                  isValid = isValidPlacement(
                    hoveredCell.row,
                    hoveredCell.col,
                    REQUIRED_FLEET[selectedShipIndex],
                    orientation
                  );
                }
              }

              return (
                <BoardCell
                  row={row}
                  col={col}
                  state={
                    isPlaced
                      ? 'ship'
                      : isPreview
                      ? isValid
                        ? 'empty'
                        : 'empty'
                      : 'empty'
                  }
                  isOpponent={false}
                  canAttack={false}
                  onClick={() => {}}
                  onMouseEnter={() => {}}
                  onMouseLeave={() => {}}
                  isPreview={isPreview}
                  isValidPreview={isValid}
                />
              );
            }}
          />
        </div>

        <PlacedShipsList placedShips={placedShips} onRemoveShip={handleRemoveShip} />

        <button
          type="button"
          className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-none py-4 px-8 text-lg font-semibold rounded-lg cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
          onClick={handleSubmit}
          disabled={placedShips.length !== REQUIRED_FLEET.length}
        >
          Confirm Ship Placement
        </button>

        <div className="mt-6">
          <BoardLegend showShips={false} />
        </div>
      </div>
    </div>
  );
}
