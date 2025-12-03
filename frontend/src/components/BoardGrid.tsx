interface BoardGridProps {
  boardSize: number;
  onCellClick: (row: number, col: number) => void;
  onCellHover: (row: number, col: number) => void;
  onCellLeave: () => void;
  renderCell: (row: number, col: number) => React.ReactNode;
}

export function BoardGrid({
  boardSize,
  onCellClick,
  onCellHover,
  onCellLeave,
  renderCell,
}: BoardGridProps) {
  return (
    <div className="inline-block border-4 border-gray-800 bg-blue-100 p-1">
      {Array(boardSize)
        .fill(null)
        .map((_, row) => (
          <div key={row} className="flex">
            {Array(boardSize)
              .fill(null)
              .map((_, col) => (
                <div
                  key={col}
                  onClick={() => onCellClick(row, col)}
                  onMouseEnter={() => onCellHover(row, col)}
                  onMouseLeave={onCellLeave}
                  role="button"
                  tabIndex={-1}
                >
                  {renderCell(row, col)}
                </div>
              ))}
          </div>
        ))}
    </div>
  );
}
