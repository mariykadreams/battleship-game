using Battleship.API.Models;

namespace Battleship.API.Services.Results;

public sealed class PlayerBoardSnapshot
{
    public PlayerBoardSnapshot(PlayerState player, bool includeShips = true)
    {
        PlayerId = player.Id;
        DisplayName = player.DisplayName;
        Hits = player.Board.Hits;
        Misses = player.Board.Misses;
        HasPlacedShips = player.IsReady;
        Ships = includeShips
            ? player.Board.Ships
            : player.Board.Ships.Where(s => s.IsSunk).ToList();
    }

    public string PlayerId { get; }
    public string DisplayName { get; }
    public bool HasPlacedShips { get; }
    public IReadOnlyCollection<Coordinate> Hits { get; }
    public IReadOnlyCollection<Coordinate> Misses { get; }
    public IEnumerable<Ship> Ships { get; } = Enumerable.Empty<Ship>();
}

