const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');
// SETUP
canvas.width = 1500;
canvas.height = 900;
function clearCanvas() {
	context.fillStyle = '#000000';
	context.fillRect(0, 0, canvas.width, canvas.height);
}
clearCanvas();
// CLASSES
class entity {
	constructor({id, position, size}) {
		this.id = id;
		this.position = position;
		this.velocity = {x: 0, y: 0};
		this.size = size;
		console.log(this);
	}
	draw() {
		context.fillStyle = '#FF0000';
		context.fillRect(this.position.x, this.position.y, this.size.width, this.size.height);
	}
	update() {
		this.position.x += this.velocity.x;
		this.position.y += this.velocity.y;
		if (this.position.x > canvas.width + 1) {
			this.position.x = 0 - this.size.width;
		} else if (this.position.x < 0 - this.size.width - 1) {
			this.position.x = canvas.width;
		}
		if (this.position.y > canvas.height + 1) {
			this.position.y = 0 - this.size.height;
		} else if (this.position.y < 0 - this.size.height - 1) {
			this.position.y = canvas.height;
		}
		// console.log(this);
		this.draw();
	}
	collides(that) {
		// ADD BASIC COLLISION LOGIC
		return false;
	}
}
// MORE SETUP
const player = new entity({id: 'entity1', position: {x: 0, y: 0}, size: {width: 75, height: 75}});
window.addEventListener('keydown', (event) => {
	switch(event.key) {
		case 'w':
		case 'ArrowUp':
			console.log('Up');
			player.velocity.y = -3;
			break;
		case 'a':
			player.velocity.x = -3;
		case 'ArrowLeft':
			break;
		case 's':
		case 'ArrowDown':
			player.velocity.y = 3;
			break;
		case 'd':
		case 'ArrowRight':
			player.velocity.x = 3;
			break;
		default:
			break;
	}
})
window.addEventListener('keyup', (event) => {
	switch(event.key) {
		case 'w':
		case 'ArrowUp':
			player.velocity.y = 0;
			break;
		case 'a':
		case 'ArrowLeft':
			player.velocity.x = 0;
			break;
		case 's':
		case 'ArrowDown':
			player.velocity.y = 0;
			break;
		case 'd':
		case 'ArrowRight':
			player.velocity.x = 0;
			break;
		default:
			break;
	}
})

const entity2 = new entity({id: 'entity2', position: {x: 100, y: 100}, size: {width: 75, height: 75}});
// GAME LOGIC
const collisionEntities = [player, entity2]; // Used for collision detection
const drawables = [player, entity2]; // Used for screen drawing

entity2.velocity = {x: 3, y: 4};

function loop() {
	clearCanvas();
	var ptr = 0, len = drawables.length;
	while (ptr < len) {
		drawables[ptr].update();
		ptr++;
	}
	ptr = 0, len = collisionEntities.length;
	while (ptr < len) {
		var ptr2 = ptr + 1
		while (ptr2 < len) {
			if (collisionEntities[ptr].collides(collisionEntities[ptr2])) {
				console.log('Collision');
			}
		}
	}
	window.requestAnimationFrame(loop)
}
// START GAME LOOP
loop();