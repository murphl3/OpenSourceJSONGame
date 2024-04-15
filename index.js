// SETUP
const canvas = document.getElementById("gameCanvas");
const context = canvas.getContext("2d")
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
	"arrowup",
	"s",
	"arrowdown",
	"a",
	"arrowleft",
	"d",
	"arrowright",
	" ",
];
canvas.oncontextmenu = function() { return false }
var keyState = new Object();
for (var i = 0; i < initializedKeys.length; i++) {
	keyState[initializedKeys[i]] = false;
}
window.addEventListener('keydown', (event) => {
	keyState[event.key.toLowerCase()] = true;
});
window.addEventListener('keyup', (event) => {
	keyState[event.key.toLowerCase()] = false;
});

/********************************************************************************************************************************/

// CLASSES
class Vector {
	constructor() {}
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
		super()
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
		super()
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
		super()
		this.width = width;
		this.height = height;
	}
	accept(visitor) { return visitor.onRect(this) }
}

class Circle extends Hitbox {
	constructor(radius) {
		if (typeof(radius) !== "number" || radius <= 0) { throw new Error("Invalid Radius: " + radius) }
		super()
		this.radius = radius
	}
	accept(visitor) { return visitor.onCircle(this) }
}

class Location extends Hitbox {
	constructor(x, y, hitbox) {
		if (!(hitbox instanceof Hitbox)) { throw new Error("Location only applies to Hitboxes") }
		super()
		this.position = new CartesianPoint(x, y)
		this.hitbox = hitbox
	}
	accept(visitor) { return visitor.onLocation(this) }
}

class Group extends Hitbox {
	constructor(...hitboxes) {
		if (hitboxes.some((hitbox) => !(hitbox instanceof Hitbox))) { throw new Error("Group may only contain Hitboxes") }
		super()
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
		super()
		this.color = "#FF0000"
		this.outline = "#FFFFFF"
		this.context = context
		this.position = new CartesianPoint(0, 0)
	}
	onRect(rect) {
		var prevStyle = [this.context.fillStyle, this.context.strokeStyle]
		this.context.fillStyle = this.color
		this.context.strokeStyle = this.outline
		this.context.fillRect(this.position.getX(), this.position.getY(), rect.width, rect.height)
		this.context.strokeRect(this.position.getX(), this.position.getY(), rect.width, rect.height)
		this.context.fillStyle = prevStyle[0]
		this.context.strokeStyle = prevStyle[1]
	}
	onCircle(circle) {
		var prevStyle = [this.context.fillStyle, this.context.strokeStyle];
		this.context.fillStyle = this.color
		this.context.strokeStyle = this.outline
		this.context.beginPath()
		this.context.arc (this.position.getX(), this.position.getY(), circle.radius, 0, 2 * Math.PI)
		this.context.fill()
		this.context.stroke()
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

class ListComponents extends Visitor {
	constructor() {
		super()
		this.stack = new Array()
	}
	onRect(rect) {
		let position = new CartesianPoint(0, 0)
		this.stack.forEach(vector => position = position.add(vector))
		return new Array(new Location(position.getX(), position.getY(), rect))
	}
	onCircle(circle) {
		let position = new CartesianPoint(0, 0)
		this.stack.forEach(vector => position = position.add(vector))
		return new Array(new Location(position.getX(), position.getY(), circle))
	}
	onLocation(location) {
		this.stack.push(location.position)
		let output = location.hitbox.accept(this)
		this.stack.pop()
		return output
	}
	onGroup(group) {
		let output = new Array()
		group.hitboxes.forEach((hitbox) => {hitbox.accept(this).forEach((component) => output.push(component))})
		return output
	}
}

class Entity {
	// A top-level class which is a superclass of almost everything in the game
	constructor({id, position, orientation, scale, hitbox, sprite}) {
		this.id = id;
		if (!(position instanceof Vector)) { throw new Error("Position Must be a Vector") }
		this.position = position;
		if (typeof(orientation) !== "number") { throw new Error("Orientation Must be a Number") }
		this.orientation = orientation % (2 * Math.PI);
		if (typeof(scale) !== "number") { throw new Error("Scale Must be a Number") }
		if (scale <= 0) { throw new Error("Scale Must be Greater Than 0") }
		this.scale = scale;
		if (!(hitbox instanceof Hitbox)) { throw new Error("Hitbox Must be a Subclass of Custom Hitbox Class") }
		this.hitbox = hitbox;
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
		let componentFinder = new ListComponents()
		var these = new Location(this.position.getX(), this.position.getY(), this.hitbox).accept(componentFinder)
		var those = new Location(other.position.getX(), other.position.getY(), other.hitbox).accept(componentFinder)
		for (let i = 0; i < these.length; i++) {
			for (let j = 0; j < those.length; j++) {
				if (these[i].hitbox instanceof Circle && those[j].hitbox instanceof Circle) {
					if (these[i].position.subtract(those[j].position).getMagnitude() < these[i].hitbox.radius + those[j].hitbox.radius) { return true }
				} else if (these[i].hitbox instanceof Rect && those[j].hitbox instanceof Rect) {
					let left = these[i].position.getX()
					if (those[j].position.getX() < left) { left = those[j].position.getX() }
					let right = these[i].position.getX() + these[i].hitbox.width
					if (those[j].position.getX() + those[j].hitbox.width > right) { right = those[j].position.getX() + those[j].hitbox.width }
					if (right - left <= these[i].hitbox.width + those[j].hitbox.width) {
						let top = these[i].position.getY()
						if (those[j].position.getY() < top) { top = those[j].position.getY() }
						let bottom = these[i].position.getY() + these[i].hitbox.height
						if (bottom < those[j].position.getY() + those[j].hitbox.height) { bottom = those[j].position.getY() + those[j].hitbox.height }
						if (bottom - top <= these[i].hitbox.height + those[j].hitbox.height) { return true }
					}
				} else if (these[i].hitbox instanceof Circle && those[j].hitbox instanceof Rect || these[i].hitbox instanceof Rect && those[j].hitbox instanceof Circle) {
					var circle = these[i]
					var rect = those[j]
					if (those[j].hitbox instanceof Circle) {
						circle = those[j]
						rect = these[i]
					}
					let closest = new Object()
					if (circle.position.getX() < rect.position.getX()) {closest.x = rect.position.getX()}
					else if (circle.position.getX() > rect.position.getX() + rect.hitbox.width) {closest.x = rect.position.getX() + rect.hitbox.width}
					if (circle.position.getY() < rect.position.getY()) {closest.y = rect.position.getY()}
					else if (circle.position.getY() > rect.position.getY() + rect.hitbox.height) {closest.y = rect.position.getY() + rect.hitbox.height}
					if (closest.x === undefined && closest.y === undefined) { return true }
					if (closest.x === undefined) { closest.x = circle.position.getX() }
					if (closest.y === undefined) { closest.y = circle.position.getY() }
					if (new CartesianPoint(closest.x, closest.y).subtract(circle.position).getMagnitude() < circle.hitbox.radius) { return true }
				}
			}
		}
		return false
	}
	// List all entities this entity is colliding with
	getCollisions() {
		var output = new Array()
		entities.forEach((entity) => {if (entity !== this && this.collidingWith(entity)) {output.push(entity)}})
		return output
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
		let drawTool = new DrawHitboxes(context)
		new Location(this.position.getX(), this.position.getY(), this.hitbox).accept(drawTool)
	}
	// Update the entity according to a set of rules
	update({canvas, context}) {
		this.drawHitbox(context);
	}
};

class Player extends Entity {
	constructor(args) {
		super(args);
		this.speed = 3;
		this.velocity = new PolarPoint(0, 0);
		this.cooldown = 0;
		this.projectile = -1;
	}
	update({canvas, context}) {
		this.drawHitbox(context)
		if (keyState["w"] || keyState["arrowup"]) {
			this.velocity = this.velocity.add(new CartesianPoint(0, -1))
		}
		if (keyState["s"] || keyState["arrowdown"]) {
			this.velocity = this.velocity.add(new CartesianPoint(0, 1))
		}
		if (keyState["a"] || keyState["arrowleft"]) {
			this.velocity = this.velocity.add(new CartesianPoint(-1, 0))
		}
		if (keyState["d"] || keyState["arrowright"]) {
			this.velocity = this.velocity.add(new CartesianPoint(1, 0))
		}
		this.velocity = new PolarPoint(this.velocity.normalize().getMagnitude() * this.speed, this.velocity.getAngle())
		let prevPos = this.position
		this.position = this.position.add(this.velocity)
		if (this.getCollisions().length !== 0) {
			this.position = prevPos
			console.log("Collision!")
		}
		this.velocity = new PolarPoint(0, 0)
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
var levelCreation = true
if (levelCreation) {
	var initialPos = new CartesianPoint(-1, -1)
	var creationState = undefined
	canvas.addEventListener("mousedown", (event) => {
		if (creationState === undefined) {
			switch (event.button) {
				case 0:
				case 2:
					creationState = event.button
					initialPos = mousePos.toCartesianPoint()
					break
				default:
					break
			}
		}
		console.log(initialPos)
	})
	canvas.addEventListener("mouseup", (event) => {
		if (event.button === creationState) {
			switch (creationState) {
				case 0:
					entities.push(new Entity({id: "Level", position: initialPos, orientation: 0.0, scale: 1.0, hitbox: new Rect(mousePos.getX() - initialPos.getX(), mousePos.getY() - initialPos.getY())}))
					creationState = undefined
					initialPos = new CartesianPoint(-1, -1)
					break
				case 2:
					entities.push(new Entity({id: "Level", position: initialPos, orientation: 0.0, scale: 1.0, hitbox: new Circle(mousePos.subtract(initialPos).getMagnitude())}))
					creationState = undefined
					initialPos = new CartesianPoint(-1, -1)
					break
				default:
					break
			}
		}
	})
	levelRenderer = function() {
		var prevStyle = [context.fillStyle, context.strokeStyle];
		switch (creationState) {
			case 0:
				context.strokeStyle = "#0000FF";
				context.strokeRect(initialPos.getX(), initialPos.getY(), mousePos.getX() - initialPos.getX(), mousePos.getY() - initialPos.getY())
				context.stroke()
				break
			case 2:
				context.strokeStyle = "#0000FF";
				context.arc(initialPos.getX(), initialPos.getY(), initialPos.subtract(mousePos).getMagnitude(), 0, 2 * Math.PI)
				context.stroke()
				break
			default:
				break
		}
		context.strokeStyle = "#00FF00";
		context.beginPath()
		context.moveTo(0, 0)
		context.lineTo(mousePos.getX(), mousePos.getY())
		context.lineTo(canvas.width, 0)
		context.stroke()
		context.beginPath()
		context.moveTo(0, canvas.height)
		context.lineTo(mousePos.getX(), mousePos.getY())
		context.lineTo(canvas.width, canvas.height)
		context.stroke()
		context.fillStyle = prevStyle[0];
		context.strokeStyle = prevStyle[1];
	}
}
var entities = new Array();
entities.push(new Player({id: "Player", position: new CartesianPoint(50, 50), orientation: 0.0, scale: 1.0, hitbox: new Group(new Rect(50, 50), new Circle(25))}));
var mousePos = new CartesianPoint(0, 0);
canvas.addEventListener('mousemove', (event) => {
	let canvasData = canvas.getBoundingClientRect()
	mousePos = new CartesianPoint(event.clientX - canvasData.x, event.clientY - canvasData.y)
});

/********************************************************************************************************************************/

// GAME LOGIC
function loop() {
	clearCanvas()
	entities.forEach((entity) => {entity.update({canvas: canvas, context: context})})
	if (levelCreation) {
		levelRenderer()
	}
	window.requestAnimationFrame(loop)
}

/********************************************************************************************************************************/

// START GAME LOOP
loop();