using Battleship.API.Contracts.Mapping;
using Battleship.API.Contracts.Requests;
using Battleship.API.Models;
using Battleship.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace Battleship.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class GamesController : ControllerBase
{
    private readonly IGameService _gameService;

    public GamesController(IGameService gameService)
    {
        _gameService = gameService;
    }

    [HttpPost]
    public ActionResult CreateGame([FromBody] CreateGameRequest? request)
    {
        var game = _gameService.CreateGame(request?.PlayerOneName ?? "Player 1", request?.PlayerTwoName ?? "Player 2");
        return Ok(game.ToResponse());
    }

    [HttpGet("{gameId:guid}")]
    public ActionResult GetGame(Guid gameId)
    {
        var game = _gameService.GetGame(gameId);
        return Ok(game.ToResponse());
    }

    [HttpGet("{gameId:guid}/players/{playerId}")]
    public ActionResult GetView(Guid gameId, string playerId)
    {
        var view = _gameService.GetPlayerView(gameId, playerId);
        return Ok(view.ToResponse());
    }

    [HttpPost("{gameId:guid}/ships")]
    public ActionResult PlaceShips(Guid gameId, [FromBody] PlaceShipsRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.PlayerId))
        {
            return BadRequest("PlayerId is required.");
        }

        if (request.Ships is null || request.Ships.Count == 0)
        {
            return BadRequest("At least one ship placement is required.");
        }

        var placements = request.Ships.Select(MapPlacement).ToList();

        var game = _gameService.PlaceShips(gameId, request.PlayerId, placements);
        return Ok(game.ToResponse());
    }

    [HttpPost("{gameId:guid}/start")]
    public ActionResult StartGame(Guid gameId, [FromBody] StartGameRequest? request)
    {
        var game = _gameService.StartGame(gameId, request?.StartingPlayerId);
        return Ok(game.ToResponse());
    }

    [HttpPost("{gameId:guid}/attacks")]
    public ActionResult Attack(Guid gameId, [FromBody] AttackRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.PlayerId))
        {
            return BadRequest("PlayerId is required.");
        }

        if (request.Target is null)
        {
            return BadRequest("Target coordinate is required.");
        }

        var target = new Coordinate(request.Target.Row, request.Target.Column);
        try
        {
            var result = _gameService.Attack(gameId, request.PlayerId, target);
            return Ok(result.ToResponse());
        }
        catch (InvalidOperationException ex)
        {
            // Return a 400 with the detailed message to help client-side debugging
            return BadRequest(ex.Message);
        }
    }

    private static ShipPlacement MapPlacement(ShipPlacementRequest request)
    {
        if (!Enum.TryParse<ShipOrientation>(request.Orientation, ignoreCase: true, out var orientation))
        {
            throw new InvalidOperationException("Orientation must be Horizontal or Vertical.");
        }

        if (request.Start is null)
        {
            throw new InvalidOperationException("Ship start coordinate is required.");
        }

        var coordinate = new Coordinate(request.Start.Row, request.Start.Column);
        return new ShipPlacement(request.Size, coordinate, orientation);
    }
}

