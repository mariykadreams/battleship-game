namespace Battleship.API.Contracts.Requests;

public sealed class ShipPlacementRequest
{
    public int Size { get; set; }
    public CoordinateDto? Start { get; set; }
    public string Orientation { get; set; } = "Horizontal";
}

