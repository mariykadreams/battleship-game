namespace Battleship.API.Models;

public sealed class GameState
{
    private readonly Dictionary<string, PlayerState> _players;

    public GameState(string playerOneName, string playerTwoName)
    {
        var playerOne = new PlayerState(string.IsNullOrWhiteSpace(playerOneName) ? "Player 1" : playerOneName);
        var playerTwo = new PlayerState(string.IsNullOrWhiteSpace(playerTwoName) ? "Player 2" : playerTwoName);

        _players = new Dictionary<string, PlayerState>
        {
            [playerOne.Id] = playerOne,
            [playerTwo.Id] = playerTwo
        };
    }

    public Guid Id { get; } = Guid.NewGuid();
    public IReadOnlyCollection<PlayerState> Players => _players.Values;
    public string? CurrentPlayerId { get; set; }
    public bool IsStarted { get; private set; }
    public string? WinnerPlayerId { get; private set; }
    public DateTime CreatedAtUtc { get; } = DateTime.UtcNow;
    public object SyncRoot { get; } = new();

    public PlayerState GetPlayer(string playerId) =>
        _players.TryGetValue(playerId, out var player)
            ? player
            : throw new InvalidOperationException("Player not found in this game.");

    public PlayerState GetOpponent(string playerId) =>
        _players.Values.First(p => p.Id != playerId);

    public bool AllPlayersReady => _players.Values.All(p => p.IsReady);

    public void Start(string? startingPlayerId = null)
    {
        if (IsStarted)
        {
            throw new InvalidOperationException("Game already started.");
        }

        if (!AllPlayersReady)
        {
            throw new InvalidOperationException("Both players must place all ships before starting.");
        }

        IsStarted = true;
        CurrentPlayerId = startingPlayerId != null && _players.ContainsKey(startingPlayerId)
            ? startingPlayerId
            : _players.Values.First().Id;
    }

    public void MarkWinner(string playerId)
    {
        WinnerPlayerId = playerId;
    }
}

