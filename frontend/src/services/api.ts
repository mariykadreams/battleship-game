import type {
  CreateGameRequest,
  GameStateResponse,
  PlaceShipsRequest,
  PlayerViewResponse,
  AttackRequest,
  AttackResponse,
} from '../types/api';

// Use HTTPS for backend (matches launchSettings.json https profile)
// Note: You may need to accept the self-signed certificate in your browser
// If you get certificate errors, you can temporarily use HTTP: 'http://localhost:5212/api/games'
const API_BASE_URL = 'https://localhost:7122/api/games';

// Helper function to handle fetch with error handling
async function fetchWithErrorHandling(url: string, options?: RequestInit): Promise<Response> {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error [${response.status}]:`, errorText);
      // Try to parse as JSON for better error messages
      let errorMessage = errorText;
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.message || errorJson.title || errorText;
      } catch {
        // Not JSON, use the text as is
      }
      throw new Error(`Request failed (${response.status}): ${errorMessage}`);
    }
    return response;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      throw new Error(
        'Failed to connect to the backend. Make sure the backend is running and you have accepted the SSL certificate if using HTTPS.'
      );
    }
    throw error;
  }
}

export class ApiService {
  static async createGame(request: CreateGameRequest): Promise<GameStateResponse> {
    const response = await fetchWithErrorHandling(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    return response.json();
  }

  static async getGame(gameId: string): Promise<GameStateResponse> {
    const response = await fetchWithErrorHandling(`${API_BASE_URL}/${gameId}`);
    return response.json();
  }

  static async getPlayerView(gameId: string, playerId: string): Promise<PlayerViewResponse> {
    const response = await fetchWithErrorHandling(`${API_BASE_URL}/${gameId}/players/${playerId}`);
    return response.json();
  }

  static async placeShips(gameId: string, request: PlaceShipsRequest): Promise<GameStateResponse> {
    const response = await fetchWithErrorHandling(`${API_BASE_URL}/${gameId}/ships`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    return response.json();
  }

  static async startGame(gameId: string, startingPlayerId?: string): Promise<GameStateResponse> {
    const response = await fetchWithErrorHandling(`${API_BASE_URL}/${gameId}/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(startingPlayerId ? { startingPlayerId } : {}),
    });

    return response.json();
  }

  static async attack(gameId: string, request: AttackRequest): Promise<AttackResponse> {
    console.log('Sending attack request:', { gameId, request });
    const response = await fetchWithErrorHandling(`${API_BASE_URL}/${gameId}/attacks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    const result = await response.json();
    console.log('Attack response:', result);
    return result;
  }
}
