using Battleship.API.Contracts.Responses;
using Battleship.API.Models;
using Battleship.API.Services.Results;

namespace Battleship.API.Contracts.Mapping;

public static class GameMappers
{
    public static GameStateResponse ToResponse(this GameState game) =>
        new()
        {
            GameId = game.Id,
            IsStarted = game.IsStarted,
            CurrentPlayerId = game.CurrentPlayerId,
            WinnerPlayerId = game.WinnerPlayerId,
            CreatedAtUtc = game.CreatedAtUtc,
            Players = game.Players.Select(ToPlayerBoardResponse).ToList()
        };

    public static PlayerBoardResponse ToPlayerBoardResponse(this PlayerState player) =>
        new()
        {
            PlayerId = player.Id,
            DisplayName = player.DisplayName,
            HasPlacedShips = player.IsReady,
            Ships = player.Board.Ships.Select(ToShipResponse).ToList(),
            Hits = player.Board.Hits.Select(ToCoordinateResponse).ToList(),
            Misses = player.Board.Misses.Select(ToCoordinateResponse).ToList()
        };

    public static ShipResponse ToShipResponse(this Ship ship) =>
        new()
        {
            Size = ship.Size,
            IsSunk = ship.IsSunk,
            Coordinates = ship.Coordinates.Select(ToCoordinateResponse).ToList()
        };

    public static CoordinateResponse ToCoordinateResponse(this Coordinate coordinate) =>
        new()
        {
            Row = coordinate.Row,
            Column = coordinate.Column
        };

    public static PlayerViewResponse ToResponse(this PlayerView view) =>
        new()
        {
            GameId = view.GameId,
            PlayerId = view.Self.PlayerId,
            Self = view.Self.ToPlayerBoardResponse(),
            Opponent = view.Opponent.ToFogOfWarResponse(),
            CurrentPlayerId = view.CurrentPlayerId,
            WinnerPlayerId = view.WinnerPlayerId,
            IsStarted = view.IsStarted
        };

    private static PlayerBoardResponse ToPlayerBoardResponse(this PlayerBoardSnapshot snapshot) =>
        new()
        {
            PlayerId = snapshot.PlayerId,
            DisplayName = snapshot.DisplayName,
            HasPlacedShips = snapshot.HasPlacedShips,
            Ships = snapshot.Ships.Select(ToShipResponse).ToList(),
            Hits = snapshot.Hits.Select(ToCoordinateResponse).ToList(),
            Misses = snapshot.Misses.Select(ToCoordinateResponse).ToList()
        };

    private static PlayerBoardResponse ToFogOfWarResponse(this PlayerBoardSnapshot snapshot) =>
        new()
        {
            PlayerId = snapshot.PlayerId,
            DisplayName = snapshot.DisplayName,
            HasPlacedShips = snapshot.HasPlacedShips,
            Ships = snapshot.Ships.Select(ToShipResponse).ToList(),
            Hits = snapshot.Hits.Select(ToCoordinateResponse).ToList(),
            Misses = snapshot.Misses.Select(ToCoordinateResponse).ToList()
        };

    public static AttackResponse ToResponse(this AttackResult result) =>
        new()
        {
            GameId = result.GameId,
            AttackerId = result.AttackerId,
            DefenderId = result.DefenderId,
            Target = result.Coordinate.ToCoordinateResponse(),
            IsHit = result.IsHit,
            ShipSunk = result.SunkShip,
            ShipSize = result.SunkShipSize,
            WinnerPlayerId = result.WinnerPlayerId,
            NextPlayerId = result.NextPlayerId
        };
}

