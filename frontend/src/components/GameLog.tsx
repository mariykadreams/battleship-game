export interface LogEntry {
  timestamp: string;
  message: string;
}

interface GameLogProps {
  entries: LogEntry[];
  title?: string;
}

export function GameLog({ entries, title = 'Game Log' }: GameLogProps) {
  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
      <div className="bg-indigo-900 rounded-xl border-2 border-yellow-500/80 text-indigo-50 max-h-48 overflow-y-auto p-4 shadow-inner">
        {entries.length === 0 ? (
          <p className="text-sm text-indigo-100">Game messages will appear here as you play.</p>
        ) : (
          <ul className="space-y-1 text-sm font-mono">
            {entries.map((entry, index) => (
              <li key={`${entry.timestamp}-${index}`} className="whitespace-pre-wrap">
                <span className="opacity-80 mr-2">[{entry.timestamp}]</span>
                <span>{entry.message}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}


