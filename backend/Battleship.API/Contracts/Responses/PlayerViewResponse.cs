namespace Battleship.API.Contracts.Responses;

public sealed class PlayerViewResponse
{
    public Guid GameId { get; init; }
    public string PlayerId { get; init; } = string.Empty;
    public PlayerBoardResponse Self { get; init; } = new();
    public PlayerBoardResponse Opponent { get; init; } = new();
    public string? CurrentPlayerId { get; init; }
    public string? WinnerPlayerId { get; init; }
    public bool IsStarted { get; init; }
}

