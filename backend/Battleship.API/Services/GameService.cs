using System.Collections.Concurrent;
using Battleship.API.Models;
using Battleship.API.Services.Results;

namespace Battleship.API.Services;

public sealed class GameService : IGameService
{
    private readonly ConcurrentDictionary<Guid, GameState> _games = new();

    public GameState CreateGame(string playerOneName, string playerTwoName)
    {
        var game = new GameState(playerOneName, playerTwoName);
        if (!_games.TryAdd(game.Id, game))
        {
            throw new InvalidOperationException("Unable to create a new game.");
        }

        return game;
    }

    public GameState GetGame(Guid gameId)
    {
        if (_games.TryGetValue(gameId, out var game))
        {
            return game;
        }

        throw new KeyNotFoundException("Game not found.");
    }

    public PlayerView GetPlayerView(Guid gameId, string playerId)
    {
        var game = GetGame(gameId);
        lock (game.SyncRoot)
        {
            var player = game.GetPlayer(playerId);
            var opponent = game.GetOpponent(playerId);

            var selfSnapshot = new PlayerBoardSnapshot(player);
            var opponentSnapshot = new PlayerBoardSnapshot(opponent, includeShips: false);

            return new PlayerView(game.Id, selfSnapshot, opponentSnapshot, game.CurrentPlayerId, game.WinnerPlayerId, game.IsStarted);
        }
    }

    public GameState PlaceShips(Guid gameId, string playerId, IEnumerable<ShipPlacement> placements)
    {
        var game = GetGame(gameId);
        var placementList = placements.ToList();

        lock (game.SyncRoot)
        {
            var player = game.GetPlayer(playerId);
            if (game.IsStarted)
            {
                throw new InvalidOperationException("Cannot place ships after the game has started.");
            }

            player.Board.PlaceFleet(placementList);
            return game;
        }
    }

    public GameState StartGame(Guid gameId, string? startingPlayerId = null)
    {
        var game = GetGame(gameId);
        lock (game.SyncRoot)
        {
            game.Start(startingPlayerId);
            return game;
        }
    }

    public AttackResult Attack(Guid gameId, string playerId, Coordinate target)
    {
        var game = GetGame(gameId);
        lock (game.SyncRoot)
        {
            if (!game.IsStarted)
            {
                throw new InvalidOperationException("Game has not started yet.");
            }

            if (game.WinnerPlayerId is not null)
            {
                throw new InvalidOperationException("Game is already finished.");
            }

            if (game.CurrentPlayerId != playerId)
            {
                // Provide more context in the exception to aid debugging (expected vs actual)
                var expected = game.CurrentPlayerId ?? "(null)";
                var actual = playerId ?? "(null)";
                throw new InvalidOperationException($"It is not this player's turn. ExpectedCurrent='{expected}', IncomingPlayer='{actual}', GameId='{game.Id}'");
            }

            var attacker = game.GetPlayer(playerId);
            var defender = game.GetOpponent(playerId);

            var outcome = defender.Board.ResolveAttack(target);

            if (defender.Board.AllShipsSunk)
            {
                game.MarkWinner(attacker.Id);
            }
            else
            {
                game.CurrentPlayerId = defender.Id;
            }

            return new AttackResult(game, attacker, defender, outcome);
        }
    }
}

