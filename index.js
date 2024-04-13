// SETUP
const canvas = document.getElementById("gameCanvas");
const context = canvas.getContext("2d");
canvas.width = 768;
canvas.height = 768;
function clearCanvas() {
	var prevStyle = [context.fillStyle, context.strokeStyle];
	context.fillStyle = "#000000";
	context.fillRect(0, 0, canvas.width, canvas.height);
	context.fillStyle = prevStyle[0];
	context.strokeStyle = prevStyle[1];
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
	"ArrowRight",
	" ",
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
class Vector extends Hitbox {
	getX() { throw new Error("Class Method \"getX\" Not Implemented") }
	getY() { throw new Error("Class Method \"getY\" Not Implemented") }
	getMagnitude() { throw new Error("Class Method \"getMagnitude\" Not Implemented") }
	getAngle() { throw new Error("Class Method \"getAngle\" Not Implemented") }
	toPolarPoint() { throw new Error("Class Method \"toPolarPoint\" Not Implemented") }
	toCartesianPoint() { throw new Error("Class Method \"toCartesianPoint\" Not Implemented") }
	invert() { throw new Error("Class Method \"invert\" Not Implemented") }
	normalize() { throw new Error("Class Method \"normalize\" Not Implemented") }
	add(other) { throw new Error("Class Method \"add\" Not Implemented") }
	subtract(other) { throw new Error("Class Method \"subtract\" Not Implemented") }
}

class CartesianPoint extends Vector {
	// A cartesian coordinate representing a vector
	constructor(x, y) {
		if (typeof(x) !== "number" || typeof(y) !== "number" || isNaN(x) || !isFinite(x) || isNaN(y) || !isFinite(y)) {
			throw new Error("Invalid Cartesian Coordinate: (" + x + ", " + y + ")")
		}
		this.x = x
		this.y = y
	}
	getX() {
		return this.x
	}
	getY() {
		return this.y
	}
	getMagnitude() {
		return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
	}
	getAngle() {
		return Math.atan2(this.y, this.x)
	}
	toPolarPoint() {
		return new PolarPoint(this.getMagnitude(), this.getAngle())
	}
	toCartesianPoint() {
		return new CartesianPoint(this.x, this.y)
	}
	invert() {
		return new CartesianPoint(-1 * this.x, -1 * this.y)
	}
	normalize() {
		let magnitude = this.getMagnitude()
		if (magnitude < 1) {
			return this.toCartesianPoint()
		}
		return new CartesianPoint(this.x / magnitude, this.y / magnitude)
	}
	add(other) {
		if (!(other instanceof Vector)) { throw new Error("\"add\" only accepts Vectors") }
		return new CartesianPoint(this.x + other.getX(), this.y + other.getY())
	}
	subtract(other) {
		if (!(other instanceof Vector)) { throw new Error("\"subtract\" only accepts Vectors") }
		return new CartesianPoint(this.x - other.getX(), this.y - other.getY())
	}
}

class PolarPoint extends Vector {
	// A polar coordinate representing a vector with an angle betwwn 0 and 2pi, corrected so the magnitude is always positive
	constructor(magnitude, angle) {
		if (typeof(magnitude) !== "number" || typeof(angle) !== "number" || isNaN(magnitude) || !isFinite(magnitude) || isNaN(angle) || !isFinite(angle)) {
			throw new Error("Invalid Polar Coordinate: (" + magnitude + ", " + angle + ")")
		}
		this.magnitude = magnitude
		this.angle = angle
		if (this.magnitude < 0) {
			this.magnitude *= -1
			this.angle += (2 * Math.PI)
		}
		this.angle = this.angle % (2 * Math.PI)
	}
	getX() {
		return this.magnitude * Math.cos(this.angle)
	}
	getY() {
		return this.magnitude * Math.sin(this.angle)
	}
	getMagnitude() {
		return this.magnitude
	}
	getAngle() {
		return this.angle
	}
	toPolarPoint() {
		return new PolarPoint(this.magnitude, this.angle)
	}
	toCartesianPoint() {
		return new CartesianPoint(this.getX(), this.getY())
	}
	invert() {
		return new PolarPoint(this.magnitude, this.angle + Math.PI)
	}
	normalize() {
		if (this.magnitude < 1) {
			return new PolarPoint(this.magnitude, this.angle)
		}
		return new PolarPoint(1, this.angle)
	}
	add(other) {
		if (!(other instanceof Vector)) { throw new Error("\"add\" only accepts Vectors") }
		return new CartesianPoint(this.getX() + other.getX(), this.getY() + other.getY()).toPolarPoint();
	}
	subtract(other) {
		if (!(other instanceof Vector)) { throw new Error("\"subtract\" only accepts Vectors") }
		return new CartesianPoint(this.getX() - other.getX(), this.getY() - other.getY()).toPolarPoint();
	}
}

class Hitbox {
	accept(visitor) { throw new Error("Class Method \"accept\" Not Implemented") }
}

class Rect extends Hitbox {
	constructor(width, height) {
		if (typeof(width) !== "number" || typeof(height) !== "number" || width < 0 || height < 0) { throw new Error("Invalid Width/Height Pair: (" + width + ", " + height + ")") }
		this.width = width;
		this.height = height;
	}
	accept(visitor) { return visitor.onRect(this) }
}

class Circle extends Hitbox {
	constructor(radius) {
		if (typeof(radius) !== "number" || radius <= 0) { throw new Error("Invalid Radius: " + radius) }
		this.radius = radius
	}
	accept(visitor) { return visitor.onCircle(this) }
}

class Location extends Hitbox {
	constructor(x, y, hitbox) {
		if (!(hitbox instanceof Hitbox)) { throw new Error("Location only applies to Hitboxes") }
		this.position = new CartesianPoint(x, y)
		this.hitbox = hitbox
	}
	accept(visitor) { return visitor.onLocation(this) }
}

class Group extends Hitbox {
	constructor(...hitboxes) {
		if (hitboxes.some((hitbox) => !(hitbox instanceof Hitbox))) { throw new Error("Group may only contain Hitboxes") }
		this.hitboxes = [...hitboxes]
	}
	accept(visitor) { return visitor.onGroup(this) }
}

class Visitor {
	onRect(rect) { throw new Error("Class Method \"onRect\" Not Implemented") }
	onCircle(circle) { throw new Error("Class Method \"onCircle\" Not Implemented") }
	onLocation(location) { throw new Error("Class Method \"onLocation\" Not Implemented") }
	onGroup(group) { throw new Error("Class Method \"onGroup\" Not Implemented") }
}

class DrawHitboxes extends Visitor {
	constructor(context) {
		this.context = context
		this.position = new CartesianPoint(0, 0)
	}
	onRect(rect) {
		var prevStyle = [this.context.fillStyle, this.context.strokeStyle]
		this.context.fillStyle = "#FF0000"
		this.context.fillRect(this.position.getX(), this.position.getY(), rect.width, rect.height)
		this.context.fillStyle = prevStyle[0]
		this.context.strokeStyle = prevStyle[1]
	}
	onCircle(circle) {
		var prevStyle = [this.context.fillStyle, this.context.strokeStyle];
		this.context.fillStyle = "#FF0000"
		this.context.beginPath()
		this.context.arc (this.position.getX(), this.position.getY(), circle.radius, 0, 2 * Math.PI)
		this.context.fill()
		this.context.fillStyle = prevStyle[0]
		this.context.strokeStyle = prevStyle[1]
	}
	onLocation(location) {
		let prevPosition = this.position
		this.position = location.position
		location.hitbox.accept(this)
		this.position = prevPosition
	}
	onGroup(group) {
		group.hitboxes.forEach(hitbox => hitbox.accept(this))
	}
}

class Entity {
	// A top-level class which is a superclass of almost everything in the game
	constructor({id, position, orientation, scale, hitbox, sprite}) {
		// The unique ID of a given entity
		this.id = id;
		// The position of the entity in the world (should be undefined if entity is not present in the world, i.e. in inventory)
		this.position = position;
		// The direction the entity, in radians (0 = facing right)
		this.orientation = orientation;
		// The scale of the entity
		this.scale = scale;
		// The hitbox which is used to calculate collision when the position is not undefined (can also be undefined if the entity will never be present in the world or never collided with)
		this.hitbox = hitbox;
		// This is what is drawn when an entity is in the world
		this.sprite = sprite;
		// Log the entity for debugging
		console.log(this);
	}
	// Checks collision
	collidingWith(other) {
		// Error detection
		if (!(other instanceof Entity)) { throw new Error(other + " is not an Entity"); }
		// Base cases where either this or the other entity are not present in the world/collidable
		if (this.position === undefined || other.position === undefined || this.hitbox === undefined || other.hitbox === undefined) {return false}
		// TODO: IMPLEMENT COLLISION
	}
	// Draw the Entity
	draw(context) {
		if (this.position === undefined) { return; }
		context.drawImage(this.sprite.getImage(), this.position.x, this.position.y)
		/*

		TODO ADD A SPRITE CLASS AND ADJUST IMAGE FOR ORIENTATION (SPRITE CLASS ALLOWS FOR ANIMATION)

		*/
	}
	// Draw the hitbox of the entity
	drawHitbox(context) {
		var prevStyle = [context.fillStyle, context.strokeStyle, context.lineWidth];
		context.strokeStyle = "#FF0000";
		context.lineWidth = 2;
		for (let i = 0; i < this.hitbox.points.length; i++) {
			context.beginPath();
			context.moveTo(this.hitbox.points[i].x + this.position.x, this.hitbox.points[i].y + this.position.y);
			context.lineTo(this.hitbox.points[(i + 1) % this.hitbox.points.length].x + this.position.x, this.hitbox.points[(i + 1) % this.hitbox.points.length].y + this.position.y);
			context.stroke();
		}
		context.fillStyle = prevStyle[0];
		context.strokeStyle = prevStyle[1];
		context.lineWidth = prevStyle[2];
	}
	// Update the entity according to a set of rules
	update({canvas, context}) {
		this.drawHitbox(context);
	}
};

class Player extends Entity {
	constructor(args) {
		super(args);
		this.velocity = new Point(0, 0);
		this.cooldown = 0;
		this.projectile = -1;
	}
	update({keyState, canvas, context, entities}) {
		var up = (keyState["w"] || keyState ["W"] || keyState["ArrowUp"]);
		var down = (keyState["s"] || keyState ["S"] || keyState["ArrowDown"]);
		var left = (keyState["a"] || keyState ["A"] || keyState["ArrowLeft"]);
		var right = (keyState["d"] || keyState ["D"] || keyState["ArrowRight"]);
		if (up && down) {
			up = false;
			down = false;
		}
		if (left && right) {
			left = false;
			right = false;
		}
		if (up) {
			if (right) {
				this.velocity.x = 2.121;
				this.velocity.y = -2.121;
			} else if (left) {
				this.velocity.x = -2.121;
				this.velocity.y = -2.121;
			} else {
				this.velocity.x = 0;
				this.velocity.y = -3;
			}
		} else if (down) {
			if (right) {
				this.velocity.x = 2.121;
				this.velocity.y = 2.121;
			} else if (left) {
				this.velocity.x = -2.121;
				this.velocity.y = 2.121;
			} else {
				this.velocity.x = 0;
				this.velocity.y = 3;
			}
		} else if (left) {
			this.velocity.x = -3;
			this.velocity.y = 0;
		} else if (right) {
			this.velocity.x = 3;
			this.velocity.y = 0;
		} else {
			this.velocity.x = 0;
			this.velocity.y = 0;
		}
		if (keyState[" "] && this.cooldown === 0) {
		    this.cooldown = 64
            entities.push(new Projectile({id: "projectile", position: new Point(this.position.x, this.position.y), orientation: this.orientation, scale: this.scale}))
            this.projectile = entities.length - 1;
		}
		if (this.cooldown > 0) {
		    this.cooldown--;
		}
		if (this.cooldown === 0 && this.projectile !== -1) {
		    entities.splice(this.projectile, 1);
		    this.projectile = -1;
		}
		this.position.set(this.position.x + this.velocity.x, this.position.y + this.velocity.y);
		this.orientation = this.position.getDirection(mousePos);
		this.drawHitbox(context);

		var prevStyle = [context.fillStyle, context.strokeStyle, context.lineWidth];
        context.strokeStyle = "#00FF00";
        context.lineWidth = 2;
        context.arc(this.position.x, this.position.y, 64 * 5 * this.scale, 0, 2 * Math.PI);
        context.fillStyle = prevStyle[0];
        context.strokeStyle = prevStyle[1];
        context.lineWidth = prevStyle[2];
	}
};

class Projectile extends Entity {
    constructor(args) {
        args.hitbox = new Hitbox(new Point(-5, 0), new Point(0, 5), new Point(5, 0), new Point(0, -5));
        super(args);
    }
    update({canvas, context}) {
        let new_position = new Vector(1, this.orientation).toPoint();
        this.position.set(this.position.x + (new_position.x * 5 * this.scale), this.position.y + (new_position.y * 5 * this.scale));
        this.drawHitbox(context);
	}
};

/********************************************************************************************************************************/

// Initialize game content
var entities = new Array();
entities.push(new Player({id: "Player", position: new Point(50, 50), orientation: 0.0, scale: 1.0, hitbox: new Hitbox(new Point(-25, -25), new Point(25, -25), new Point(25, 25), new Point(-25, 25))}));
var mousePos = new Point(0, 0);
canvas.addEventListener('mousemove', (event) => {
    mousePos.set(event.clientX, event.clientY);
});

/********************************************************************************************************************************/

// GAME LOGIC
function loop() {
	clearCanvas();
	for (var i = 0; i < entities.length; i++) {
		entities[i].update({keyState: keyState, canvas: canvas, context: context, entities: entities});
	}
	window.requestAnimationFrame(loop);
}

/********************************************************************************************************************************/

// START GAME LOOP
loop();