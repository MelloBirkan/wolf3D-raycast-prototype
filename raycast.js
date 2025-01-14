const TILE_SIZE = 64;
const MAP_NUM_ROWS = 11;
const MAP_NUM_COLS = 15;
const WINDOW_WIDTH = MAP_NUM_COLS * TILE_SIZE;
const WINDOW_HEIGHT = MAP_NUM_ROWS * TILE_SIZE;
const DARK_GRAY = "#222";
const WHITE = "#fff";
const FOV = 60 * (Math.PI / 180);
const WALL_STRIP_WIDTH = 1;
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
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
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

    return (
      gridX >= 0 &&
      gridX < MAP_NUM_COLS &&
      gridY >= 0 &&
      gridY < MAP_NUM_ROWS &&
      this.grid[gridY][gridX] === 0
    );
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
    // stroke("red");
    // line(this.x, this.y, this.x + (30 * Math.cos(this.rotationAngle)), this.y + 30 * Math.sin(this.rotationAngle));
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
    this.rayAngle = normalizeAngle(rayAngle);
    this.wallHitX = 0;
    this.wallHitY = 0;
    this.distance = 0;
    this.wasHitVertical = false;

    this.isRayFacingDown = this.rayAngle > 0 && this.rayAngle < Math.PI;
    this.isRayFacingUp = !this.isRayFacingDown;
    this.isRayFacingRight =
      this.rayAngle < Math.PI / 2 || this.rayAngle > (3 * Math.PI) / 2;
    this.isRayFacingLeft = !this.isRayFacingRight;
  }

  cast(columnId) {
    let xIntercept, yIntercept;
    let xStep, yStep;

    ////////////////////////////////////////////////////////////
    ///////////////////HORIZONTAL CHECK/////////////////////////
    ////////////////////////////////////////////////////////////
    let foundHorzWallHit = false;
    let horzWallHitX = 0;
    let horzWallHitY = 0;

    yIntercept = Math.floor(player.y / TILE_SIZE) * TILE_SIZE;
    yIntercept += this.isRayFacingDown ? TILE_SIZE : 0;
    xIntercept = player.x + (yIntercept - player.y) / Math.tan(this.rayAngle);

    yStep = TILE_SIZE;
    yStep *= this.isRayFacingUp ? -1 : 1;

    xStep = TILE_SIZE / Math.tan(this.rayAngle);
    xStep *= (this.isRayFacingLeft && xStep > 0) || (this.isRayFacingRight && xStep < 0) ? -1 : 1;

    let nextHorzTouchX = xIntercept;
    let nextHorzTouchY = yIntercept;

    if (this.isRayFacingUp) {
      nextHorzTouchY--;
    }

    while (
      nextHorzTouchX >= 0 &&
      nextHorzTouchX <= WINDOW_WIDTH &&
      nextHorzTouchY >= 0 &&
      nextHorzTouchY <= WINDOW_HEIGHT
    ) {
      if (!grid.isWalkable(nextHorzTouchX, nextHorzTouchY)) {
        foundHorzWallHit = true;
        horzWallHitX = nextHorzTouchX;
        horzWallHitY = nextHorzTouchY;
        break;
      } else {
        nextHorzTouchX += xStep;
        nextHorzTouchY += yStep;
      }
    }

    ////////////////////////////////////////////////////////////
    ///////////////////VERTICAL CHECK///////////////////////////
    ////////////////////////////////////////////////////////////
    let foundVertWallHit = false;
    let vertWallHitX = 0;
    let vertWallHitY = 0;

    xIntercept = Math.floor(player.x / TILE_SIZE) * TILE_SIZE;
    xIntercept += this.isRayFacingRight ? TILE_SIZE : 0;
    yIntercept = player.y + (xIntercept - player.x) * Math.tan(this.rayAngle);

    xStep = TILE_SIZE;
    xStep *= this.isRayFacingLeft ? -1 : 1;

    yStep = TILE_SIZE * Math.tan(this.rayAngle);
    yStep *= (this.isRayFacingUp && yStep > 0) || (this.isRayFacingDown && yStep < 0) ? -1 : 1;

    let nextVertTouchX = xIntercept;
    let nextVertTouchY = yIntercept;

    if (this.isRayFacingLeft) {
      nextVertTouchX--;
    }

    while (
      nextVertTouchX >= 0 &&
      nextVertTouchX <= WINDOW_WIDTH &&
      nextVertTouchY >= 0 &&
      nextVertTouchY <= WINDOW_HEIGHT
    ) {
      if (!grid.isWalkable(nextVertTouchX, nextVertTouchY)) {
        foundVertWallHit = true;
        vertWallHitX = nextVertTouchX;
        vertWallHitY = nextVertTouchY;
        break;
      } else {
        nextVertTouchX += xStep;
        nextVertTouchY += yStep;
      }
    }
    let horzHitDistance = foundHorzWallHit
      ? distanceBetweenPoints(player.x, player.y, horzWallHitX, horzWallHitY)
      : Infinity;
    let vertHitDistance = foundVertWallHit
      ? distanceBetweenPoints(player.x, player.y, vertWallHitX, vertWallHitY)
      : Infinity;

    this.wallHitX =
      horzHitDistance < vertHitDistance ? horzWallHitX : vertWallHitX;
    this.wallHitY =
      horzHitDistance < vertHitDistance ? horzWallHitY : vertWallHitY;
    this.distance =
      horzHitDistance < vertHitDistance ? horzHitDistance : vertHitDistance;
    this.wasHitVertical = vertHitDistance < horzHitDistance;
  }

  render() {
    stroke("rgba(255, 124, 255, 0.7)");
    line(
      player.x,
      player.y,
      this.wallHitX,
      this.wallHitY
    );
  }
}

function distanceBetweenPoints(x1, y1, x2, y2) {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

function normalizeAngle(angle) {
  angle = angle % (2 * Math.PI);
  if (angle < 0) {
    angle += 2 * Math.PI;
  }
  return angle;
}

// ---------------------------------------------------------------------------------------------------------------------

let grid = new Map();
let player = new Player();
let rays = [];

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
  let rayAngle = player.rotationAngle - FOV / 2;
  rays = [];

  for (let i = 0; i < NUM_RAYS; ++i) {
    let ray = new Ray(rayAngle);
    ray.cast(columnId);
    rays.push(ray);

    rayAngle += FOV / NUM_RAYS;
    columnId++;
  }
}

function setup() {
  createCanvas(WINDOW_WIDTH, WINDOW_HEIGHT);
}

function update() {
  player.update();
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
