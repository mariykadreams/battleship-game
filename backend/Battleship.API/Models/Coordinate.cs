namespace Battleship.API.Models;

public readonly record struct Coordinate(int Row, int Column)
{
    public bool IsValid() =>
        Row is >= 0 and < GameConstants.BoardSize &&
        Column is >= 0 and < GameConstants.BoardSize;

    public override string ToString() => $"({Row},{Column})";
}

