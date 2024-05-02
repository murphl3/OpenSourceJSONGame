# Testing Procedure

## Level Editing Mode
In order to access the Level Editor for the game, you need to go into the file named `index.html` and edit line 632's boolean to be `true`

**Line 632:** `var levelCreation = false`. This should now be changed to `var levelCreation = true`

Another line of code must also be changed:

**Line 798:** `sortedEntities.forEach((entity) => {entity.update({canvas: canvas, context: context})})`
should now be:
`sortedEntities.forEach((entity) => {entity.update({canvas: canvas, context: context}); entity.drawHitbox(context)})`

This should now show the calculated hitboxes of every object in the game, allowing you to see collisions.

Once you are done, change the `var levelCreation` boolean back to `false`, and Line 798 back to its original line as well, as previously explained.


## Playing the Game

### Controls
As briefly mentioned in the abstract of the project, you use the `W` `A` `S` and `D` keys to move your blue block player on the left. In order to shoot enemies, you can either tap or hold the spacebar. And to aim,
you use the mouse cursor to line up with the other enemies to get a good shot at them. A player can have a maximum of 5 ball bullets on the screen, so keep this in mind when dodging enemies. 

### Information
The player has 3 hit points, and the enemies can have either 1 or 2 hit points as well. If you lose all 3 hit points, the game will immediately end and your score is presented. The maximum score a player can get is 100
at the moment, but this value can be adjusted. You may restart the game by pressing `R`, and if you need to pause the game at any time, hit the `Escape` Key
