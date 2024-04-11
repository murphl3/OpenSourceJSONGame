// SETUP
const canvas = document.getElementById("gameCanvas");
const context = canvas.getContext("2d");
canvas.width = 768;
canvas.height = 768;
function clearCanvas() {
	var prevStyle = context.fillStyle;
	context.fillStyle = "#000000";
	context.fillRect(0, 0, canvas.width, canvas.height);
	context.fillStyle = prevStyle;
}
clearCanvas();

/********************************************************************************************************************************/

// GET USER INPUT

// Change this to initialize the keys needed to start the script
const initializedKeys = [
	"w",
	"W",
	"ArrowUp",
	"s",
	"S",
	"ArrowDown",
	"a",
	"A",
	"ArrowLeft",
	"d",
	"D",
	"ArrowRight"
];
var keyState = new Object();
for (var i = 0; i < initializedKeys.length; i++) {
	keyState[initializedKeys[i]] = false;
}
window.addEventListener('keydown', (event) => {
	keyState[event.key] = true;
});
window.addEventListener('keyup', (event) => {
	keyState[event.key] = false;
});

/********************************************************************************************************************************/

// CLASSES
class Point {
	// A basic class to represent cartesian coordinates
	constructor(x, y) {
		if (typeof(x) !== Number || typeof(y) !== Number) { throw new Error("Invalid Point"); }
		this.x = x;
		this.y = y;
	}
	// Returns a polar form equivalent to to this point
	toVector() {
		return new Vector(Math.sqrt(Math.pow(this.y, 2) + Math.pow(this.x, 2)), Math.atan2(this.y, this.x));
	}
	// Returns a point with a reversed direction but equivalent magnitude
	invert() {
		return new Point(-1 * this.x, -1 * this.y);
	}
	// Returns a point with a magnitude of 1
	normalize() {
		let factor = this.toVector().magnitude;
		return new Point(this.x / factor, this.y / factor);
	}
	// Finds the distance between this point and another
	getDistance(other) {
		if (!(other instanceof Point)) { throw new Error("getDistance must be between two points."); }
		return Math.sqrt(Math.pow(other.y - this.y, 2) + Math.pow(other.x - this.x, 2));
	}
	// Finds the direction to another point from this one
	getDirection(other) {
		if (!(other instanceof Point)) { throw new Error("getDirection must be between two points."); }
		return Math.atan2(other.y - this.y, other.x - this.x);
	}
};

class Vector {
	// A basic class to represent polar coordinates
	constructor(mag, dir) {
		if (typeof(mag) !== Number || typeof(dir) !== Number) { throw new Error("Invalid Vector"); }
		this.magnitude = mag;
		this.direction = dir % (2 * Math.PI);
	}
	// Returns a component form equivalent of this vector
	toPoint() {
		return new Point(this.magnitude * Math.cos(this.direction), this.magnitude * Math.sin(this.direction));
	}
	// Returns a vector with a reversed direction
	invert() {
		return new Vector(this.magnitude, this.direction + Math.PI);
	}
	// Returns a vector with a magnitude of 1
	normalize() {
		return new Vector(1, this.direction);
	}
	// Gets the x component  of the vector
	getX() {
		return this.magnitude * Math.cos(this.direction);
	}
	// Gets the y component of the vector
	getY() {
		return this.magnitude * Math.sin(this.direction);
	}
};

class Triangle {
	// A triangle made of points, with some extra functionality
	constructor(point1, point2, point3) {
		if (!(point1 instanceof Point) || !(point2 instanceof Point) || !(point3 instanceof Point)) { throw new Error("Invalid Points"); }
		this.points = [point1, point2, point3];
		this.normals = this.getNormals();
	}
	getNormals() {
		// Find the center to check normals later
		let center = new Point(((this.points[0].x + this.points[1].x + this.points[2].x) / 3), ((this.points[0].y + this.points[1].y + this.points[2].y) / 3));
		// Initialize a normal Array
		var normals = new Array(3);
		// Loop through the points
		for (let i = 0; i < 3; i++) {
			// Find the normal value for each pair of points
			normals[i] = new Vector(1, new Point(this.points[(i + 1) % 3].x - this.points[i].x, this.points[(i + 1) % 3].y - this.points[i].y).getDirection() + (Math.PI / 2));
			// Calculate the inverse to check if the normal is the correct one
			let inverse = normals[i].invert();
			// Actually check the normal
			if (new Point(center.x + normals[i].getX(), center.y + normals[i].getY()).getDistance(center) < new Point(center.x + inverse.getX(), center.y + inverse.getY())) {
				// Replace the current normal with the inverse one if it is found to be incorrect
				normals[i] = inverse;
			}
		}
		// Return the found normals
		return normals;
	}
};

class Hitbox {
	// A list of triangles representing a hitbox, with some other functionality
	constructor(...points) {
		for (let i = 0; i < points.length; i++) {
			if (!(points[i] instanceof Point)) { throw new Error("Hitbox can only be made with points."); }
		}
		this.triangles = this.pointsToTriangles(points);
	}
	pointsToTriangles(...points) {
		// Check that we have enough points
		if (points.length < 3) { throw new Error ("Insufficient Points"); }
		var active = new Array(points.length);
		for (let i = 0; i < points.length; i++) {
			active[i] = points[i];
		}
		var triangles = new Array();
		var current = 0;
		/*

		IMPLEMENT TRIANGULATION HERE

		*/
		active.splice(current, 1);
	}
};

class Entity {
	// A top-level class which is a superclass of almost everything in the game
	constructor({id, position, orientation, scale, hitbox, sprite}) {
		// The unique ID of a given entity
		this.id = id;
		// The position of the entity in the world (should be undefined if entity is not present in the world, i.e. in inventory)
		this.position = position;
		// The direction the entity, in radians (0 = facing right)
		this.orientation = orientation;
		this.scale = scale;
		// The hitbox which is used to calculate collision when the position is not undefined (can also be undefined if the entity will never be present in the world or never collided with)
		this.hitbox = hitbox;
		// This is what is drawn when an entity is in the world
		this.sprite = sprite;
	}
	// Checks collision
	collidingWith(other) {
		// Error detection
		if (!(other instanceof Entity)) { throw new Error(other + " is not an Entity"); }
		// Base cases where either this or the other entity are not present in the world/collidable
		if (this.position === undefined || other.position === undefined || this.hitbox === undefined || other.hitbox === undefined) {return false}
		/*

		IMPLEMET SEPARATING AXIS THEOREM COLLISION HERE ON EACH TRIANGLE IN THE HITBOX

		*/
	}
};

/********************************************************************************************************************************/

// Initialize game content
var agents = new Array();
agents.push(new Player({position: {x: 0, y: 0}, dimensions: {width: 50, height: 50}, velocity: {x: 0, y: 10}}));

/********************************************************************************************************************************/

// GAME LOGIC
function loop() {
	clearCanvas();
	for (var i = 0; i < agents.length; i++) {
		agents[i].update({keyState: keyState, canvas: canvas, context: context});
	}
	window.requestAnimationFrame(loop);
}

/********************************************************************************************************************************/

// START GAME LOOP
loop();