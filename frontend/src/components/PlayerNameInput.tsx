import { useState } from 'react';

interface PlayerNameInputProps {
  onNext: (playerOneName: string, playerTwoName: string) => void;
}

export function PlayerNameInput({ onNext }: PlayerNameInputProps) {
  const [playerOneName, setPlayerOneName] = useState('');
  const [playerTwoName, setPlayerTwoName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerOneName.trim() && playerTwoName.trim()) {
      onNext(playerOneName.trim(), playerTwoName.trim());
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-indigo-500 via-purple-500 to-purple-600">
      <div className="bg-white p-12 rounded-2xl shadow-2xl max-w-md w-full">
        <h1 className="text-gray-800 mb-8 text-4xl font-bold text-center">Battleship Game</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label htmlFor="player1" className="font-semibold text-gray-700 text-lg">
              Player 1 Name:
            </label>
            <input
              id="player1"
              type="text"
              value={playerOneName}
              onChange={(e) => setPlayerOneName(e.target.value)}
              placeholder="Enter Player 1 name"
              required
              className="px-4 py-3 border-2 border-gray-300 rounded-lg text-base focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="player2" className="font-semibold text-gray-700 text-lg">
              Player 2 Name:
            </label>
            <input
              id="player2"
              type="text"
              value={playerTwoName}
              onChange={(e) => setPlayerTwoName(e.target.value)}
              placeholder="Enter Player 2 name"
              required
              className="px-4 py-3 border-2 border-gray-300 rounded-lg text-base focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
          <button
            type="submit"
            className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-none py-4 px-8 text-lg font-semibold rounded-lg cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-lg mt-4"
          >
            Next
          </button>
        </form>
      </div>
    </div>
  );
}
