namespace Battleship.API.Services.Results;

public sealed class PlayerView
{
    public PlayerView(Guid gameId, PlayerBoardSnapshot self, PlayerBoardSnapshot opponent, string? currentPlayerId, string? winnerPlayerId, bool isStarted)
    {
        GameId = gameId;
        Self = self;
        Opponent = opponent;
        CurrentPlayerId = currentPlayerId;
        WinnerPlayerId = winnerPlayerId;
        IsStarted = isStarted;
    }

    public Guid GameId { get; }
    public PlayerBoardSnapshot Self { get; }
    public PlayerBoardSnapshot Opponent { get; }
    public string? CurrentPlayerId { get; }
    public string? WinnerPlayerId { get; }
    public bool IsStarted { get; }
}

