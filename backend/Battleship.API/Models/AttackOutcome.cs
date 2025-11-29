namespace Battleship.API.Models;

public sealed class AttackOutcome
{
    public AttackOutcome(bool isHit, bool sunkShip, Ship? ship, Coordinate target)
    {
        IsHit = isHit;
        SunkShip = sunkShip;
        Ship = ship;
        Target = target;
    }

    public bool IsHit { get; }
    public bool SunkShip { get; }
    public Ship? Ship { get; }
    public Coordinate Target { get; }
}

