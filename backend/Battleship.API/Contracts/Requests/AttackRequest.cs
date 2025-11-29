namespace Battleship.API.Contracts.Requests;

public sealed class AttackRequest
{
    public string PlayerId { get; set; } = string.Empty;
    public CoordinateDto Target { get; set; } = new();
}

