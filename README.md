# OpenSourceJavascriptGame

clearCanvas() - Function to redraw a black screen





initializedKeys - Array with the current state of the user's keyboard





Vector - Class representing a point in 2d space
    getX() - Get the x coordinate of the Vector
    getY() - Get the y coordinate of the Vector
    getMagnitude() - Get the magnitude of the Vector
    getAngle() - Get the angle of the Vector
    toPolarPoint() - Return a new equivalent PolarPoint
    toCartesianPoint() - Return a new equivalent CartesianPoint
    invert() - Return a new Vector of the same type where the angle is rotated 180 degrees
    normalize() - Return a new Vector where the magnitude has been limited to at most 1
    add() - Return a new Vector representing the some of this Vector and another
    subtract() - Return a new Vector representing the difference of this Vector and another
CartesianPoint - Subclass of Vector which stores the data as x, y
PolarPoint - Subclass of Vector which stores the data as magnitude, angle; magnitude is always positive





Hitbox - Class representing a hitbox or portion of a hitbox for an Entity (see below)
    accept() - Accept a Visitor class and return the onX() function of said Visitor
Rect - Subclass of Hitbox representing a rectangular portion of a hitbox
Circle - Subclass of Hitbox representing a circular portion of a hitbox
Location - Subclass of Hitbox; A decorator class which modifies the location of a hitbox component
Group - Subclass of Hitbox; A class which acts as a parent to one or more subcomponents of a hitbox





Visitor - Class acting as an interface for any visitor classes
    onX() - Do something with a hitbox, where X is the hitbox type
DrawHitboxes - Visitor class which draws each component of a hitbox which accepts it
ListComponents - Visitor class which lists the components of a hitbox with true position locations





Entity - A generic class representing an object in the game
    collidingWith - Return whether this Entity is colliding with another specific entity
    getCollisions - Return a list of Entities that this Entity is currently colliding with
    draw() - Draw the sprite of the entity at its position
    drawHitbox() - Draw the hitbox components of this Entity using the DrawHitboxes Visitor
    update() - The logic that runs every game frame on this Entity
Player - Subclass of entity which has custom input-to-movement logic
LevelElement - Subclass of Entity which acts as walls in a level, entities that collide with them shouldn't be able to pass through them
Projectile - Subclass of entity which should continue in a direction until it hits something, and do something when it hits (damage, dissipate, etc...)





entities - Array with every entity currently in the level





levelCreation - Boolean which allows user to click-and-drag to make DrawHitboxes
levelRenderer - Function which makes it easier to see where your mouse is, and what the resulting hitboxes in level creation will look like





loop - Function which calls itself each animation frame, and acts as the game loop


Win screen added at 100 points

Background and enemy Sprites added
index.html added
	<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta http-equiv="X-UA-Compatible" content="IE-edge">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>JavaScript Game</title>
	<link rel="stylesheet" href="style.css">
</head>
<body id="page">
	<canvas id="gameCanvas"></canvas>
	<script src='index.js'></script>
</body>
</html>

Win Condition and Screen added to index.js

style.css - Modified Page Color to a gray