// API Types matching backend contracts

export interface Coordinate {
  row: number;
  column: number;
}

export interface ShipPlacementRequest {
  size: number;
  start: Coordinate;
  orientation: 'Horizontal' | 'Vertical';
}

export interface CreateGameRequest {
  playerOneName?: string;
  playerTwoName?: string;
}

export interface PlaceShipsRequest {
  playerId: string;
  ships: ShipPlacementRequest[];
}

export interface AttackRequest {
  playerId: string;
  target: Coordinate;
}

export interface ShipResponse {
  size: number;
  isSunk: boolean;
  coordinates: Coordinate[];
}

export interface PlayerBoardResponse {
  playerId: string;
  displayName: string;
  hasPlacedShips: boolean;
  ships: ShipResponse[];
  hits: Coordinate[];
  misses: Coordinate[];
}

export interface GameStateResponse {
  gameId: string;
  isStarted: boolean;
  currentPlayerId?: string;
  winnerPlayerId?: string;
  players: PlayerBoardResponse[];
  createdAtUtc: string;
}

export interface PlayerViewResponse {
  gameId: string;
  playerId: string;
  self: PlayerBoardResponse;
  opponent: PlayerBoardResponse;
  currentPlayerId?: string;
  winnerPlayerId?: string;
  isStarted: boolean;
}

export interface AttackResponse {
  gameId: string;
  attackerId: string;
  defenderId: string;
  target: Coordinate;
  isHit: boolean;
  shipSunk: boolean;
  shipSize?: number;
  winnerPlayerId?: string;
  nextPlayerId?: string;
}

