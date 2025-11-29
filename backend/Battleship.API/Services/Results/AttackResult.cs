using Battleship.API.Models;

namespace Battleship.API.Services.Results;

public sealed class AttackResult
{
    public AttackResult(GameState game, PlayerState attacker, PlayerState defender, AttackOutcome outcome)
    {
        GameId = game.Id;
        AttackerId = attacker.Id;
        DefenderId = defender.Id;
        Coordinate = outcome.Target;
        IsHit = outcome.IsHit;
        SunkShip = outcome.SunkShip;
        SunkShipSize = outcome.Ship?.Size;
        WinnerPlayerId = game.WinnerPlayerId;
        NextPlayerId = game.CurrentPlayerId;
    }

    public Guid GameId { get; }
    public string AttackerId { get; }
    public string DefenderId { get; }
    public Coordinate Coordinate { get; }
    public bool IsHit { get; }
    public bool SunkShip { get; }
    public int? SunkShipSize { get; }
    public string? WinnerPlayerId { get; }
    public string? NextPlayerId { get; }
}

