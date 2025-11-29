namespace Battleship.API.Contracts.Responses;

public sealed class ShipResponse
{
    public int Size { get; init; }
    public bool IsSunk { get; init; }
    public IEnumerable<CoordinateResponse> Coordinates { get; init; } = Array.Empty<CoordinateResponse>();
}

