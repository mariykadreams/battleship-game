namespace Battleship.API.Models;

public sealed class Board
{
    private readonly List<Ship> _ships = new();
    private readonly HashSet<Coordinate> _hits = new();
    private readonly HashSet<Coordinate> _misses = new();

    public IReadOnlyCollection<Ship> Ships => _ships.AsReadOnly();
    public IReadOnlyCollection<Coordinate> Hits => _hits;
    public IReadOnlyCollection<Coordinate> Misses => _misses;

    public bool HasRequiredFleet =>
        _ships.Count == GameConstants.RequiredFleet.Length &&
        _ships.Select(s => s.Size).OrderBy(x => x)
            .SequenceEqual(GameConstants.RequiredFleet.OrderBy(x => x));

    public bool AllShipsSunk => _ships.Count > 0 && _ships.All(s => s.IsSunk);

    public void PlaceFleet(IEnumerable<ShipPlacement> placements)
    {
        var placementList = placements?.ToList() ?? new List<ShipPlacement>();

        if (placementList.Count != GameConstants.RequiredFleet.Length)
        {
            throw new InvalidOperationException($"You must place exactly {GameConstants.RequiredFleet.Length} ships.");
        }

        var fleetSizes = placementList.Select(p => p.Size).OrderBy(x => x).ToArray();
        if (!fleetSizes.SequenceEqual(GameConstants.RequiredFleet.OrderBy(x => x)))
        {
            throw new InvalidOperationException("Ship sizes do not match the required fleet (5,4,3,3,2).");
        }

        var occupied = new HashSet<Coordinate>();

        _ships.Clear();
        _hits.Clear();
        _misses.Clear();

        foreach (var placement in placementList)
        {
            var coordinates = CalculateCoordinates(placement).ToList();
            foreach (var coordinate in coordinates)
            {
                if (!coordinate.IsValid())
                {
                    throw new InvalidOperationException($"Coordinate {coordinate} is outside the board.");
                }

                if (!occupied.Add(coordinate))
                {
                    throw new InvalidOperationException($"Coordinate {coordinate} is already occupied by another ship.");
                }
            }

            _ships.Add(new Ship(placement.Size, coordinates));
        }
    }

    public AttackOutcome ResolveAttack(Coordinate target)
    {
        if (!target.IsValid())
        {
            throw new InvalidOperationException("Attack coordinate is outside the board.");
        }

        if (_hits.Contains(target) || _misses.Contains(target))
        {
            throw new InvalidOperationException("This coordinate has already been targeted.");
        }

        var ship = _ships.FirstOrDefault(s => s.Occupies(target));
        if (ship is not null)
        {
            ship.RegisterHit(target);
            _hits.Add(target);
            return new AttackOutcome(true, ship.IsSunk, ship, target);
        }

        _misses.Add(target);
        return new AttackOutcome(false, false, null, target);
    }

    private static IEnumerable<Coordinate> CalculateCoordinates(ShipPlacement placement)
    {
        for (var offset = 0; offset < placement.Size; offset++)
        {
            var row = placement.Orientation == ShipOrientation.Vertical
                ? placement.Start.Row + offset
                : placement.Start.Row;

            var column = placement.Orientation == ShipOrientation.Horizontal
                ? placement.Start.Column + offset
                : placement.Start.Column;

            yield return new Coordinate(row, column);
        }
    }
}

