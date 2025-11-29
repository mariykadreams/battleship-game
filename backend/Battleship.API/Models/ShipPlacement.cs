namespace Battleship.API.Models;

public sealed class ShipPlacement
{
    public int Size { get; }
    public Coordinate Start { get; }
    public ShipOrientation Orientation { get; }

    public ShipPlacement(int size, Coordinate start, ShipOrientation orientation)
    {
        Size = size;
        Start = start;
        Orientation = orientation;
    }
}

