namespace Battleship.API.Contracts.Responses;

public sealed class GameStateResponse
{
    public Guid GameId { get; init; }
    public bool IsStarted { get; init; }
    public string? CurrentPlayerId { get; init; }
    public string? WinnerPlayerId { get; init; }
    public IEnumerable<PlayerBoardResponse> Players { get; init; } = Array.Empty<PlayerBoardResponse>();
    public DateTime CreatedAtUtc { get; init; }
}

