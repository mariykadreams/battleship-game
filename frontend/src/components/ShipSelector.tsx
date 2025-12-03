interface ShipSelectorProps {
  requiredFleet: number[];
  selectedShipIndex: number | null;
  placedIndices: Set<number>;
  onSelectShip: (index: number) => void;
}

export function ShipSelector({
  requiredFleet,
  selectedShipIndex,
  placedIndices,
  onSelectShip,
}: ShipSelectorProps) {
  return (
    <div className="flex-1 min-w-[300px]">
      <h3 className="text-gray-600 mb-4 text-xl font-semibold">Select Ship to Place:</h3>
      <div className="flex flex-col gap-3">
        {requiredFleet.map((size, index) => {
          const isPlaced = placedIndices.has(index);
          return (
            <button
              key={index}
              type="button"
              className={`px-4 py-3 border-2 rounded-lg text-base text-left transition-all ${
                selectedShipIndex === index
                  ? 'border-indigo-500 bg-indigo-500 text-white'
                  : isPlaced
                  ? 'bg-green-50 border-green-500 text-green-700 opacity-60 cursor-not-allowed'
                  : 'border-gray-300 bg-white hover:border-indigo-500 hover:bg-indigo-50'
              }`}
              onClick={() => {
                if (!isPlaced) {
                  onSelectShip(index);
                }
              }}
              disabled={isPlaced}
            >
              Ship {index + 1} (Size: {size}) {isPlaced ? '✓' : ''}
            </button>
          );
        })}
      </div>
    </div>
  );
}
