# OpenSourceJavascriptGame

This is a basic enemy shooter with tank controls for WASD and spacebar to shoot and mouse to aim. We had hoped to aim higher in this project by making something similar to an open world adventure RPG with multiple endings, but were bogged down with 
time constraints and resource management. Below are all of the functions and class calls that outline each files' basic functionality, as well as documentation


Code of Conduct:
Contributors refers to members of the community surrounding this project, as well as those who have access to the repository.
Contributors, when contributing to this project, shall be respectful and open to each other's ideas.
This means that hurtful language should be kept to a minimum, and conversations should not be antagonistic.
This also means that pull requests, comments, and other places where written language comes up should also be respectful and avoid antagonism.

Mission Statement:
This project was designed to build a game, and the game engine that goes with it, minimizing the number of files necessary. We have included an HTML file, a CSS file, a Javascript file, and image files.
Our engine should be effective, allowing for relative ease of use while remaining robust enough to be versatile, despite being small, and our game should be intuitive.


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
	Set up structure for web page with canvas element for rendering game	


Win Condition and Screen added to index.js

style.css - Modified Page Color to a gray



Copyright 2024 Eamon Jouett, Surya Pratap, & Liam Murphy

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.