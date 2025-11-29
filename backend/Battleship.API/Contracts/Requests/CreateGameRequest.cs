namespace Battleship.API.Contracts.Requests;

public sealed class CreateGameRequest
{
    public string? PlayerOneName { get; set; }
    public string? PlayerTwoName { get; set; }
}

