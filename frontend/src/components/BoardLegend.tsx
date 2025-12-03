interface BoardLegendProps {
  showShips?: boolean;
}

export function BoardLegend({ showShips = true }: BoardLegendProps) {
  return (
    <div className="flex justify-center gap-8 flex-wrap p-4 bg-gray-100 rounded-lg">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 border border-blue-400 bg-blue-100"></div>
        <span className="text-gray-700 font-medium">Empty</span>
      </div>
      {showShips && (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 border border-green-700 bg-green-500"></div>
          <span className="text-gray-700 font-medium">Your Ship</span>
        </div>
      )}
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 border border-red-700 bg-red-500 relative flex items-center justify-center">
          <span className="text-white text-xs font-bold">✕</span>
        </div>
        <span className="text-gray-700 font-medium">Hit</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 border border-blue-500 bg-blue-300 relative flex items-center justify-center">
          <span className="text-blue-700 text-xs">○</span>
        </div>
        <span className="text-gray-700 font-medium">Miss</span>
      </div>
    </div>
  );
}
