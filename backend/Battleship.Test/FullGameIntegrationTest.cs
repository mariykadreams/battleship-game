using System.Net;
using System.Net.Http.Json;
using System.Reflection;
using Battleship.API.Contracts.Requests;
using Battleship.API.Contracts.Responses;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

namespace Battleship.Test;

public class FullGameIntegrationTest : IClassFixture<WebApplicationFactory<Battleship.API.Program>>
{
    private readonly HttpClient _client;
    private readonly WebApplicationFactory<Battleship.API.Program> _factory;

    public FullGameIntegrationTest(WebApplicationFactory<Battleship.API.Program> factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task FullGameFlow_ShouldCompleteSuccessfully()
    {
        var createRequest = new CreateGameRequest
        {
            PlayerOneName = "Alice",
            PlayerTwoName = "Bob"
        };

        var createResponse = await _client.PostAsJsonAsync("/api/games", createRequest);
        createResponse.EnsureSuccessStatusCode();
        var gameState = await createResponse.Content.ReadFromJsonAsync<GameStateResponse>();
        
        Assert.NotNull(gameState);
        Assert.False(gameState.IsStarted);
        Assert.Null(gameState.CurrentPlayerId);
        Assert.Null(gameState.WinnerPlayerId);
        Assert.Equal(2, gameState.Players.Count());

        var player1 = gameState.Players.First();
        var player2 = gameState.Players.Skip(1).First();

        var player1Ships = CreateValidFleet(0, 0);
        var placeShipsRequest1 = new PlaceShipsRequest
        {
            PlayerId = player1.PlayerId,
            Ships = player1Ships
        };

        var placeResponse1 = await _client.PostAsJsonAsync($"/api/games/{gameState.GameId}/ships", placeShipsRequest1);
        placeResponse1.EnsureSuccessStatusCode();
        var gameStateAfterPlace1 = await placeResponse1.Content.ReadFromJsonAsync<GameStateResponse>();
        Assert.NotNull(gameStateAfterPlace1);
        Assert.True(gameStateAfterPlace1.Players.First(p => p.PlayerId == player1.PlayerId).HasPlacedShips);

        var player2Ships = CreateValidFleet(5, 5);
        var placeShipsRequest2 = new PlaceShipsRequest
        {
            PlayerId = player2.PlayerId,
            Ships = player2Ships
        };

        var placeResponse2 = await _client.PostAsJsonAsync($"/api/games/{gameState.GameId}/ships", placeShipsRequest2);
        placeResponse2.EnsureSuccessStatusCode();
        var gameStateAfterPlace2 = await placeResponse2.Content.ReadFromJsonAsync<GameStateResponse>();
        Assert.NotNull(gameStateAfterPlace2);
        Assert.True(gameStateAfterPlace2.Players.All(p => p.HasPlacedShips));

        var startResponse = await _client.PostAsJsonAsync($"/api/games/{gameState.GameId}/start", new StartGameRequest());
        startResponse.EnsureSuccessStatusCode();
        var gameStateStarted = await startResponse.Content.ReadFromJsonAsync<GameStateResponse>();
        
        Assert.NotNull(gameStateStarted);
        Assert.True(gameStateStarted.IsStarted);
        Assert.NotNull(gameStateStarted.CurrentPlayerId);
        Assert.Null(gameStateStarted.WinnerPlayerId);

        var player1ViewResponse = await _client.GetAsync($"/api/games/{gameState.GameId}/players/{player1.PlayerId}");
        player1ViewResponse.EnsureSuccessStatusCode();
        var player1View = await player1ViewResponse.Content.ReadFromJsonAsync<PlayerViewResponse>();
        
        Assert.NotNull(player1View);
        Assert.Equal(5, player1View.Self.Ships.Count());
        Assert.Empty(player1View.Opponent.Ships);

        var currentPlayerId = gameStateStarted.CurrentPlayerId!;
        var attackerId = currentPlayerId;
        var defenderId = attackerId == player1.PlayerId ? player2.PlayerId : player1.PlayerId;
        var attackCount = 0;
        const int maxAttacks = 200;

        var player1ShipCoords = GetShipCoordinates(player1Ships);
        var player2ShipCoords = GetShipCoordinates(player2Ships);
        var targetedCoords = new HashSet<(int row, int col)>();

        while (attackCount < maxAttacks)
        {
            var attackerViewResponse = await _client.GetAsync($"/api/games/{gameState.GameId}/players/{attackerId}");
            attackerViewResponse.EnsureSuccessStatusCode();
            var attackerView = await attackerViewResponse.Content.ReadFromJsonAsync<PlayerViewResponse>();
            Assert.NotNull(attackerView);

            var allTargeted = attackerView.Opponent.Hits.Concat(attackerView.Opponent.Misses)
                .Select(h => (h.Row, h.Column))
                .ToHashSet();
            targetedCoords.UnionWith(allTargeted);

            CoordinateDto? target = null;

            var defenderShipCoords = defenderId == player1.PlayerId ? player1ShipCoords : player2ShipCoords;
            foreach (var (row, col) in defenderShipCoords)
            {
                if (!targetedCoords.Contains((row, col)))
                {
                    target = new CoordinateDto { Row = row, Column = col };
                    break;
                }
            }

            if (target == null)
            {
                for (int row = 0; row < 10; row++)
                {
                    for (int col = 0; col < 10; col++)
                    {
                        if (!targetedCoords.Contains((row, col)))
                        {
                            target = new CoordinateDto { Row = row, Column = col };
                            break;
                        }
                    }
                    if (target != null) break;
                }
            }

            if (target == null)
            {
                Assert.Fail("Could not find a valid target coordinate");
            }

            var attackRequest = new AttackRequest
            {
                PlayerId = attackerId,
                Target = target
            };

            var attackResponse = await _client.PostAsJsonAsync($"/api/games/{gameState.GameId}/attacks", attackRequest);
            
            if (attackResponse.StatusCode == HttpStatusCode.BadRequest)
            {
                var gameCheckResponse = await _client.GetAsync($"/api/games/{gameState.GameId}");
                gameCheckResponse.EnsureSuccessStatusCode();
                var gameCheck = await gameCheckResponse.Content.ReadFromJsonAsync<GameStateResponse>();
                
                if (gameCheck?.WinnerPlayerId != null)
                {
                    break;
                }
                
                await Task.Delay(100);
                continue;
            }

            attackResponse.EnsureSuccessStatusCode();
            var attackResult = await attackResponse.Content.ReadFromJsonAsync<AttackResponse>();
            Assert.NotNull(attackResult);
            Assert.Equal(attackerId, attackResult.AttackerId);
            Assert.Equal(defenderId, attackResult.DefenderId);

            attackCount++;

            if (attackResult.WinnerPlayerId != null)
            {
                Assert.NotNull(attackResult.WinnerPlayerId);
                Assert.Equal(attackerId, attackResult.WinnerPlayerId);
                
                var finalGameResponse = await _client.GetAsync($"/api/games/{gameState.GameId}");
                finalGameResponse.EnsureSuccessStatusCode();
                var finalGame = await finalGameResponse.Content.ReadFromJsonAsync<GameStateResponse>();
                
                Assert.NotNull(finalGame);
                Assert.True(finalGame.IsStarted);
                Assert.NotNull(finalGame.WinnerPlayerId);
                Assert.Equal(attackerId, finalGame.WinnerPlayerId);
                
                var winnerViewResponse = await _client.GetAsync($"/api/games/{gameState.GameId}/players/{attackerId}");
                winnerViewResponse.EnsureSuccessStatusCode();
                var winnerView = await winnerViewResponse.Content.ReadFromJsonAsync<PlayerViewResponse>();
                
                Assert.NotNull(winnerView);
                Assert.True(winnerView.Opponent.Ships.All(s => s.IsSunk));
                
                break;
            }

            attackerId = attackResult.NextPlayerId ?? defenderId;
            defenderId = attackerId == player1.PlayerId ? player2.PlayerId : player1.PlayerId;
        }

        Assert.True(attackCount > 0, "At least one attack should have been made");
        Assert.True(attackCount < maxAttacks, "Game should have ended before hitting max attacks");
    }

    [Fact]
    public async Task InvalidAttack_ShouldReturnBadRequest()
    {
        var createResponse = await _client.PostAsJsonAsync("/api/games", new CreateGameRequest());
        createResponse.EnsureSuccessStatusCode();
        var gameState = await createResponse.Content.ReadFromJsonAsync<GameStateResponse>();
        Assert.NotNull(gameState);

        var player1 = gameState.Players.First();

        var attackRequest = new AttackRequest
        {
            PlayerId = player1.PlayerId,
            Target = new CoordinateDto { Row = 0, Column = 0 }
        };

        var attackResponse = await _client.PostAsJsonAsync($"/api/games/{gameState.GameId}/attacks", attackRequest);
        Assert.Equal(HttpStatusCode.BadRequest, attackResponse.StatusCode);
    }

    [Fact]
    public async Task PlaceShips_InvalidFleet_ShouldReturnBadRequest()
    {
        var createResponse = await _client.PostAsJsonAsync("/api/games", new CreateGameRequest());
        createResponse.EnsureSuccessStatusCode();
        var gameState = await createResponse.Content.ReadFromJsonAsync<GameStateResponse>();
        Assert.NotNull(gameState);

        var player1 = gameState.Players.First();

        var invalidShips = new List<ShipPlacementRequest>
        {
            new() { Size = 5, Start = new CoordinateDto { Row = 0, Column = 0 }, Orientation = "Horizontal" },
            new() { Size = 4, Start = new CoordinateDto { Row = 1, Column = 0 }, Orientation = "Horizontal" },
        };

        var placeRequest = new PlaceShipsRequest
        {
            PlayerId = player1.PlayerId,
            Ships = invalidShips
        };

        var placeResponse = await _client.PostAsJsonAsync($"/api/games/{gameState.GameId}/ships", placeRequest);
        Assert.Equal(HttpStatusCode.BadRequest, placeResponse.StatusCode);
    }

    [Fact]
    public async Task PlaceShips_AdjacentRows_ShouldSucceed()
    {
        var createResponse = await _client.PostAsJsonAsync("/api/games", new CreateGameRequest());
        createResponse.EnsureSuccessStatusCode();
        var gameState = await createResponse.Content.ReadFromJsonAsync<GameStateResponse>();
        Assert.NotNull(gameState);

        var player1 = gameState.Players.First();

        var adjacentShips = new List<ShipPlacementRequest>
        {
            new() { Size = 5, Start = new CoordinateDto { Row = 0, Column = 0 }, Orientation = "Horizontal" },
            new() { Size = 4, Start = new CoordinateDto { Row = 1, Column = 0 }, Orientation = "Horizontal" },
            new() { Size = 3, Start = new CoordinateDto { Row = 2, Column = 0 }, Orientation = "Horizontal" },
            new() { Size = 3, Start = new CoordinateDto { Row = 3, Column = 0 }, Orientation = "Horizontal" },
            new() { Size = 2, Start = new CoordinateDto { Row = 4, Column = 0 }, Orientation = "Horizontal" }
        };

        var placeRequest = new PlaceShipsRequest
        {
            PlayerId = player1.PlayerId,
            Ships = adjacentShips
        };

        var placeResponse = await _client.PostAsJsonAsync($"/api/games/{gameState.GameId}/ships", placeRequest);
        placeResponse.EnsureSuccessStatusCode();
        
        var gameStateAfterPlace = await placeResponse.Content.ReadFromJsonAsync<GameStateResponse>();
        Assert.NotNull(gameStateAfterPlace);
        Assert.True(gameStateAfterPlace.Players.First(p => p.PlayerId == player1.PlayerId).HasPlacedShips);
    }

    [Fact]
    public async Task AttackOutOfTurn_ShouldReturnBadRequest()
    {
        var createResponse = await _client.PostAsJsonAsync("/api/games", new CreateGameRequest());
        createResponse.EnsureSuccessStatusCode();
        var gameState = await createResponse.Content.ReadFromJsonAsync<GameStateResponse>();
        Assert.NotNull(gameState);

        var player1 = gameState.Players.First();
        var player2 = gameState.Players.Skip(1).First();

        var player1Ships = CreateValidFleet(0, 0);
        await _client.PostAsJsonAsync($"/api/games/{gameState.GameId}/ships", 
            new PlaceShipsRequest { PlayerId = player1.PlayerId, Ships = player1Ships });
        
        var player2Ships = CreateValidFleet(5, 5);
        await _client.PostAsJsonAsync($"/api/games/{gameState.GameId}/ships", 
            new PlaceShipsRequest { PlayerId = player2.PlayerId, Ships = player2Ships });

        await _client.PostAsJsonAsync($"/api/games/{gameState.GameId}/start", new StartGameRequest());

        var gameResponse = await _client.GetAsync($"/api/games/{gameState.GameId}");
        gameResponse.EnsureSuccessStatusCode();
        var currentGame = await gameResponse.Content.ReadFromJsonAsync<GameStateResponse>();
        Assert.NotNull(currentGame);
        Assert.NotNull(currentGame.CurrentPlayerId);

        var wrongPlayerId = currentGame.CurrentPlayerId == player1.PlayerId ? player2.PlayerId : player1.PlayerId;
        var attackRequest = new AttackRequest
        {
            PlayerId = wrongPlayerId,
            Target = new CoordinateDto { Row = 0, Column = 0 }
        };

        var attackResponse = await _client.PostAsJsonAsync($"/api/games/{gameState.GameId}/attacks", attackRequest);
        Assert.Equal(HttpStatusCode.BadRequest, attackResponse.StatusCode);
    }

    private static List<ShipPlacementRequest> CreateValidFleet(int startRow, int startCol)
    {
        var fleet = new List<ShipPlacementRequest>();
        var sizes = new[] { 5, 4, 3, 3, 2 };
        var currentCol = startCol;

        foreach (var size in sizes)
        {
            fleet.Add(new ShipPlacementRequest
            {
                Size = size,
                Start = new CoordinateDto { Row = startRow, Column = currentCol },
                Orientation = "Horizontal"
            });
            
            startRow++;
            if (startRow >= 10)
            {
                startRow = 0;
                currentCol += 6;
            }
        }

        return fleet;
    }

    private static HashSet<(int row, int col)> GetShipCoordinates(List<ShipPlacementRequest> ships)
    {
        var coords = new HashSet<(int row, int col)>();
        foreach (var ship in ships)
        {
            var start = ship.Start!;
            for (int i = 0; i < ship.Size; i++)
            {
                if (ship.Orientation == "Horizontal")
                {
                    coords.Add((start.Row, start.Column + i));
                }
                else
                {
                    coords.Add((start.Row + i, start.Column));
                }
            }
        }
        return coords;
    }
}

