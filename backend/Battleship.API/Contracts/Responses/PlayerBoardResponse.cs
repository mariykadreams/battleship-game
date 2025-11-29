namespace Battleship.API.Contracts.Responses;

public sealed class PlayerBoardResponse
{
    public string PlayerId { get; init; } = string.Empty;
    public string DisplayName { get; init; } = string.Empty;
    public bool HasPlacedShips { get; init; }
    public IEnumerable<ShipResponse> Ships { get; init; } = Array.Empty<ShipResponse>();
    public IEnumerable<CoordinateResponse> Hits { get; init; } = Array.Empty<CoordinateResponse>();
    public IEnumerable<CoordinateResponse> Misses { get; init; } = Array.Empty<CoordinateResponse>();
}

