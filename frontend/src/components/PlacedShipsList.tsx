import type { ShipPlacementRequest } from '../types/api';

interface PlacedShipsListProps {
  placedShips: Array<ShipPlacementRequest & { fleetIndex: number }>;
  onRemoveShip: (index: number) => void;
}

export function PlacedShipsList({ placedShips, onRemoveShip }: PlacedShipsListProps) {
  return (
    <div className="mt-8 p-4 bg-gray-100 rounded-lg mb-6">
      <h3 className="text-gray-600 mb-4 font-semibold">Placed Ships:</h3>
      {placedShips.length === 0 ? (
        <p className="text-gray-500">No ships placed yet</p>
      ) : (
        <ul className="list-none p-0 flex flex-col gap-2">
          {placedShips.map((ship, index) => (
            <li
              key={index}
              className="flex justify-between items-center p-2 bg-white rounded"
            >
              <span className="text-gray-700">
                Ship {index + 1} (Size: {ship.size}) at ({ship.start.row}, {ship.start.column}) {ship.orientation}
              </span>
              <button
                type="button"
                onClick={() => onRemoveShip(index)}
                className="px-3 py-1 bg-red-500 text-white border-none rounded cursor-pointer text-sm hover:bg-red-600 transition-colors"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
