interface BoardCellProps {
  row: number;
  col: number;
  state: 'empty' | 'ship' | 'hit' | 'miss';
  isOpponent: boolean;
  canAttack: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  isPreview?: boolean;
  isValidPreview?: boolean;
  title?: string;
}

export function BoardCell({
  state,
  canAttack,
  onClick,
  onMouseEnter,
  onMouseLeave,
  isPreview,
  isValidPreview,
  title,
}: BoardCellProps) {
  let bgColor = 'bg-blue-100';
  let borderColor = 'border-blue-400';
  let cursor = 'cursor-default';
  let content = null;

  if (isPreview) {
    bgColor = isValidPreview ? 'bg-green-300' : 'bg-red-300';
    borderColor = isValidPreview ? 'border-green-500' : 'border-red-500';
  } else if (state === 'ship') {
    bgColor = 'bg-green-500';
    borderColor = 'border-green-700';
  } else if (state === 'hit') {
    bgColor = 'bg-red-500';
    borderColor = 'border-red-700';
    content = <span className="text-white text-xl font-bold">✕</span>;
  } else if (state === 'miss') {
    bgColor = 'bg-blue-300';
    borderColor = 'border-blue-500';
    content = <span className="text-blue-700 text-base">○</span>;
  } else if (canAttack) {
    cursor = 'cursor-crosshair hover:bg-yellow-200 hover:border-yellow-400';
  }

  return (
    <div
      className={`w-9 h-9 border transition-all relative flex items-center justify-center ${bgColor} ${borderColor} ${cursor}`}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      title={title}
    >
      {content}
    </div>
  );
}
