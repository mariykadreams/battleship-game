namespace Battleship.API.Contracts.Responses;

public sealed class AttackResponse
{
    public Guid GameId { get; init; }
    public string AttackerId { get; init; } = string.Empty;
    public string DefenderId { get; init; } = string.Empty;
    public CoordinateResponse Target { get; init; } = new();
    public bool IsHit { get; init; }
    public bool ShipSunk { get; init; }
    public int? ShipSize { get; init; }
    public string? WinnerPlayerId { get; init; }
    public string? NextPlayerId { get; init; }
}

