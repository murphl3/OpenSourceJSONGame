// SETUP
const canvas = document.getElementById("gameCanvas")
const context = canvas.getContext("2d")
canvas.width = 1092
canvas.height = 768
function clearCanvas() {
	var prevStyle = [context.fillStyle, context.strokeStyle]
	context.fillStyle = "#000000"
	context.fillRect(0, 0, canvas.width, canvas.height)
	context.fillStyle = prevStyle[0]
	context.strokeStyle = prevStyle[1]
}
clearCanvas()

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
	"escape",
]
canvas.oncontextmenu = function() { return false }
var keyState = new Object()
for (var i = 0; i < initializedKeys.length; i++) {
	keyState[initializedKeys[i]] = false
}
window.addEventListener('keydown', (event) => {
	keyState[event.key.toLowerCase()] = true
})
window.addEventListener('keyup', (event) => {
	keyState[event.key.toLowerCase()] = false
})

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
		return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2))
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
		return new CartesianPoint(this.getX() + other.getX(), this.getY() + other.getY()).toPolarPoint()
	}
	subtract(other) {
		if (!(other instanceof Vector)) { throw new Error("\"subtract\" only accepts Vectors") }
		return new CartesianPoint(this.getX() - other.getX(), this.getY() - other.getY()).toPolarPoint()
	}
}

class Hitbox {
	accept(visitor) { throw new Error("Class Method \"accept\" Not Implemented") }
}

class Rect extends Hitbox {
	constructor(width, height) {
		if (typeof(width) !== "number" || typeof(height) !== "number" || width < 0 || height < 0) { throw new Error("Invalid Width/Height Pair: (" + width + ", " + height + ")") }
		super()
		this.width = width
		this.height = height
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
		var prevStyle = [this.context.fillStyle, this.context.strokeStyle]
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

class BoundingBox extends Visitor {
	constructor() {
		super()
		this.currentPos = new CartesianPoint(0, 0)
		this.left = NaN
		this.right = NaN
		this.top = NaN
		this.bottom = NaN
	}
	onRect(rect) {
		if (isNaN(this.left)) { this.initialize() }
		if (this.currentPos.getX() < this.left) { this.left = this.currentPos.getX() }
		if (this.currentPos.getX() + rect.width > this.right) { this.right = this.currentPos.getX() + rect.width }
		if (this.currentPos.getY() < this.top) { this.top = this.currentPos.getY() }
		if (this.currentPos.getY() + rect.height > this.bottom) { this.bottom = this.currentPos.getY() + rect.height }
		return this.outputCurrent()
	}
	onCircle(circle) {
		if (isNaN(this.left)) { this.initialize() }
		if (this.currentPos.getX() - circle.radius < this.left) { this.left = this.currentPos.getX() - circle.radius }
		if (this.currentPos.getX() + circle.radius > this.right) { this.right = this.currentPos.getX() + circle.radius }
		if (this.currentPos.getY() - circle.radius < this.top) { this.top = this.currentPos.getY() - circle.radius }
		if (this.currentPos.getY() + circle.radius > this.bottom) { this.bottom = this.currentPos.getY() + circle.radius }
		return this.outputCurrent()
	}
	onLocation(location) {
		let prevPos = this.currentPos
		this.currentPos = location.position
		location.hitbox.accept(this)
		this.currentPos = prevPos
		return this.outputCurrent()
	}
	onGroup(group) {
		group.hitboxes.forEach((hitbox) => { hitbox.accept(this) })
		return this.outputCurrent()
	}
	initialize() {
		this.left = this.currentPos.getX()
		this.right = this.currentPos.getX()
		this.top = this.currentPos.getY()
		this.bottom = this.currentPos.getY()
	}
	outputCurrent() {
		return new Location(this.left, this.top, new Rect(this.right - this.left, this.bottom - this.top))
	}
}

class Entity {
	// A top-level class which is a superclass of almost everything in the game
	constructor({id, position, orientation, scale, hitbox, sprite, height}) {
		this.id = id
		if (!(position instanceof Vector)) { throw new Error("Position Must be a Vector") }
		this.position = position
		if (typeof(orientation) !== "number") { throw new Error("Orientation Must be a Number") }
		this.orientation = orientation % (2 * Math.PI)
		if (typeof(scale) !== "number") { throw new Error("Scale Must be a Number") }
		if (scale <= 0) { throw new Error("Scale Must be Greater Than 0") }
		this.scale = scale
		if (!(hitbox instanceof Hitbox)) { throw new Error("Hitbox Must be a Subclass of Custom Hitbox Class") }
		this.hitbox = hitbox
		this.sprite = undefined
		if (sprite !== undefined) {
			this.sprite = new Image()
			this.sprite.src = sprite
		}
		if (height !== undefined && typeof(height) !== "number") { throw new Error("Height Must be a Number") }
		this.height = height
	}
	// Checks collision
	collidingWith(other) {
		// Error detection
		if (!(other instanceof Entity)) { throw new Error(other + " is not an Entity") }
		// Base cases where either this or the other entity are not present in the world/collidable
		if (this.position === undefined || other.position === undefined || this.hitbox === undefined || other.hitbox === undefined) {return false}
		let componentFinder = new ListComponents()
		var these = new Location(this.position.getX(), this.position.getY(), this.hitbox).accept(componentFinder)
		var those = new Location(other.position.getX(), other.position.getY(), other.hitbox).accept(componentFinder)
		for (let i = 0; i < these.length; i++) {
			for (let j = 0; j < those.length; j++) {
				if (these[i].hitbox instanceof Circle && those[j].hitbox instanceof Circle) {
					if (these[i].position.subtract(those[j].position).getMagnitude() < these[i].hitbox.radius + those[j].hitbox.radius) { return these[i], those[j] }
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
						if (bottom - top <= these[i].hitbox.height + those[j].hitbox.height) { return these[i], those[j] }
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
					if (closest.x === undefined && closest.y === undefined) { return these[i], those[j] }
					if (closest.x === undefined) { closest.x = circle.position.getX() }
					if (closest.y === undefined) { closest.y = circle.position.getY() }
					if (new CartesianPoint(closest.x, closest.y).subtract(circle.position).getMagnitude() < circle.hitbox.radius) { return these[i], those[j] }
				}
			}
		}
		return false
	}
	// List all entities this entity is colliding with
	getCollisions() {
		var output = new Array()
		entities.forEach((entity) => {
			let collision = this.collidingWith(entity)
			if (entity !== this && collision) {output.push([entity, collision[0], collision[1]])}}
		)
		return output
	}
	// Draw the Entity
	draw(context) {
		if (context === undefined) { throw new Error("Forgot to include Context") }
		if (this.position === undefined || this.sprite === undefined) { return }
		let boundingBox = new Location(this.position.getX(), this.position.getY(), this.hitbox).accept(new BoundingBox)
		context.drawImage(this.sprite, boundingBox.position.getX(), boundingBox.position.getY(), boundingBox.hitbox.width, boundingBox.hitbox.height)
	}
	// Draw the hitbox of the entity
	drawHitbox(context) {
		if (context === undefined) { throw new Error("Forgot to include Context") }
		let drawTool = new DrawHitboxes(context)
		new Location(this.position.getX(), this.position.getY(), this.hitbox).accept(drawTool)
	}
	// Update the entity according to a set of rules
	update({canvas, context}) {
		this.drawHitbox(context)
		this.draw(context)
	}
	// What to do when an entity hits another entity
	hitBy(other) {
		/* By Default, Do Nothing */
		return
	}
}

class Player extends Entity {
	constructor(args) {
		args.id = "Player"
		super(args)
		this.speed = 3
		this.velocity = new PolarPoint(0, 0)
		this.cooldown = 0
		this.projectileCount = 0
		this.hitpoints = 3
	}
	despawnProjectile() {
		this.projectileCount -= 1
	}
	hitBy(other) {
		switch (other.id) {
			case "Enemy":
				this.hitpoints -= 1

			default:
				break
		}
	}
	update({canvas, context}) {
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
		let collisions = this.getCollisions()
		collisions.forEach((entity) => {entity[0].hitBy(this)})
		if (collisions.some((entity) => { return entity[0].id === "Level" })) {
			this.position = prevPos
		}
		this.velocity = new PolarPoint(0, 0)
		let center = new CartesianPoint(this.position.getX() + 25, this.position.getY() + 25)
		this.orientation = mousePos.subtract(center).getAngle()
		
		if (keyState[" "] && this.cooldown === 0 && this.projectileCount < 5) {
			this.projectileCount += 1
			this.cooldown = 16
			entities.push(new Projectile({id: "PlayerProjectile", position: center.toCartesianPoint(), orientation: this.orientation, scale: 1.0, height: 500}, this))
		}

		if (this.cooldown > 0) {
			this.cooldown -= 1
		}
		this.draw(context)
	}
}

class Enemy extends Entity {
	constructor(args, hitpoints) {
		args.id = "Enemy"
		args.orientation = Math.PI
		args.scale = 1.0
		args.hitbox = new Rect(50, 50)
		args.height = 500
		super(args)
		this.cooldown = 0
		this.hitpoints = hitpoints
		this.velocity = new PolarPoint(3, this.orientation)
	}
	hitBy(other) {
		if (other instanceof Projectile && other.id == "PlayerProjectile") {
			this.hitpoints -= 1
			if (this.hitpoints < 1) { this.despawn() }
		}
	}
	despawn() { entities.splice(entities.findIndex((entity) => this === entity), 1) }
	update({canvas, context}) {
		let prevPos = this.position
		this.position = this.position.add(this.velocity)
		let collisions = this.getCollisions()
		if (this.cooldown > 1) {
			this.collidingWith.cooldown -= 1
		}
		if (this.position.getX() < -50) { this.despawn() }
		if (this.cooldown <= 0 && collisions.some((entity) => entity.id === "Player")) {
			collisions[collisions.findIndex((entity) => entity.id === "Player")].hitBy(this)
			this.hitpoints -= 1
			if (this.hitpoints < 1) { this.despawn(); return }
			this.cooldown = 64
		}
		this.drawHitbox(context)
		this.draw(context)
	}
}

class LevelElement extends Entity {
	constructor(args) {
		args.id = "Level"
		args.orientation = 0.0
		args.scale = 1.0
		super(args)
	}
}

class Projectile extends Entity {
	constructor(args, parent) {
		args.hitbox = new Circle(10)
		super(args)
		this.velocity = new PolarPoint(5, this.orientation)
		this.parent = parent
	}
	despawn() {
		this.parent.despawnProjectile()
		entities.splice(entities.findIndex((entity) => this === entity), 1)
	}
	update({canvas, context}) {
		let collisions = this.getCollisions()
		if (collisions.some((entity) => entity[0].id === "Level" || entity[0].id === "Enemy")) {
			collisions.forEach((entity)=> {entity[0].hitBy(this)})
			this.despawn()
		}
		this.fuse = this.fuse - 1
		this.position = this.position.add(this.velocity)
		this.drawHitbox(context)
		this.draw(context)
	}
}

/********************************************************************************************************************************/

// Initialize game content
var entities = new Array()
var levelCreation = true
if (levelCreation) {
	const defaultEntityCount = 3
	keyState["control"] = false
	keyState["z"] = false
	undo = 0
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
	})
	canvas.addEventListener("mouseup", (event) => {
		if (event.button === creationState) {
			switch (creationState) {
				case 0:
					let width = Math.abs(mousePos.getX() - initialPos.getX())
					let height = Math.abs(mousePos.getY() - initialPos.getY())
					if (mousePos.getX() < initialPos.getX()) {
						initialPos = new CartesianPoint(mousePos.getX(), initialPos.getY())
					}
					if (mousePos.getY() < initialPos.getY()) {
						initialPos = new CartesianPoint(initialPos.getX(), mousePos.getY())
					}
					entities.push(new LevelElement({position: initialPos, hitbox: new Rect(width, height), height: 999}))
					creationState = undefined
					initialPos = new CartesianPoint(-1, -1)
					break
				case 2:
					entities.push(new LevelElement({position: initialPos, hitbox: new Circle(mousePos.subtract(initialPos).getMagnitude()), height: 999}))
					creationState = undefined
					initialPos = new CartesianPoint(-1, -1)
					break
				default:
					break
			}
		}
	})
	levelRenderer = function() {
		var prevStyle = [context.fillStyle, context.strokeStyle]
		context.strokeStyle = "#0000FF"
		switch (creationState) {
			case 0:
				context.strokeRect(initialPos.getX(), initialPos.getY(), mousePos.getX() - initialPos.getX(), mousePos.getY() - initialPos.getY())
				context.stroke()
				break
			case 2:
				context.arc(initialPos.getX(), initialPos.getY(), initialPos.subtract(mousePos).getMagnitude(), 0, 2 * Math.PI)
				context.stroke()
				break
			default:
				break
		}

		context.strokeStyle = "#00FF00"
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
		context.fillStyle = prevStyle[0]
		context.strokeStyle = prevStyle[1]
	}
	editorUpdate = function() {
		if (undo > 0) { undo -= 1 }
		if (keyState["control"] && keyState["z"] && undo === 0 && entities.length > defaultEntityCount) {
			entities.splice(-1, 1)
			undo = 32
		}
		levelRenderer()
	}
}
entities.push(new LevelElement({position: new CartesianPoint(0, 0), hitbox: new Group(
	new Rect(35, 768),
	new Rect(1092, 35),
	new Location(1057, 0, new Rect(35, 768)),
	new Location(0, 733, new Rect(1092, 35))
), sprite: "LevelWalls.png", height: 1000}))
entities.push(new Player({position: new CartesianPoint(50, (canvas.height / 2) - 25), orientation: 0.0, scale: 0.5, hitbox: new Rect(50, 50), sprite: "./Player.png", height: 998}))
var mousePos = new CartesianPoint(0, 0)
canvas.addEventListener('mousemove', (event) => {
	let canvasData = canvas.getBoundingClientRect()
	mousePos = new CartesianPoint(event.clientX - canvasData.x, event.clientY - canvasData.y)
})

/********************************************************************************************************************************/

// GAME LOGIC
var pause = false
pauseCooldown = 0
var EnemyCooldown = 128
function loop() {
	if (pause) {
		if (pauseCooldown <= 0) {
			if (keyState["escape"]) {
				pause = false
				pauseCooldown = 32
			}
		} else {
			pauseCooldown -= 1
		}
	} else {
		EnemyCooldown -= 1
		if (EnemyCooldown <= 0) {
			entities.push(new Enemy({position: new CartesianPoint(canvas.width, (Math.random() * (canvas.height - 105)) + 35)}, Math.floor(Math.random() * 3)))
			EnemyCooldown = (Math.floor((Math.random() * 32)) + 32)
		}
		sortedEntities = entities.toSorted((a, b) => (a.height - b.height))
		clearCanvas()
		sortedEntities.forEach((entity) => {entity.update({canvas: canvas, context: context})})
		if (levelCreation) {
			editorUpdate()
		}
		if (pauseCooldown <= 0) {
			if (keyState["escape"]) {
				var prevStyle = [context.fillStyle, context.strokeStyle]
				context.fillStyle = "rgba(0, 0, 0, 0.5)"
				context.fillRect(0, 0, canvas.width, canvas.height)
				context.fillStyle = prevStyle[0]
				context.strokeStyle = prevStyle[1]
				pause = true
				pauseCooldown = 32
			}
		} else {
			pauseCooldown -= 1
		}
	}
	window.requestAnimationFrame(loop)
}

/********************************************************************************************************************************/

// START GAME LOOP
loop()