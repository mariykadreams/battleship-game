namespace Battleship.API.Models;

public sealed class Ship
{
    private readonly HashSet<Coordinate> _hits = new();

    public Ship(int size, IEnumerable<Coordinate> coordinates)
    {
        Size = size;
        Coordinates = coordinates.ToList().AsReadOnly();
    }

    public int Size { get; }
    public IReadOnlyCollection<Coordinate> Coordinates { get; }

    public bool IsSunk => _hits.Count == Coordinates.Count;

    public bool Occupies(Coordinate coordinate) => Coordinates.Contains(coordinate);

    public void RegisterHit(Coordinate coordinate)
    {
        if (Occupies(coordinate))
        {
            _hits.Add(coordinate);
        }
    }
}

