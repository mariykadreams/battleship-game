namespace Battleship.API.Models;

public sealed class PlayerState
{
    public PlayerState(string displayName)
    {
        Id = Guid.NewGuid().ToString("N");
        DisplayName = string.IsNullOrWhiteSpace(displayName) ? "Player" : displayName.Trim();
    }

    public string Id { get; }
    public string DisplayName { get; }
    public Board Board { get; } = new();

    public bool IsReady => Board.HasRequiredFleet;
}

