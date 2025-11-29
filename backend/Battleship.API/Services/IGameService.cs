using Battleship.API.Models;
using Battleship.API.Services.Results;

namespace Battleship.API.Services;

public interface IGameService
{
    GameState CreateGame(string playerOneName, string playerTwoName);
    GameState GetGame(Guid gameId);
    PlayerView GetPlayerView(Guid gameId, string playerId);
    GameState PlaceShips(Guid gameId, string playerId, IEnumerable<ShipPlacement> placements);
    GameState StartGame(Guid gameId, string? startingPlayerId = null);
    AttackResult Attack(Guid gameId, string playerId, Coordinate target);
}

