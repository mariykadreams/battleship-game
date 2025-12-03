import { useEffect } from 'react';

/**
 * Reset all placement state when player changes
 */
export function useResetShipPlacementOnPlayerChange(
  playerId: string,
  onReset: () => void
) {
  useEffect(() => {
    onReset();
  }, [playerId, onReset]);
}
