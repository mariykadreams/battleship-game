namespace Battleship.API.Contracts.Requests;

public sealed class PlaceShipsRequest
{
    public string PlayerId { get; set; } = string.Empty;
    public IList<ShipPlacementRequest> Ships { get; set; } = new List<ShipPlacementRequest>();
}

