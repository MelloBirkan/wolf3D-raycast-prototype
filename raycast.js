const TILE_SIZE = 32;
const MAP_NUM_ROWS = 11;
const MAP_NUM_COLS = 15;
const WINDOW_WIDTH = MAP_NUM_COLS * TILE_SIZE;
const WINDOW_HEIGHT = MAP_NUM_ROWS * TILE_SIZE;
const DARK_GRAY = "#222";
const WHITE = "#fff";
const FOV = 60 * (Math.PI / 180);
const WALL_STRIP_WIDTH = 10;
const NUM_RAYS = WINDOW_WIDTH / WALL_STRIP_WIDTH;

class Map {
  constructor() {
    this.grid = [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
      [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1],
      [1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1],
      [1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ];
  }

  render() {
    for (let i = 0; i < MAP_NUM_ROWS; i++) {
      for (let j = 0; j < MAP_NUM_COLS; j++) {
        let tileX = j * TILE_SIZE;
        let tileY = i * TILE_SIZE;
        let tileColor = this.grid[i][j] === 1 ? DARK_GRAY : WHITE;
        stroke(DARK_GRAY);
        fill(tileColor);
        rect(tileX, tileY, TILE_SIZE, TILE_SIZE);
      }
    }
  }

  isWalkable(x, y) {
    const gridX = Math.floor(x / TILE_SIZE);
    const gridY = Math.floor(y / TILE_SIZE);

    return gridX > 0 && gridX < MAP_NUM_COLS && gridY > 0 && gridY < MAP_NUM_ROWS && this.grid[gridY][gridX] === 0;
  }
}

class Player {
  constructor() {
    this.x = WINDOW_WIDTH / 2;
    this.y = WINDOW_HEIGHT / 2;
    this.radius = 10;
    this.turnDirection = 0; // -1 left or +1 right
    this.walkDirection = 0; // -1 back or +1 front
    this.rotationAngle = Math.PI / 2;
    this.moveSpeed = 2.0;
    this.rotationSpeed = 2 * (Math.PI / 180);
  }

  render() {
    noStroke();
    fill("red");
    circle(this.x, this.y, this.radius);
    stroke("red");
    line(this.x, this.y, this.x + (30 * Math.cos(this.rotationAngle)), this.y + 30 * Math.sin(this.rotationAngle));
  }

  update() {
    this.rotationAngle += this.turnDirection * this.rotationSpeed;

    let moveStep = this.walkDirection * this.moveSpeed;
    let nextX = this.x + moveStep * Math.cos(this.rotationAngle);
    let nextY = this.y + moveStep * Math.sin(this.rotationAngle);

    if (grid.isWalkable(nextX, nextY)) {
      this.x = nextX;
      this.y = nextY;
    }
  }
}

class Ray {
  constructor(rayAngle) {
    this.rayAngle = rayAngle;
  }

  render() {
    stroke("rgba(255, 124, 255, 0.3)");
    line(player.x, player.y, player.x + (30 * Math.cos(this.rayAngle)), player.y + 30 * Math.sin(this.rayAngle));
  }
}

// ---------------------------------------------------------------------------------------------------------------------

let grid = new Map();
let player = new Player();
let rays = []

function keyPressed() {
  if (keyCode === LEFT_ARROW) {
    player.turnDirection = -1;
  } else if (keyCode === RIGHT_ARROW) {
    player.turnDirection = +1;
  } else if (keyCode === UP_ARROW) {
    player.walkDirection = +1;
  } else if (keyCode === DOWN_ARROW) {
    player.walkDirection = -1;
  } else {
    console.log("Unknown key pressed");
  }
}

function keyReleased() {
  if (keyCode === LEFT_ARROW || keyCode === RIGHT_ARROW) {
    player.turnDirection = 0;
  } else if (keyCode === UP_ARROW || keyCode === DOWN_ARROW) {
    player.walkDirection = 0;
  }
}

function castAllRays() {
  let columnId = 0;
  let rayAngle = player.rotationAngle - (FOV / 2);
  rays = [];

  // for (let i = 0; i < NUM_RAYS; ++i) {
  for (let i = 0; i < 1; ++i) {
      let ray = new Ray(rayAngle);
      // ray.cast();
      rays.push(ray);

      rayAngle += FOV / NUM_RAYS;

      columnId++;
  }
}

function setup() {
  createCanvas(WINDOW_WIDTH, WINDOW_HEIGHT);

}

function update() {
  player.update()
  castAllRays();
}

function draw() {
  update();
  grid.render();
  for (ray of rays) {
    ray.render();
  }
  player.render();
}




