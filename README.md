# battleship-game

27.11 - use case day - I spent today working on understanding what should be included in the game, figuring out the requirements, and exploring what the gameplay workflow might look like for players. I admit I used the internet to look at similar projects, but I did this to see what features they had and to understand what I should consider from the start. For now, we have the following basic plan that I will try to create before the deadline:

1. Player opens the Battleship game in a browser.
2. The game displays a 10x10 grid for both Player 1 and Player 2.
3. Each player manually places their ships of sizes 5, 4, 3, 3, and 2 on their board.
4. Player clicks the **Start** button to begin the game.
5. The game alternates turns between Player 1 and Player 2:
   - Current player selects a cell on the opponent's grid to attack.
   - Game checks if the attack is a **hit** or **miss**.
   - Update both players’ boards with hits/misses.
   - Change the visible board when switching players to hide the opponent's board.
6. The game continues until all ships of one player are sunk.
7. The game displays a **win message** for the winning player.


28.11-29.11 - backend days -  During those days, I managed to create a structure and the first working implementation of the backend. I locked in for two days, and it paid off. Technically, i already have a "playable" API. Users can assign the placement of their ships, attack their opponents, and more.

At first, it was challenging to figure out what kind of structure was needed, and this part of the process felt especially creative. That’s why I used a use case as the foundation and spent time considering what the structure should look like.

However, I definitely plan to spend some time making the structure easier to understand, since right now it still feels a bit confusing.





